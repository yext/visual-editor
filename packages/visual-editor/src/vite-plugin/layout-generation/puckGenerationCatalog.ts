import { puckCatalogPrompt, generationComponentNamesLabel } from "./prompts.ts";
import { defineCatalog, defineSchema } from "@json-render/core";
import type { Fields, Permissions } from "@puckeditor/core";
import { z } from "zod";
import type { ComponentGenerationMetadata } from "../../fields/fields.ts";

export type GenerationComponent = {
  generation?: ComponentGenerationMetadata;
  description?: string;
  fields?: Fields;
  defaultProps?: Record<string, unknown>;
  nestedOnly?: boolean;
  /** Static editor permissions checked before planning component changes. */
  permissions?: Partial<Permissions>;
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
  components: Record<string, GenerationComponent>,
  options: {
    rootAllowedComponentIds?: string[];
    /** Prompt guidance for fresh generation; explicit user requests take precedence. */
    defaultGenerationComponentIds?: string[];
  } = {}
) => {
  const entries: Record<string, GenerationComponent> = {
    MainContent: {
      generation: { props: z.object({ content: z.array(z.unknown()) }) },
      fields: {
        content: {
          type: "slot",
          disallow: [
            "MainContent",
            "Header",
            "ExpandedHeader",
            "Footer",
            "ExpandedFooter",
            ...Object.keys(components).filter(
              (name) => components[name].nestedOnly
            ),
          ],
        },
      },
      defaultProps: { content: [] },
      description:
        "The main content area, containing page sections in display order, with headers before it and footers after it as page-root siblings.",
    },
    ...components,
  };
  const catalog = defineCatalog(puckSchema, {
    components: Object.fromEntries(
      Object.entries(entries).map(([name, component]) => [
        name,
        {
          ...component,
          props: component.generation?.props ?? z.object({}),
        },
      ])
    ),
  });
  return Object.assign(catalog, { puckOptions: options });
};

export type PuckGenerationCatalog = ReturnType<
  typeof createPuckGenerationCatalog
>;
