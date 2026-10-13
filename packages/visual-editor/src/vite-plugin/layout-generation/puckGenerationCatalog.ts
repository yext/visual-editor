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
        "You generate Puck layouts using json-render's flat { root, elements } representation.",
        "Output RFC 6902 JSON Patch operations as JSONL, one operation per line. For initial layouts patch the supplied empty content graph; for follow-ups patch the supplied current graph.",
        "Each line must be a complete JSON object with all braces closed. Separate operations with actual newlines; never concatenate objects or use literal backslash-n separators. Escaped newlines are allowed inside JSON string values.",
        "Keep operations small: add an element skeleton with its type and empty props, then add its ordinary props and slots in separate operations. For deeply nested objects, add their object containers before filling their child properties. Finish all required props and slots before connecting the completed element to its parent. Check that each operation closes its value and its outer operation object.",
        "Illustrative JSONL syntax (use actual catalog types and properties):\n" +
          [
            {
              op: "add",
              path: "/elements/example-heading",
              value: { type: "ExampleText", props: {} },
            },
            {
              op: "add",
              path: "/elements/example-heading/props/text",
              value: "A fresh favorite",
            },
            {
              op: "add",
              path: "/elements/example-section",
              value: { type: "ExampleSection", props: {} },
            },
            {
              op: "add",
              path: "/elements/example-section/props/title",
              value: "Welcome",
            },
            {
              op: "add",
              path: "/elements/example-section/slots",
              value: {
                "/slots/HeadingSlot": ["example-heading"],
                "/slots/VideoSlot": [],
              },
            },
            {
              op: "add",
              path: "/elements/example-main/children/-",
              value: "example-section",
            },
          ]
            .map((operation) => JSON.stringify(operation))
            .join("\n"),
        "The catalog schemas describe reconstructed native Puck props; resolve any $ref against that component schema's own $defs. Convert to flat authoring as follows: native props.id is satisfied by the element key, so NEVER emit props.id; native MainContent props.content is satisfied by MainContent.children; every other declared native slot array is satisfied by element.slots at its exact declared JSON Pointer. Keep only ordinary props in element.props. NEVER put slot-pointer keys or child ID arrays in props. Set the whole element.slots map in one operation to avoid confusing slot keys with JSON Patch paths.",
        "Use only schema-declared ordinary props. Include every required nested prop from the native schema even when its related display toggle is disabled; an empty object is invalid if its schema requires child properties. For each populated slot, use the exact component type required by its native item schema, not a similarly named component. Emit required unused slots as [] in the element.slots map. Preserve schema-permitted optional absence and nullable values. Every authored element must be reachable from the supplied root through children or slots references.",
        "For a fresh landing page, create a complete page with an introductory hero, supporting sections, and clear calls to action. A single standalone section is not a complete landing page. Finish the full request before ending your response.",
        "When the user asks to add a component, create an additional component with a new ID and connect it to the layout. Preserve existing components; changing an existing component's variant does not fulfill an add request.",
        "Illustrative flat graph (ExampleSection and ExampleText are example names only; use actual catalog types and props in your output):\n```json\n" +
          JSON.stringify(
            {
              root: "example-root",
              elements: {
                "example-root": {
                  type: "__PuckContentRoot",
                  props: {},
                  children: ["example-main"],
                },
                "example-main": {
                  type: "MainContent",
                  props: {},
                  children: ["example-section"],
                },
                "example-section": {
                  type: "ExampleSection",
                  props: { title: "Welcome" },
                  slots: {
                    "/slots/HeadingSlot": ["example-heading"],
                    "/slots/VideoSlot": [],
                  },
                },
                "example-heading": {
                  type: "ExampleText",
                  props: { text: "A fresh favorite" },
                },
              },
            },
            null,
            2
          ) +
          "\n```\nThis illustrates the element shape, not a replacement for the starting graph. Output JSON Patch lines against the supplied starting graph, constructing complete elements through short operations and then connecting their references.",
        "Preserve existing IDs and content the user did not ask to change. Keep all child references ordered. Do not create duplicate elements for derived-slot copies.",
        "Use remove operations to clear optional props. Use null only where the component prop schema allows null.",
        "Do not generate Puck root or zones, runtime context, callbacks, state bindings, repeats, json-render actions, expressions, or unsupported element properties. Existing entity references are ordinary component props.",
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
        "The main content area. Its flat children references define page sections in display order.",
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
