// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createFlatPatchStream } from "./flatPatchStream.ts";
import { flatSpecToPuckData, puckDataToFlatSpec } from "./puckFlatAdapter.ts";
import { createPuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import {
  buildGenerationPrompt,
  parseGenerationResponse,
  validateGeneratedText,
  validateGeneratedContent,
} from "./generationValidation.ts";

const color = z
  .string()
  .regex(/^\[#[0-9a-fA-F]{6}\]$/)
  .describe("Use bracketed hex, for example [#D63384]");
const catalog = createPuckGenerationCatalog({
  Banner: {
    description: "A banner",
    props: z
      .object({
        text: z.string().describe("Always use an emoji."),
        style: z.object({ selectedColor: color }),
      })
      .refine((props) => props.text !== "Forbidden", {
        message: "Forbidden title",
      }),
    fields: {
      slots: {
        type: "object",
        objectFields: { body: { type: "slot", allow: ["Text"] } },
      },
      cards: { type: "array", arrayFields: { content: { type: "slot" } } },
    },
  },
  Text: {
    props: z.object({ text: z.string() }),
    fields: { text: { type: "text" } },
    nestedOnly: true,
  },
});
const banner = (extra = {}) => ({
  type: "Banner",
  props: {
    id: "banner",
    text: "Hi 👋",
    style: { selectedColor: "[#D63384]" },
    ...extra,
  },
});
const text = (id = "text") => ({ type: "Text", props: { id, text: "Nested" } });
const layout = (content: unknown[] = [banner()]) => ({
  content,
});
const output = (spec: unknown) => JSON.stringify({ text: "Created", spec });

describe("Puck generation validation", () => {
  it("preserves reconstructed native schema requiredness, nullable slots, constraints, and defaults", () => {
    const custom = createPuckGenerationCatalog({
      Promo: {
        props: z.object({
          data: z.object({
            backgroundImage: z.object({ url: z.string().url() }),
          }),
          slots: z.object({
            HeadingSlot: z.array(z.unknown()),
            VideoSlot: z.array(z.unknown()),
            OptionalSlot: z.array(z.unknown()).optional(),
            NullableSlot: z.array(z.unknown()).nullable(),
          }),
          caption: z.string().min(2).default("Welcome").describe("Caption"),
        }),
        fields: {
          data: {
            type: "object",
            objectFields: {
              backgroundImage: {
                type: "object",
                objectFields: { url: { type: "text" } },
              },
            },
          },
          slots: {
            type: "object",
            objectFields: {
              HeadingSlot: { type: "slot" },
              VideoSlot: { type: "slot" },
              OptionalSlot: { type: "slot" },
              NullableSlot: { type: "slot" },
            },
          },
        },
        defaultProps: { obsoleteDefault: "Never show this" },
      },
    });
    const prompt = buildGenerationPrompt(custom);
    const guidance = JSON.parse(
      prompt.split(
        "Reconstructed native props schemas and declared slot paths:\n"
      )[1]
    );
    const schema = guidance.Promo.nativePropsSchema;
    expect(schema.required).toEqual(
      expect.arrayContaining(["data", "slots", "id"])
    );
    expect(schema.properties.data.required).toEqual(["backgroundImage"]);
    expect(schema.properties.slots.required).toEqual([
      "HeadingSlot",
      "VideoSlot",
      "NullableSlot",
    ]);
    expect(
      schema.properties.slots.properties.NullableSlot.anyOf
    ).toContainEqual({ type: "null" });
    const caption = schema.properties.caption;
    const referencedCaption = caption.$ref
      ? caption.$ref
          .slice(2)
          .split("/")
          .reduce((node: any, key: string) => node[key], schema)
      : {};
    expect({ ...referencedCaption, ...caption }).toMatchObject({
      default: "Welcome",
      minLength: 2,
      description: "Caption",
    });
    expect(prompt).not.toContain("obsoleteDefault");
    expect(prompt).toContain("additional component");
  });

  it("supplies complete flat and JSONL examples that reconstruct with a required unused slot", async () => {
    const exampleCatalog = createPuckGenerationCatalog({
      ExampleSection: {
        props: z.object({
          title: z.string(),
          slots: z.object({
            HeadingSlot: z.array(z.unknown()),
            VideoSlot: z.array(z.unknown()),
          }),
        }),
        fields: {
          slots: {
            type: "object",
            objectFields: {
              HeadingSlot: { type: "slot", allow: ["ExampleText"] },
              VideoSlot: { type: "slot", allow: ["ExampleText"] },
            },
          },
        },
      },
      ExampleText: { props: z.object({ text: z.string() }), nestedOnly: true },
    });
    const prompt = buildGenerationPrompt(exampleCatalog);
    const example = JSON.parse(prompt.match(/```json\n([\s\S]*?)\n```/)![1]);
    const native = flatSpecToPuckData(exampleCatalog, example, {
      root: { props: {} },
      content: [],
    });
    expect(
      validateGeneratedContent(exampleCatalog, { content: native.content })
    ).toEqual([]);
    expect(native.content[0].props.content[0].props.slots.VideoSlot).toEqual(
      []
    );
    expect(
      flatSpecToPuckData(
        exampleCatalog,
        puckDataToFlatSpec(exampleCatalog, native),
        native
      )
    ).toEqual(native);
    const starting = {
      root: "example-root",
      elements: {
        "example-root": {
          type: "__PuckContentRoot",
          props: {},
          children: ["example-main"],
        },
        "example-main": { type: "MainContent", props: {}, children: [] },
      },
    };
    const operations = prompt.match(
      /Illustrative JSONL syntax[^\n]*\n([\s\S]*?)\nThe catalog schemas/
    )![1];
    const stream = createFlatPatchStream(
      starting,
      () => {},
      () => {}
    );
    try {
      await stream.push(operations);
      const result = await stream.finish();
      expect(
        flatSpecToPuckData(exampleCatalog, result.spec, {
          root: { props: {} },
          content: [],
        })
      ).toEqual(native);
    } finally {
      await stream.cancel();
    }
  });

  it("identifies the component and native property path when a required prop is missing", () => {
    const custom = createPuckGenerationCatalog({
      Promo: {
        props: z.object({
          data: z.object({ backgroundImage: z.object({ url: z.string() }) }),
        }),
      },
    });
    const errors = validateGeneratedContent(custom, {
      content: [{ type: "Promo", props: { id: "new-promo", data: {} } }],
    });
    expect(errors.join("\n")).toContain("new-promo");
    expect(errors.join("\n")).toContain("backgroundImage");
  });

  it("requests and accepts only content, rejecting model-owned root or zones", () => {
    const schema = catalog.jsonSchema() as {
      required: string[];
      properties: Record<string, unknown>;
    };
    expect(schema.required).toEqual(["content"]);
    expect(Object.keys(schema.properties)).toEqual(["content"]);
    expect(parseGenerationResponse(output(layout())).spec).toEqual(layout());
    expect(
      validateGeneratedText(
        catalog,
        output({ ...layout(), root: { props: {} } })
      )
    ).not.toEqual([]);
    expect(
      validateGeneratedText(catalog, output({ ...layout(), zones: {} }))
    ).not.toEqual([]);
    expect(parseGenerationResponse(output(null)).spec).toBeNull();
  });
  it("derives flat component prop constraints and slot guidance from Puck schemas", () => {
    const prompt = buildGenerationPrompt(catalog);
    expect(prompt).toContain("A banner");
    expect(prompt).toContain("bracketed hex");
    expect(prompt).toContain('"pattern"');
    expect(prompt).toContain("/slots/body");
    expect(prompt).toContain('"allow":["Text"]');
    expect(prompt).toContain("props.content");
    expect(prompt).not.toContain('"puck": {');
    expect(prompt).toContain("flat { root, elements }");
    expect(
      catalog.data.components.Banner.props.safeParse(banner().props).success
    ).toBe(true);
    expect(
      catalog.data.components.Banner.props.safeParse({ text: "Missing ID" })
        .success
    ).toBe(false);
  });
  it("validates saved props directly and preserves component refinements", () => {
    const data = layout();
    expect(validateGeneratedText(catalog, output(data))).toEqual([]);
    expect(data.content[0]).not.toHaveProperty("props.puck");
    expect(
      catalog.data.components.Banner.props.safeParse(
        banner({ text: "Forbidden" }).props
      ).success
    ).toBe(false);
    expect(
      validateGeneratedContent(
        catalog,
        layout([banner({ text: "Forbidden" })])
      ).join()
    ).toContain("Forbidden title");
    expect(
      validateGeneratedContent(
        catalog,
        layout([banner({ style: { selectedColor: "#D63384" } })])
      )
    ).not.toEqual([]);
  });
  it("validates nested slots in object and array fields", () => {
    const data = layout([
      banner({
        slots: { body: [text()] },
        cards: [{ content: [text("card-text")] }],
      }),
    ]);
    expect(validateGeneratedContent(catalog, data)).toEqual([]);
    expect(parseGenerationResponse(output(data)).spec).toEqual(data);
  });
  it.each([
    layout([banner({ id: "" })]),
    layout([banner(), banner()]),
    layout([banner({ slots: { body: [text("banner")] } })]),
    layout([
      banner({
        slots: { body: [{ type: "Unknown", props: { id: "unknown" } }] },
      }),
    ]),
    layout([
      banner({
        slots: {
          body: [text(), { type: "Text", props: { text: "Missing ID" } }],
        },
      }),
    ]),
    layout([banner({ slots: { body: "invalid" } })]),
    layout([banner({ cards: [{ content: [text(), text()] }] })]),
    layout([banner({ puck: { isEditing: false } })]),
    layout([text()]),
    layout([banner({ slots: { body: [banner({ id: "nested-banner" })] } })]),
    layout([banner({ text: { $state: "/title" } })]),
    { root: "banner", elements: {} },
    { ...layout(), state: {} },
  ])("rejects invalid saved data %#", (data) => {
    expect(validateGeneratedContent(catalog, data)).not.toEqual([]);
  });
  it("treats formal schemas as authoritative for nullable field values", () => {
    const nullableCatalog = createPuckGenerationCatalog({
      Banner: {
        props: z.object({ title: z.string().nullable() }),
        fields: { title: { type: "text" } },
      },
    });
    expect(
      validateGeneratedContent(
        nullableCatalog,
        layout([{ type: "Banner", props: { id: "banner", title: null } }])
      )
    ).toEqual([]);
  });
  it("preserves Puck readOnly metadata", () => {
    const data = layout([{ ...banner(), readOnly: { text: true } }]);
    expect(validateGeneratedContent(catalog, data)).toEqual([]);
    expect(parseGenerationResponse(output(data)).spec).toEqual(data);
  });
  it("accepts empty layouts and prose-only responses, rejecting malformed responses", () => {
    expect(validateGeneratedText(catalog, output(layout([])))).toEqual([]);
    expect(validateGeneratedText(catalog, output(null))).toEqual([]);
    expect(
      validateGeneratedText(catalog, '{"text":"broken","spec":')
    ).not.toEqual([]);
    expect(validateGeneratedText(catalog, "```spec\n{}\n```")).not.toEqual([]);
  });
  it("checks allowed top-level components", () => {
    const rootCatalog = createPuckGenerationCatalog(
      { Banner: { props: z.object({ title: z.string() }) } },
      { rootAllowedComponentIds: ["MainContent"] }
    );
    const item = { type: "Banner", props: { id: "banner", title: "Hi" } };
    expect(validateGeneratedContent(rootCatalog, layout([item]))).not.toEqual(
      []
    );
    expect(
      validateGeneratedContent(
        rootCatalog,
        layout([
          { type: "MainContent", props: { id: "main", content: [item] } },
        ])
      )
    ).toEqual([]);
  });
  it("keeps entity references and literal braces/quotes unchanged", () => {
    const data = layout([
      banner({ entity: { field: "name" }, text: 'Shop "A" {today}' }),
    ]);
    expect(validateGeneratedContent(catalog, data)).toEqual([]);
    expect(parseGenerationResponse(output(data)).spec).toEqual(data);
  });

  describe("derived header slots", () => {
    const secondarySlot = {
      type: "slot" as const,
      allow: ["SecondaryHeaderSlot"],
    };
    const primary = {
      props: z.object({
        parentValues: z.object({
          SecondaryHeaderSlot: z.array(z.unknown()),
          AuthoredSlot: z.array(z.unknown()).optional(),
        }),
        slots: z.object({ LinksSlot: z.array(z.unknown()) }),
      }),
      fields: {
        parentValues: {
          type: "object" as const,
          objectFields: {
            SecondaryHeaderSlot: secondarySlot,
            AuthoredSlot: secondarySlot,
          },
        },
        slots: {
          type: "object" as const,
          objectFields: {
            LinksSlot: { type: "slot" as const, allow: ["HeaderLink"] },
          },
        },
      },
      nestedOnly: true,
    };
    const headerCatalog = createPuckGenerationCatalog({
      ExpandedHeader: {
        props: z.object({
          slots: z.object({
            PrimaryHeaderSlot: z.array(z.unknown()),
            SecondaryHeaderSlot: z.array(z.unknown()),
          }),
        }),
        fields: {
          slots: {
            type: "object",
            objectFields: {
              PrimaryHeaderSlot: {
                type: "slot",
                allow: ["PrimaryHeaderSlot", "OtherPrimary"],
              },
              SecondaryHeaderSlot: secondarySlot,
            },
          },
        },
      },
      PrimaryHeaderSlot: {
        ...primary,
        derivedSlotPaths: [["parentValues", "SecondaryHeaderSlot"]],
      },
      OtherPrimary: primary,
      SecondaryHeaderSlot: {
        props: z.object({
          label: z.string(),
          slots: z.object({ LinksSlot: z.array(z.unknown()) }),
        }),
        fields: {
          slots: {
            type: "object",
            objectFields: {
              LinksSlot: { type: "slot", allow: ["HeaderLink"] },
            },
          },
        },
        nestedOnly: true,
      },
      HeaderLink: {
        props: z.object({
          label: z.string(),
          href: z.string().regex(/^https:\/\//),
        }),
        nestedOnly: true,
      },
    });
    const link = (id: string) => ({
      type: "HeaderLink",
      props: { id, label: "Home", href: "https://example.com" },
    });
    const expandedHeader = () => {
      const secondary = {
        type: "SecondaryHeaderSlot",
        props: {
          id: "secondary",
          label: "Navigation",
          slots: { LinksSlot: [link("secondary-link")] },
        },
      };
      const primary = {
        type: "PrimaryHeaderSlot",
        props: {
          id: "primary",
          parentValues: { SecondaryHeaderSlot: [structuredClone(secondary)] },
          slots: { LinksSlot: [link("primary-link")] },
        },
      };
      const header = {
        type: "ExpandedHeader",
        props: {
          id: "header",
          slots: {
            PrimaryHeaderSlot: [primary],
            SecondaryHeaderSlot: [secondary],
          },
        },
      };
      return {
        data: layout([header]),
        header,
        primary,
        secondary,
        derived: primary.props.parentValues.SecondaryHeaderSlot[0],
      };
    };

    it("accepts the mobile copy and its nested links without mutating saved data", () => {
      const { data } = expandedHeader();
      const before = structuredClone(data);
      expect(validateGeneratedContent(headerCatalog, data)).toEqual([]);
      expect(data).toEqual(before);
    });

    it("requires explicit metadata, independent of the component name", () => {
      const fixture = expandedHeader();
      const unconfigured = createPuckGenerationCatalog({
        ...headerCatalog.data.components,
        PrimaryHeaderSlot: primary,
      });
      expect(
        validateGeneratedContent(unconfigured, fixture.data).join()
      ).toContain("duplicate props.id");
      const configured = createPuckGenerationCatalog({
        ...headerCatalog.data.components,
        OtherPrimary: {
          ...primary,
          derivedSlotPaths: [["parentValues", "SecondaryHeaderSlot"]],
        },
      });
      fixture.primary.type = "OtherPrimary";
      expect(validateGeneratedContent(configured, fixture.data)).toEqual([]);
    });

    it.each([
      "top-level",
      "nested secondary",
      "nested link",
      "other parentValues slot",
      "other component",
    ])("still rejects authored duplicate IDs: %s", (location) => {
      const fixture = expandedHeader();
      if (location === "top-level")
        fixture.data.content.push(structuredClone(fixture.header));
      else if (location === "nested secondary")
        fixture.header.props.slots.SecondaryHeaderSlot.push(
          structuredClone(fixture.secondary)
        );
      else if (location === "nested link")
        fixture.primary.props.slots.LinksSlot.push(link("secondary-link"));
      else if (location === "other parentValues slot")
        Object.assign(fixture.primary.props.parentValues, {
          AuthoredSlot: [structuredClone(fixture.secondary)],
        });
      else fixture.primary.type = "OtherPrimary";
      const before = structuredClone(fixture.data);
      expect(
        validateGeneratedContent(headerCatalog, fixture.data).join()
      ).toContain("duplicate props.id");
      expect(fixture.data).toEqual(before);
    });

    it.each([
      "envelope",
      "unknown component",
      "slot restriction",
      "schema",
      "nested schema",
      "missing id",
      "runtime context",
      "expression",
      "slot shape",
    ] as const)("still validates derived content: %s", (problem) => {
      const fixture = expandedHeader();
      const derived = fixture.derived;
      const nested = derived.props.slots.LinksSlot[0];
      const expected = {
        envelope: "unrecognized_keys",
        "unknown component": "Unknown component",
        "slot restriction": "is not allowed in this slot",
        schema: "invalid_type",
        "nested schema": "invalid_format",
        "missing id": "component requires nonempty props.id",
        "runtime context": "puck runtime context must not be saved",
        expression: "json-render expressions are not supported",
        "slot shape": "slot must be a component array",
      }[problem];
      if (problem === "envelope") Object.assign(nested, { extra: true });
      else if (problem === "unknown component") nested.type = "Unknown";
      else if (problem === "slot restriction") {
        nested.type = "SecondaryHeaderSlot";
        Object.assign(nested.props, { slots: { LinksSlot: [] } });
      } else if (problem === "schema")
        Object.assign(derived.props, { label: 42 });
      else if (problem === "nested schema")
        nested.props.href = "javascript:alert(1)";
      else if (problem === "missing id") nested.props.id = " ";
      else if (problem === "runtime context")
        Object.assign(nested.props, { puck: {} });
      else if (problem === "expression")
        Object.assign(nested.props, { extra: { $state: "/label" } });
      else Object.assign(derived.props.slots, { LinksSlot: "invalid" });
      const before = structuredClone(fixture.data);
      expect(
        validateGeneratedContent(headerCatalog, fixture.data).join()
      ).toContain(expected);
      expect(fixture.data).toEqual(before);
    });
  });
});
