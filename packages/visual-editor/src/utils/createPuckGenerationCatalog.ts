import { defineCatalog, defineSchema } from "@json-render/core";
import type { Config, Fields, Permissions } from "@puckeditor/core";
import { z } from "zod";
import { mainContentDisallowedComponents } from "../components/helpers/MainContent.tsx";
import type { LayoutGenerationMetadata } from "../fields/fields.ts";
import {
  generationComponentNamesLabel,
  mainContentDescription,
  puckCatalogPrompt,
} from "../internal/layoutGeneration/prompts.ts";

export type GenerationComponent = {
  generation?: LayoutGenerationMetadata;
  description?: string;
  fields?: Fields;
  defaultProps?: Record<string, unknown>;
  nestedOnly?: boolean;
  /** Static editor permissions checked before planning component changes. */
  permissions?: Partial<Permissions>;
};

type GenerationComponentInput = GenerationComponent & {
  layoutGenerationMetadata?: LayoutGenerationMetadata;
};

const puckSchema = defineSchema(
  (s) => ({
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
  }),
  {
    promptTemplate: ({ componentNames }) =>
      puckCatalogPrompt +
      "\n" +
      generationComponentNamesLabel +
      componentNames.join(", "),
  }
);

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
      generation: { props: z.object({ content: z.array(z.unknown()) }) },
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
  const catalog = defineCatalog(puckSchema, {
    components: Object.fromEntries(
      Object.entries(entries).map(
        ([name, { layoutGenerationMetadata, ...component }]) => {
          const generation = layoutGenerationMetadata ?? component.generation;
          return [
            name,
            {
              ...component,
              generation,
              props: generation?.props ?? z.object({}),
            },
          ];
        }
      )
    ),
  });
  return Object.assign(catalog, { puckOptions: options });
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
