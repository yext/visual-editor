import { defineCatalog, defineSchema } from "@json-render/core";
import type { Config, Fields, Permissions } from "@puckeditor/core";
import { z } from "zod";
import { mainContentDisallowedComponents } from "../components/helpers/MainContent.tsx";
import type { LayoutGenerationMetadata } from "../fields/fields.ts";
import {
  inferGenerationSchema,
  type FieldOmission,
} from "../internal/layoutGeneration/schema/inferGenerationSchema.ts";
import {
  normalizeGenerationFields,
  validateSingleChildSlots,
} from "../internal/layoutGeneration/schema/normalizeGenerationFields.ts";
import {
  restrictSlottedItemSourceFields,
  validateSlottedItemSourceContract,
} from "../internal/layoutGeneration/schema/slottedItemSourceSchema.ts";
import { mainContentDescription } from "../internal/layoutGeneration/schemaGuidance.ts";

export type GenerationComponent = {
  generation?: LayoutGenerationMetadata & { props: z.ZodObject };
  description?: string;
  fields?: Fields;
  defaultProps?: Record<string, unknown>;
  nestedOnly?: boolean;
  /** Static editor permissions checked before planning component changes. */
  permissions?: Partial<Permissions>;
};

type GenerationComponentInput = Omit<GenerationComponent, "generation"> & {
  layoutGenerationMetadata?: LayoutGenerationMetadata;
};

const emptyProps = z.object({});

const puckSchema = defineSchema((s) => ({
  spec: s.object({
    content: s.array(
      s.object({
        type: s.ref("catalog.components"),
        props: s.record(s.any()),
      })
    ),
  }),
  catalog: s.object({
    components: s.map({
      props: s.zod(),
      description: s.string(),
      fields: s.any(),
    }),
  }),
}));

/** Contracts belong to registered Puck components, including hidden slot children. */
export const createPuckGenerationCatalog = (
  components: Record<string, GenerationComponentInput>,
  options: {
    rootAllowedComponentIds?: string[];
    /** Prompt guidance for fresh generation; explicit user requests take precedence. */
    defaultGenerationSectionIds?: string[];
  } = {}
) => {
  const entries: Record<string, GenerationComponentInput> = {
    MainContent: {
      layoutGenerationMetadata: {
        props: z.object({ content: z.array(z.unknown()) }),
      },
      fields: {
        content: {
          type: "slot",
          disallow: [
            ...mainContentDisallowedComponents,
            ...Object.keys(components).filter(
              (name) => components[name].nestedOnly
            ),
          ],
        },
      },
      defaultProps: { content: [] },
      description: mainContentDescription,
    },
    ...components,
  };

  const fieldOmissions: FieldOmission[] = [];

  const catalog = defineCatalog(puckSchema, {
    components: Object.fromEntries(
      Object.entries(entries).map(
        ([name, { layoutGenerationMetadata, ...component }]) => {
          const metadata = layoutGenerationMetadata;

          const fields = normalizeGenerationFields(component.fields);

          validateSingleChildSlots(name, fields, !!metadata?.slottedItemSource);

          const generation = metadata?.exclude
            ? undefined
            : metadata?.props
              ? (metadata as LayoutGenerationMetadata & { props: z.ZodObject })
              : {
                  ...metadata,
                  props: inferGenerationSchema(
                    name,
                    fields,
                    component.defaultProps,
                    metadata,
                    fieldOmissions
                  ),
                };

          return [
            name,
            {
              ...component,
              generation,
              fields,
              description:
                [component.description, metadata?.instructions]
                  .filter(Boolean)
                  .join("\n") || undefined,
              // JSON Render adapter; generation.props remains the single schema source.
              get props(): z.ZodObject {
                return this.generation?.props ?? emptyProps;
              },
            },
          ];
        }
      )
    ),
  });

  for (const [name, component] of Object.entries(catalog.data.components)) {
    validateSlottedItemSourceContract(name, component, catalog.data.components);
    component.fields = restrictSlottedItemSourceFields(
      component.fields,
      component.generation?.slottedItemSource
    );
  }

  return Object.assign(catalog, { puckOptions: options, fieldOmissions });
};

export type PuckGenerationCatalog = ReturnType<
  typeof createPuckGenerationCatalog
>;

export const generationCatalogs = new WeakMap<object, PuckGenerationCatalog>();

/** Associate contracts with a config. Optional root page-area metadata constrains
 * MainContent identically in the editor and generator, without changing saved data. */
export const withGenerationCatalog = <T extends Config>(
  config: T,
  catalog: PuckGenerationCatalog
): T => {
  const pageContent = config.root?.metadata?.pageContentAllowedComponentIds;
  let configured = config;
  let configuredCatalog = catalog;
  if (
    Array.isArray(pageContent) &&
    pageContent.every((id) => typeof id === "string")
  ) {
    const allow = [...new Set<string>(pageContent)].filter(
      (id) =>
        Object.hasOwn(config.components, id) &&
        !mainContentDisallowedComponents.includes(id)
    );
    const constrainContent = (fields: Fields | undefined): Fields => {
      if (fields?.content?.type !== "slot") return fields ?? {};
      // Puck treats allow as exceptions to disallow when both are present.
      // A page-area whitelist must replace the original blacklist entirely.
      return {
        ...fields,
        content: { ...fields.content, allow, disallow: undefined },
      };
    };
    if (config.components.MainContent) {
      configured = {
        ...config,
        components: {
          ...config.components,
          MainContent: {
            ...config.components.MainContent,
            fields: constrainContent(config.components.MainContent.fields),
          },
        },
      } as T;
    }
    const mainContent = catalog.data.components.MainContent;
    const rootAllowed = config.root?.metadata?.rootAllowedComponentIds;
    // Preserve catalog type-inference getters without evaluating them while copying.
    configuredCatalog = Object.create(Object.getPrototypeOf(catalog), {
      ...Object.getOwnPropertyDescriptors(catalog),
      data: {
        value: {
          ...catalog.data,
          components: {
            ...catalog.data.components,
            ...(mainContent
              ? {
                  MainContent: {
                    ...mainContent,
                    fields: constrainContent(mainContent.fields),
                  },
                }
              : {}),
          },
        },
        enumerable: true,
        configurable: true,
      },
      puckOptions: {
        value: {
          ...catalog.puckOptions,
          ...(Array.isArray(rootAllowed) &&
          rootAllowed.every((id) => typeof id === "string")
            ? {
                rootAllowedComponentIds: rootAllowed.filter((id) =>
                  Object.hasOwn(catalog.data.components, id)
                ),
              }
            : {}),
        },
        enumerable: true,
        configurable: true,
      },
    });
  }
  generationCatalogs.set(configured, configuredCatalog);
  // Puck may copy Config while preserving its component map.
  generationCatalogs.set(configured.components, configuredCatalog);
  return configured;
};
