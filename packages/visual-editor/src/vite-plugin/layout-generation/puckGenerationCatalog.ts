import { defineCatalog, defineSchema } from "@json-render/core";
import type { Fields } from "@puckeditor/core";
import { z } from "zod";
import type { ComponentGenerationMetadata } from "../../fields/fields.ts";

export type GenerationComponent = {
  generation?: ComponentGenerationMetadata;
  description?: string;
  fields?: Fields;
  defaultProps?: Record<string, unknown>;
  nestedOnly?: boolean;
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
      [
        "Generate native nested Puck component overrides using the strict response schema.",
        "Every declared prop must have a mode: keep preserves the baseline, set supplies an explicit value, unset removes an optional property. Null is an explicit set value.",
        "New instances use component defaults. Existing instances use their authored values. Use an existing Id only for the same component inside its original subtree. Use null for new instances.",
        "Slots contain ordered native component lists; ordinary arrays are replaced in full. Preserve entity bindings, translations, and configuration unrelated to the request.",
        "Use bounded edit operations for updates, additions, moves and removals. Destination indexes apply after removals, in operation order. Target only the starting inventory. Do not combine ancestor and descendant edits.",
        "Return clarification when required facts or configuration are missing. Never invent business facts or asset URLs to fill defaults. For an image request you may supply an image URL.",
        "Replace a page only when the user explicitly requests a full-page redesign. Complete an initial page creation in one response.",
        `Generation-enabled components: ${componentNames.join(", ")}`,
      ].join("\n"),
  }
);

/** Contracts belong to registered Puck components, including hidden slot children. */
export const createPuckGenerationCatalog = (
  components: Record<string, GenerationComponent>,
  options: { rootAllowedComponentIds?: string[] } = {}
) => {
  const entries: Record<string, GenerationComponent> = {
    MainContent: {
      generation: { props: z.object({ content: z.array(z.unknown()) }) },
      fields: {
        content: {
          type: "slot",
          disallow: [
            "MainContent",
            ...Object.keys(components).filter(
              (name) => components[name].nestedOnly
            ),
          ],
        },
      },
      defaultProps: { content: [] },
      description:
        "The main content area, containing page sections in display order.",
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
