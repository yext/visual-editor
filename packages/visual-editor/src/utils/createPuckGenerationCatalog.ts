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

/** Associate generated contracts with a config without adding saved layout data. */
export const withGenerationCatalog = <T extends Config>(
  config: T,
  catalog: PuckGenerationCatalog
): T => {
  generationCatalogs.set(config, catalog);
  // Puck may copy Config while preserving its component map.
  generationCatalogs.set(config.components, catalog);
  return config;
};
