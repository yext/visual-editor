// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import { compileGenerationSchema } from "./generationSchema.ts";
import { validateGeneratedContent } from "./generationValidation.ts";

const component = (type: string, props: Record<string, unknown> = {}) => ({
  type,
  props: { id: type.toLowerCase(), ...props },
});
const output = (content: unknown[]) =>
  JSON.stringify({ text: "Created", spec: { content } });
const localized = z.union([
  z.string(),
  z
    .object({
      defaultValue: z.string().optional(),
      hasLocalizedValue: z.literal("true").optional(),
    })
    .catchall(z.string().optional()),
]);
const richText = z.object({ html: z.string(), json: z.string() });
const richTextValue = z.union([z.string(), richText]);
const localizedRichText = z
  .object({
    defaultValue: richTextValue.optional(),
    hasLocalizedValue: z.literal("true").optional(),
  })
  .catchall(richTextValue.optional());
const translatableRichText = z.union([z.string(), richText, localizedRichText]);
const optionalRichText = z.strictObject({
  html: z.string().optional(),
  json: z.string().optional(),
});
const optionalRichTextValue = z.union([z.string(), optionalRichText]);
const translatableOptionalRichText = z.union([
  z.string(),
  optionalRichText,
  z
    .object({
      hasLocalizedValue: z.literal("true").optional(),
      defaultValue: optionalRichTextValue.optional(),
    })
    .catchall(optionalRichTextValue.optional()),
]);

