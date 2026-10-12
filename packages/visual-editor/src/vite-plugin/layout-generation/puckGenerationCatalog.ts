import {
  defineCatalog,
  defineSchema,
  type SchemaBuilder,
} from "@json-render/core";
import type { Fields } from "@puckeditor/core";
import { z } from "zod";

export type GenerationComponent = {
  props?: z.ZodObject;
  description?: string;
  fields?: Fields;
  defaultProps?: Record<string, unknown>;
  /** Property segments relative to props identifying derived slot copies.
   * These subtrees retain validation but do not register component IDs. */
  derivedSlotPaths?: readonly (readonly string[])[];
  /** Hidden shared components can only appear inside slots. */
  nestedOnly?: boolean;
};

const componentData = (s: SchemaBuilder) =>
  s.object({
    type: s.ref("catalog.components"),
    props: s.record(s.any()),
    readOnly: { ...s.record(s.boolean()), optional: true },
  });

const puckSchema = defineSchema(
  (s) => ({
    spec: s.object({
      content: s.array(componentData(s)),
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
    promptTemplate: ({ componentNames, options }) =>
      [
        "You generate native Puck component content as serializable JSON.",
        'Return exactly {"text":"short explanation","spec":{"content":[]}}. Use spec: null for prose-only replies.',
        "Emit text first. Each response contains the complete resulting content array, never patches relative to an earlier response.",
        "Components are { type, props }. Every component, including nested components, requires a unique nonempty props.id. Preserve IDs and content the user did not ask to change.",
        "MainContent contains sections in props.content, an ordered array of component objects. Other slot fields contain the same component data arrays, including slots nested inside object or array fields.",
        "Use slot fields for all nested components. Do not generate root or zones; the editor preserves its existing root and clears zones.",
        "Do not generate puck runtime context, callbacks, elements, children references, state bindings, repeats, or json-render actions. Existing entity references are ordinary component props.",
        "Author content through declared data fields, constants, and source mappings. Do not generate parentData content overrides; parent components supply inherited content. Only include parentData settings explicitly documented as authorable in the component schema.",
        `Available components: ${componentNames.join(", ")}`,
        ...(options.customRules ?? []),
      ].join("\n"),
  }
);

/** The schema describes saved data; the host supplies all runtime Puck context. */
export const createPuckGenerationCatalog = (
  components: Record<string, GenerationComponent>,
  options: { rootAllowedComponentIds?: string[] } = {}
) => {
  const entries: Record<string, GenerationComponent> = {
    MainContent: {
      props: z.object({ content: z.array(z.unknown()) }),
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
      description:
        "The main content area. Place page sections in props.content in display order.",
    },
    ...components,
  };
  const catalog = defineCatalog(puckSchema, {
    components: Object.fromEntries(
      Object.entries(entries).map(([name, component]) => {
        // Add the common saved ID without dropping component refinements.
        const props = (component.props ?? z.object({})).safeExtend({
          id: z.string().min(1),
        });
        return [
          name,
          { ...component, props, hasFormalProps: !!component.props },
        ];
      })
    ),
  });
  return Object.assign(catalog, {
    puckOptions: options,
  });
};

export type PuckGenerationCatalog = ReturnType<
  typeof createPuckGenerationCatalog
>;
