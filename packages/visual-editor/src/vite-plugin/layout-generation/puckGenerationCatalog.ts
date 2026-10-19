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
      [
        "Create a fresh native nested Puck page using the strict response schema. Complete creation in one response.",
        "Emit component types and authored props only. The server assigns all component identities.",
        'Use direct prop values. Use {"$default":true} only where available to select the component or enclosing slot template default; use {"$unset":true} to remove an optional value. Null is an explicit value only where the schema permits it.',
        "Slots contain ordered native component lists; ordinary arrays are supplied in full. Preserve entity bindings. Normalize localized defaults according to translationMode.",
        "Prefer entity-backed content for business identity and location facts. Unless the user supplies a business name or explicitly requests fictional branding, use [[name]] wherever the business name appears, including within otherwise authored copy. Write creative marketing copy around those references. Other location-specific fields include 'description', 'address.city', and 'address.region', and can also be embedded in constant values using [[field]] syntax.",
        'Prefer existing component and theme styling. For optional style overrides that are not needed, emit {"$unset":true} so the saved property remains absent. Follow component guidance about when an override is appropriate.',
        "When MainContent is available, place page sections inside a single MainContent.props.content list in display order. Header and ExpandedHeader belong at the page root before MainContent; Footer and ExpandedFooter belong at the page root after MainContent. Include headers and footers only when available and needed. Never nest them inside MainContent.",
        `Generation-enabled components: ${componentNames.join(", ")}`,
      ].join("\n"),
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