describe("strict Puck generation schemas", () => {
  it("preserves descriptions on reused schemas without reference siblings", () => {
    const variant = z.enum(["blue", "green"]);
    const catalog = createPuckGenerationCatalog({
      First: { props: z.object({ variant }) },
      Second: {
        props: z.object({
          variant: variant.describe("The visual variant of the hero"),
        }),
      },
    });
    const compiled = compileGenerationSchema(catalog, []);
    const nodes: Record<string, any>[] = [];
    const visit = (value: unknown) => {
      if (!value || typeof value !== "object") return;
      if (!Array.isArray(value)) nodes.push(value);
      Object.values(value).forEach(visit);
    };
    visit(compiled.jsonSchema);
    expect(nodes.some((node) => node.$ref)).toBe(true);
    expect(
      nodes.find(
        (node) => node.description === "The visual variant of the hero"
      )
    ).toMatchObject({ anyOf: [{ $ref: expect.any(String) }] });
    for (const node of nodes.filter((node) => node.$ref))
      expect(Object.keys(node)).toEqual(["$ref"]);
    expect(() =>
      compiled.parseResponse(output([component("Second", { variant: "red" })]))
    ).toThrow();
    expect(
      compiled.parseResponse(output([component("Second", { variant: "blue" })]))
        .spec?.content
    ).toEqual([component("Second", { variant: "blue" })]);
  });

  it("retains string bounds in reused entity-reference schemas", () => {
    const reference = z.strictObject({
      field: z.string().min(1).max(40),
      constantValue: z.strictObject({}),
      constantValueEnabled: z.literal(false),
    });
    const catalog = createPuckGenerationCatalog({
      Address: { props: z.object({ reference }) },
      Hours: { props: z.object({ reference }) },
    });
    const compiled = compileGenerationSchema(catalog, []);
    const json = JSON.stringify(compiled.jsonSchema);
    expect(json).toContain('"minLength":1');
    expect(json).toContain('"maxLength":40');
    expect(json).toContain('"$ref"');
    const item = component("Address", {
      reference: {
        field: "address",
        constantValue: {},
        constantValueEnabled: false,
      },
    });
    expect(compiled.parseResponse(output([item])).spec?.content).toEqual([
      item,
    ]);
    for (const field of ["", "x".repeat(41)]) {
      expect(() =>
        compiled.parseResponse(
          output([
            component("Address", {
              reference: {
                field,
                constantValue: {},
                constantValueEnabled: false,
              },
            }),
          ])
        )
      ).toThrow();
    }
  });

  it("supports recursive component slots through local references", () => {
    const catalog = createPuckGenerationCatalog({
      Tree: {
        props: z.object({ branches: z.array(z.unknown()) }),
        fields: {
          branches: { type: "slot", allow: ["Tree"] },
        },
      },
    });
    const compiled = compileGenerationSchema(catalog, []);
    expect(JSON.stringify(compiled.jsonSchema)).toContain('"$ref"');
    const tree = component("Tree", {
      branches: [component("Tree", { id: "child", branches: [] })],
    });
    expect(compiled.parseResponse(output([tree])).spec?.content).toEqual([
      tree,
    ]);
  });

  it("allows a deep native Puck layout when its schema uses bounded definitions", () => {
    const headingProps = z.object({
      data: z.object({
        text: z.object({
          field: z.string(),
          constantValue: localized,
          constantValueEnabled: z.boolean(),
        }),
      }),
      id: z.string().optional(),
    });
    const catalog = createPuckGenerationCatalog({
      CoreInfoSection: {
        props: z.object({
          slots: z.object({
            CoreInfoHeadingSlot: z.array(
              z.object({
                type: z.literal("HeadingTextSlot"),
                props: headingProps,
              })
            ),
          }),
        }),
        fields: {
          slots: {
            type: "object",
            objectFields: {
              CoreInfoHeadingSlot: { type: "slot", allow: ["HeadingTextSlot"] },
            },
          },
        },
      },
      HeadingTextSlot: { nestedOnly: true },
    });
    const heading = component("HeadingTextSlot", {
      data: {
        text: {
          field: "name",
          constantValue: {
            defaultValue: "Information",
            hasLocalizedValue: null,
            en: null,
            fr: "Informations",
          },
          constantValueEnabled: true,
        },
      },
    });
    const main = component("MainContent", {
      content: [
        component("CoreInfoSection", {
          slots: { CoreInfoHeadingSlot: [heading] },
        }),
      ],
    });
    const compiled = compileGenerationSchema(catalog, ["en", "fr"]);
    expect(JSON.stringify(compiled.jsonSchema)).toContain('"$defs"');
    const native = compiled.parseResponse(output([main])).spec!;
    expect(
      native.content[0].props.content[0].props.slots.CoreInfoHeadingSlot[0]
        .props.data.text.constantValue
    ).toEqual({
      defaultValue: "Information",
      fr: "Informations",
    });
    expect(validateGeneratedContent(catalog, native)).toEqual([]);
    Object.assign(heading.props, {
      data: {
        text: { field: "name", constantValue: 42, constantValueEnabled: true },
      },
    });
    expect(() => compiled.parseResponse(output([main]))).toThrow();
  });

  it("rejects excessive nesting and unsupported formats before generation", () => {
    let deep: z.ZodType = z.string();
    for (let i = 0; i < 11; i++) deep = z.object({ child: deep });
    expect(() =>
      compileGenerationSchema(
        createPuckGenerationCatalog({
          Section: { props: z.object({ deep }) },
        }),
        []
      )
    ).toThrow(/nesting exceeds/);
    expect(() =>
      compileGenerationSchema(
        createPuckGenerationCatalog({
          Section: { props: z.object({ url: z.url() }) },
        }),
        []
      )
    ).toThrow(/unsupported format uri/);
  });

  it("couples component types with props, exports checks, and closes every object", () => {
    const catalog = createPuckGenerationCatalog({
      Banner: {
        props: z.object({
          text: z
            .string()
            .regex(/^Hello/)
            .describe("A greeting"),
        }),
      },
      Heading: {
        props: z.object({
          level: z.enum(["h1", "h2"]),
          numbers: z.array(z.number()).min(1).max(2),
        }),
      },
    });
    const compiled = compileGenerationSchema(catalog, []);
    const json = JSON.stringify(compiled.jsonSchema);
    expect(json).toContain('"pattern":"^Hello"');
    expect(json).toContain('"description":"A greeting"');
    expect(json).toContain('"enum":["h1","h2"]');
    expect(json).toContain('"minItems":1');
    expect(json).toContain('"maxItems":2');
    expect(
      compiled.parseResponse(output([component("Banner", { text: "Hello" })]))
        .spec
    ).toBeDefined();
    for (const item of [
      component("Banner", { level: "h1" }),
      component("Banner", { text: "Wrong" }),
      component("Banner", { text: "Hello", extra: true }),
      component("Heading", { level: "h3", numbers: [1] }),
      component("Heading", { level: "h1", numbers: [] }),
      component("Banner", { id: " ", text: "Hello" }),
      component("Unknown"),
    ])
      expect(() => compiled.parseResponse(output([item]))).toThrow();
  });

  it("specializes localized objects while preserving strings, nullability, and omission", () => {
    const catalog = createPuckGenerationCatalog({
      Heading: {
        props: z.object({
          text: localized,
          optional: z.string().optional(),
          nullable: z.string().nullable(),
          both: z.string().nullable().optional(),
        }),
      },
    });
    const compiled = compileGenerationSchema(catalog, ["fr", "en", "fr"]);
    const item = component("Heading", {
      text: {
        defaultValue: "Welcome",
        hasLocalizedValue: null,
        en: null,
        fr: "Bienvenue",
      },
      optional: null,
      nullable: null,
      both: null,
    });
    expect(
      compiled.parseResponse(output([item])).spec?.content[0].props
    ).toEqual({
      id: "heading",
      text: { defaultValue: "Welcome", fr: "Bienvenue" },
      nullable: null,
      both: null,
    });
    expect(
      compiled.parseResponse(
        output([{ ...item, props: { ...item.props, text: "Welcome" } }])
      ).spec
    ).toBeDefined();
    expect(() =>
      compiled.parseResponse(
        output([
          {
            ...item,
            props: {
              ...item.props,
              text: {
                defaultValue: "Welcome",
                hasLocalizedValue: null,
                en: null,
                fr: null,
                es: "Hola",
              },
            },
          },
        ])
      )
    ).toThrow();
    expect(() => compileGenerationSchema(catalog, [])).toThrow(
      /localized values require/
    );
    expect(() =>
      compileGenerationSchema(catalog, ["en"], {
        content: [
          component("Heading", {
            text: { defaultValue: "Welcome", fr: "Bienvenue" },
            nullable: null,
          }),
        ],
      })
    ).toThrow(/currentData/);
  });

  it.each([
    "Welcome",
    { html: "<p>Welcome</p>", json: '{"text":"Welcome"}' },
    {
      defaultValue: { html: "<p>Welcome</p>", json: '{"text":"Welcome"}' },
      hasLocalizedValue: "true",
      en: "Welcome",
      fr: { html: "<p>Bienvenue</p>", json: '{"text":"Bienvenue"}' },
    },
    { defaultValue: "Welcome", fr: "Bienvenue" },
    { fr: { html: "<p>Bienvenue</p>", json: '{"text":"Bienvenue"}' } },
    {},
  ])("round-trips rich text and omitted optional values %#", (text) => {
    const catalog = createPuckGenerationCatalog({
      Heading: {
        props: z.object({
          text: translatableRichText,
          optional: translatableRichText.optional(),
        }),
      },
    });
    const saved = component("Heading", { text });
    // Compiling currentData exercises encoding omitted props and locale values.
    const compiled = compileGenerationSchema(catalog, ["en", "fr"], {
      content: [saved],
    });
    const wireText =
      typeof text === "object" && !("html" in text)
        ? {
            defaultValue: null,
            hasLocalizedValue: null,
            en: null,
            fr: null,
            ...text,
          }
        : text;
    const wire = component("Heading", { text: wireText, optional: null });
    const decoded = compiled.parseResponse(output([wire])).spec!;
    expect(decoded.content).toEqual([saved]);
    expect(compiled.normalizeContent({ content: [wire] })).toEqual(decoded);
    expect(validateGeneratedContent(catalog, decoded)).toEqual([]);
  });

  it.each([
    {
      saved: { html: "<p>Welcome</p>", json: "{}" },
      wire: { html: "<p>Welcome</p>", json: "{}" },
    },
    {
      saved: { html: "<p>Welcome</p>" },
      wire: { html: "<p>Welcome</p>", json: null },
    },
    {
      saved: { json: "{}" },
      wire: { html: null, json: "{}" },
    },
    { saved: {}, wire: { html: null, json: null } },
  ])("round-trips optional rich text properties %#", ({ saved, wire }) => {
    const catalog = createPuckGenerationCatalog({
      Heading: {
        props: z.object({
          text: translatableOptionalRichText,
          optional: translatableOptionalRichText.optional(),
        }),
      },
    });
    const content = [
      component("Heading", { text: saved }),
      component("Heading", {
        id: "localized",
        text: { defaultValue: saved, fr: saved },
      }),
    ];
    // Current-data compilation validates encoding with omitted html/json keys.
    const compiled = compileGenerationSchema(catalog, ["en", "fr"], {
      content,
    });
    const wireContent = [
      component("Heading", { text: wire, optional: null }),
      component("Heading", {
        id: "localized",
        text: {
          defaultValue: wire,
          hasLocalizedValue: null,
          en: null,
          fr: wire,
        },
        optional: null,
      }),
    ];
    const decoded = compiled.parseResponse(output(wireContent)).spec!;
    expect(decoded.content).toEqual(content);
    expect(compiled.normalizeContent({ content: wireContent })).toEqual(
      decoded
    );
    expect(validateGeneratedContent(catalog, decoded)).toEqual([]);
  });

  it("expands only selected locales and closes localized rich text objects", () => {
    const catalog = createPuckGenerationCatalog({
      Heading: { props: z.object({ text: translatableOptionalRichText }) },
    });
    const compiled = compileGenerationSchema(catalog, ["fr", "en", "fr"]);
    const objects: Record<string, any>[] = [];
    const visit = (node: any) => {
      if (!node || typeof node !== "object") return;
      if (node.type === "object") objects.push(node);
      Object.values(node).forEach(visit);
    };
    visit(compiled.jsonSchema);
    const localizedObject = objects.find(
      (node) => node.properties.defaultValue
    )!;
    expect(Object.keys(localizedObject.properties).sort()).toEqual([
      "defaultValue",
      "en",
      "fr",
      "hasLocalizedValue",
    ]);
    expect(localizedObject.required.sort()).toEqual(
      Object.keys(localizedObject.properties).sort()
    );
    expect(
      objects.some((node) => node.properties.html && node.properties.json)
    ).toBe(true);
    for (const node of objects) expect(node.additionalProperties).toBe(false);
    const text = {
      defaultValue: null,
      hasLocalizedValue: null,
      en: null,
      fr: null,
      es: { html: "<p>Hola</p>", json: "{}" },
    };
    expect(() =>
      compiled.parseResponse(output([component("Heading", { text })]))
    ).toThrow();
    expect(() =>
      compileGenerationSchema(catalog, ["en", "fr"], {
        content: [component("Heading", { text: { es: text.es } })],
      })
    ).toThrow(/currentData/);
    expect(() => compileGenerationSchema(catalog, [])).toThrow(
      /localized values require/
    );
  });

  it("accepts localized rich text without a localization flag", () => {
    const catalog = createPuckGenerationCatalog({
      Heading: {
        props: z.object({
          text: z
            .object({ defaultValue: richTextValue.optional() })
            .catchall(richTextValue.optional()),
        }),
      },
    });
    const text = { html: "<p>Welcome</p>", json: "{}" };
    const saved = component("Heading", { text: { defaultValue: text } });
    const compiled = compileGenerationSchema(catalog, ["en"], {
      content: [saved],
    });
    expect(
      compiled.parseResponse(
        output([
          component("Heading", { text: { defaultValue: text, en: null } }),
        ])
      ).spec?.content
    ).toEqual([saved]);
  });

  it.each([
    "",
    "__proto__",
    "prototype",
    "constructor",
    "defaultValue",
    "hasLocalizedValue",
  ])("rejects invalid or colliding rich text locale keys %s", (locale) => {
    const catalog = createPuckGenerationCatalog({
      Heading: { props: z.object({ text: localizedRichText }) },
    });
    expect(() => compileGenerationSchema(catalog, [locale])).toThrow(
      /invalid locale key|locale collides/
    );
  });

  it.each([
    z.object({ html: z.string() }),
    richText.extend({ extra: z.string() }),
    richText.extend({ html: z.number() }),
    richText.extend({ json: z.number().optional() }),
    richText.catchall(z.string()),
    z.union([richTextValue, z.number()]),
  ])("rejects unrelated localized catchall values %#", (schema) => {
    for (const [defaultValue, catchall] of [
      [schema, richTextValue],
      [richTextValue, schema],
    ]) {
      const catalog = createPuckGenerationCatalog({
        Heading: {
          props: z.object({
            text: z
              .object({ defaultValue: defaultValue.optional() })
              .catchall(catchall.optional()),
          }),
        },
      });
      expect(() => compileGenerationSchema(catalog, ["en"])).toThrow(
        /open-ended objects are unsupported/
      );
    }
  });

  it.each([z.literal("false"), z.boolean(), z.enum(["true", "false"])])(
    "rejects other localized rich text flags %#",
    (hasLocalizedValue) => {
      const catalog = createPuckGenerationCatalog({
        Heading: {
          props: z.object({
            text: localizedRichText.extend({ hasLocalizedValue }),
          }),
        },
      });
      expect(() => compileGenerationSchema(catalog, ["en"])).toThrow(
        /open-ended objects are unsupported/
      );
    }
  );

  it("constrains slots in objects and arrays and accepts complete inline shared schemas", () => {
    const inline = z.array(
      z.object({
        type: z.literal("Text"),
        props: z.object({ text: z.string(), id: z.string().optional() }),
        readOnly: z.record(z.string(), z.boolean()).optional(),
      })
    );
    const catalog = createPuckGenerationCatalog(
      {
        Section: {
          props: z.object({
            slots: z.object({ body: inline }),
            cards: z.array(z.object({ body: inline })),
          }),
          fields: {
            slots: {
              type: "object",
              objectFields: { body: { type: "slot", allow: ["Text"] } },
            },
            cards: {
              type: "array",
              arrayFields: { body: { type: "slot", allow: ["Text"] } },
            },
          },
        },
        Text: { nestedOnly: true },
      },
      { rootAllowedComponentIds: ["MainContent"] }
    );
    const child = component("Text", { text: "Nested" });
    const section = component("Section", {
      slots: { body: [child] },
      cards: [{ body: [component("Text", { id: "card", text: "Card" })] }],
    });
    const main = component("MainContent", { content: [section] });
    const compiled = compileGenerationSchema(catalog, []);
    expect(compiled.parseResponse(output([main])).spec?.content).toEqual([
      main,
    ]);
    expect(() => compiled.parseResponse(output([section]))).toThrow();
    expect(() =>
      compiled.parseResponse(
        output([component("MainContent", { content: [child] })])
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        output([
          component("MainContent", {
            content: [
              component("Section", {
                slots: { body: [component("Text")] },
                cards: [],
              }),
            ],
          }),
        ])
      )
    ).toThrow();
  });

  it("replaces declared generic slots and rejects missing reachable schemas", () => {
    const entries = {
      Section: {
        props: z.object({ body: z.array(z.unknown()) }),
        fields: { body: { type: "slot" as const, allow: ["Text"] } },
      },
      Text: { props: z.object({ text: z.string() }), nestedOnly: true },
    };
    const compiled = compileGenerationSchema(
      createPuckGenerationCatalog(entries),
      []
    );
    expect(
      compiled.parseResponse(
        output([
          component("Section", {
            body: [component("Text", { text: "Nested" })],
          }),
        ])
      ).spec
    ).toBeDefined();
    expect(() =>
      compileGenerationSchema(
        createPuckGenerationCatalog({ ...entries, Text: { nestedOnly: true } }),
        []
      )
    ).toThrow(/body.*Text needs formalProps/);
  });

  it.each([
    z.unknown(),
    z.any(),
    z.record(z.string(), z.string()),
    z.object({ label: z.string() }).catchall(z.string()),
    z.string().transform((text) => text.length),
  ])("fails explicitly for unsupported schemas %#", (schema) => {
    expect(() =>
      compileGenerationSchema(
        createPuckGenerationCatalog({
          Section: { props: z.object({ unsupported: schema }) },
        }),
        []
      )
    ).toThrow(/Generation schema/);
  });

  it("preserves custom refinements in authoritative native validation", () => {
    const catalog = createPuckGenerationCatalog({
      Section: {
        props: z
          .object({ text: z.string() })
          .refine((props) => props.text !== "Forbidden", "Forbidden title"),
      },
    });
    const compiled = compileGenerationSchema(catalog, []);
    const native = compiled.parseResponse(
      output([component("Section", { text: "Forbidden" })])
    ).spec;
    expect(validateGeneratedContent(catalog, native).join()).toContain(
      "Forbidden title"
    );
  });

  it("restores readOnly only for matching IDs and types, including nested components", () => {
    const catalog = createPuckGenerationCatalog({
      Section: {
        props: z.object({ body: z.array(z.unknown()), readOnly: z.boolean() }),
        fields: { body: { type: "slot", allow: ["Text"] } },
      },
      Text: { props: z.object({ text: z.string() }), nestedOnly: true },
      Other: { props: z.object({ text: z.string() }) },
    });
    const child = {
      ...component("Text", { text: "Nested" }),
      readOnly: { text: true },
    };
    const section = {
      ...component("Section", { body: [child], readOnly: true }),
      readOnly: { body: true },
    };
    const compiled = compileGenerationSchema(catalog, [], {
      content: [section],
    });
    const context = compiled.stripMetadata({ content: [section] });
    expect(context.content[0]).not.toHaveProperty("readOnly");
    expect(context.content[0].props.readOnly).toBe(true);
    expect(context.content[0].props.body[0]).not.toHaveProperty("readOnly");
    const native = compiled.parseResponse(output(context.content)).spec!;
    expect(native.content).toEqual([section]);
    expect(
      compiled.parseResponse(
        output([component("Other", { id: "section", text: "Replacement" })])
      ).spec?.content[0]
    ).not.toHaveProperty("readOnly");
    expect(
      compiled.parseResponse(output([component("Other", { text: "New" })])).spec
        ?.content[0]
    ).not.toHaveProperty("readOnly");
    expect(() => compiled.parseResponse(output([section]))).toThrow();
  });
});
