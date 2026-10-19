// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import { compileGenerationSchema } from "./generationSchema.ts";
import { isBlankGenerationPage } from "../../internal/generation/isBlankGenerationPage.ts";
import { buildGenerationPrompt } from "./generationValidation.ts";
import { slottedFixture } from "../../internal/generation/slottedGenerationTestUtils.ts";
import {
  collectAuthoredIds,
  validateAuthored,
} from "../../internal/generation/authored.ts";

import {
  creationResponse as create,
  clarificationResponse,
} from "./editGenerationTestUtils.ts";

const defaults = { $default: true };
const unset = { $unset: true };
const catalog = () =>
  createPuckGenerationCatalog({
    Heading: {
      generation: {
        props: z.object({
          text: z.string().min(1),
          optional: z.string().nullable().optional(),
          style: z.object({
            color: z.enum(["red", "blue"]),
            width: z.number().min(1),
          }),
          links: z
            .array(z.object({ label: z.string(), url: z.string() }))
            .max(3),
        }),
      },
      defaultProps: {
        text: "Default",
        style: { color: "red", width: 10 },
        links: [],
        hidden: { preserve: true },
      },
      fields: { text: { type: "text" } },
      nestedOnly: true,
    },
    Section: {
      generation: {
        props: z.object({
          title: z.string(),
          slots: z.object({ heading: z.array(z.unknown()).length(1) }),
        }),
      },
      fields: {
        slots: {
          type: "object",
          objectFields: { heading: { type: "slot", allow: ["Heading"] } },
        },
        copied: { type: "slot" },
      },
      defaultProps: {
        title: "Default section",
        slots: {
          heading: [
            {
              type: "Heading",
              props: {
                id: "template",
                text: "Contextual",
                style: { color: "blue", width: 25 },
                links: [],
              },
            },
          ],
        },
      },
    },
  });

const heading = (optional: any = unset) => ({
  type: "Heading",
  props: { text: defaults, optional, style: defaults, links: [] },
});
const section = (child: any = heading()) => ({
  type: "Section",
  props: { title: defaults, slots: { heading: [child] } },
});

describe("fresh page creation schema", () => {
  it("enforces prepared card counts after materialization and default selection", () => {
    const fixture = slottedFixture();
    const preparation = {
      question: null,
      translationMode: "translate" as const,
      cardCounts: [{ componentType: "Section", instanceIndex: null, count: 3 }],
    };
    const compiled = compileGenerationSchema(
      fixture.catalog,
      ["en", "fr"],
      undefined,
      preparation
    );
    const wire = z.fromJSONSchema(compiled.jsonSchema);
    const output = create(
      [
        fixture.section([
          fixture.card("One"),
          fixture.card("Two"),
          fixture.card("Three"),
        ]),
      ],
      "translate"
    );
    expect(wire.safeParse(output).success).toBe(true);
    const spec = compiled.materialize(output).spec!;
    expect(spec.content[0].props.slots.CardSlot).toHaveLength(3);
    expect(spec.content[0].props.data.constantValue).toHaveLength(3);
    expect(
      spec.content[0].props.slots.CardSlot[2].props.data.question.defaultValue
    ).toBe("Three");
    const empty = create([fixture.section([])], "translate");
    expect(wire.safeParse(empty).success).toBe(true);
    expect(() => compiled.materialize(empty)).toThrow();
    const two = compileGenerationSchema(
      fixture.catalog,
      ["en", "fr"],
      undefined,
      {
        ...preparation,
        cardCounts: [
          { componentType: "Section", instanceIndex: null, count: 2 },
        ],
      }
    );
    expect(() =>
      two.materialize(create([fixture.section()], "translate"))
    ).toThrow("expected 2 manual CardSlot children");
  });

  it.each([false, true])(
    "allows different counts per instance alongside a linked collection (general count %s)",
    (general) => {
      const fixture = slottedFixture();
      const cardCounts = [
        {
          componentType: "Section",
          instanceIndex: general ? null : 1,
          count: 3,
        },
        { componentType: "Section", instanceIndex: 2, count: 5 },
      ];
      const compiled = compileGenerationSchema(
        fixture.catalog,
        ["en", "fr"],
        undefined,
        { question: null, translationMode: "translate", cardCounts }
      );
      const manual = (count: number) =>
        fixture.section(
          Array.from({ length: count }, (_, index) =>
            fixture.card(`Card ${index}`)
          )
        );
      const main = {
        type: "MainContent",
        props: { content: [manual(3), manual(5)] },
      };
      const content = [fixture.section([], fixture.linked), main];
      const output = create(content, "translate");
      expect(
        z.fromJSONSchema(compiled.jsonSchema).safeParse(output).success
      ).toBe(true);
      const spec = compiled.materialize(output).spec!;
      expect(spec.content[0].props.data.field).toBe("c_items");
      expect(spec.content[0].props.slots.CardSlot).toHaveLength(0);
      expect(
        spec.content[1].props.content.map(
          (item: any) => item.props.slots.CardSlot.length
        )
      ).toEqual([3, 5]);
      // A repair can reuse the compiler without retaining occurrence counters.
      expect(() => compiled.materialize(output)).not.toThrow();
      main.props.content = [manual(3), manual(3)];
      expect(() => compiled.materialize(create(content, "translate"))).toThrow(
        "Section instance 2: expected 5 manual CardSlot children"
      );
      main.props.content = [manual(3)];
      expect(() => compiled.materialize(create(content, "translate"))).toThrow(
        "omitted a prepared manual card collection"
      );
    }
  );

  it.each([0, null])(
    "does not satisfy a manual count with a linked instance (index %s)",
    (instanceIndex) => {
      const fixture = slottedFixture();
      const compiled = compileGenerationSchema(
        fixture.catalog,
        ["en", "fr"],
        undefined,
        {
          question: null,
          translationMode: "translate",
          cardCounts: [{ componentType: "Section", instanceIndex, count: 0 }],
        }
      );
      expect(() =>
        compiled.materialize(
          create([fixture.section([], fixture.linked)], "translate")
        )
      ).toThrow(
        instanceIndex === null
          ? "omitted a prepared manual card collection"
          : "expected 0 manual CardSlot children"
      );
      if (instanceIndex === null) {
        expect(() =>
          compiled.materialize(
            create(
              [fixture.section([], fixture.linked), fixture.section([])],
              "translate"
            )
          )
        ).not.toThrow();
      }
    }
  );

  it("rejects manual card content authored in inactive entity mappings", () => {
    const fixture = slottedFixture();
    const compiled = compileGenerationSchema(fixture.catalog, ["en", "fr"]);
    const output = create(
      [
        fixture.section([], {
          field: "",
          constantValueEnabled: true,
          mappings: {
            question: {
              field: "",
              constantValueEnabled: true,
              constantValue: "Wrong place",
            },
          },
        }),
      ],
      "translate"
    );
    expect(() => compiled.materialize(output)).toThrow(
      "Manual card content belongs in slots.CardSlot"
    );
  });

  it("adds reachable generation defaults to the prompt without requiring them", () => {
    const components = catalog().data.components;
    const c = createPuckGenerationCatalog(
      {
        Heading: components.Heading,
        Section: components.Section,
        Unreachable: {
          generation: { props: z.object({}) },
          nestedOnly: true,
        },
        Disabled: {},
      },
      {
        defaultGenerationComponentIds: [
          "Section",
          "Unreachable",
          "Missing",
          "Disabled",
          "Section",
        ],
      }
    );
    const compiled = compileGenerationSchema(c, ["en"]);
    const prompt = buildGenerationPrompt(c, compiled.availableComponentNames);
    expect(prompt).toContain(
      'Default components for fresh generation: ["Section"]'
    );
    expect(prompt).toContain("explicit user requests take precedence");
    expect(prompt).not.toContain("Unreachable");
    expect(prompt).not.toContain("Missing");
    expect(prompt).not.toContain("Disabled");
    expect(
      compiled.materialize(
        create([{ type: "MainContent", props: { content: [] } }])
      ).spec
    ).toBeTruthy();
    expect(buildGenerationPrompt(catalog())).not.toContain(
      "Default components for fresh generation:"
    );
    c.puckOptions.defaultGenerationComponentIds = [];
    expect(buildGenerationPrompt(c)).not.toContain(
      "Default components for fresh generation:"
    );
  });

  it.each([
    ["Header", "Footer"],
    ["ExpandedHeader", "ExpandedFooter"],
  ])("keeps %s and %s outside MainContent", (headerType, footerType) => {
    const c = createPuckGenerationCatalog({
      ...catalog().data.components,
      [headerType]: { generation: { props: z.object({}) } },
      [footerType]: { generation: { props: z.object({}) } },
    });
    const compiled = compileGenerationSchema(c, ["en"]);
    const header = { type: headerType, props: {} };
    const footer = { type: footerType, props: {} };
    const main = {
      type: "MainContent",
      props: { content: [section(), section()] },
    };
    const result = compiled.materialize(create([header, main, footer])).spec!;
    expect(result.content.map(({ type }) => type)).toEqual([
      headerType,
      "MainContent",
      footerType,
    ]);
    expect(
      result.content[1].props.content.map((item: any) => item.type)
    ).toEqual(["Section", "Section"]);
    for (const chrome of [header, footer]) {
      expect(() =>
        compiled.materialize(
          create([{ ...main, props: { content: [chrome, section()] } }])
        )
      ).toThrow();
    }
    const prompt = buildGenerationPrompt(c, compiled.availableComponentNames);
    expect(prompt).toContain("before MainContent");
    expect(prompt).toContain("after MainContent");
    expect(prompt).toContain("single MainContent.props.content list");
  });

  it("accepts only empty content or a single empty MainContent scaffold", () => {
    for (const data of [
      { content: [] },
      {
        content: [{ type: "MainContent", props: { id: "main", content: [] } }],
      },
    ]) {
      expect(isBlankGenerationPage(data)).toBe(true);
      expect(compileGenerationSchema(catalog(), ["en"], data).isBlankPage).toBe(
        true
      );
    }
    for (const data of [
      { content: [{ type: "Section", props: { id: "section" } }] },
      { content: [{ type: "MainContent", props: { content: [section()] } }] },
      { content: [{ type: "MainContent", props: {} }] },
      {
        content: [
          { type: "MainContent", props: { content: [] } },
          { type: "MainContent", props: { content: [] } },
        ],
      },
      { content: [], zones: { legacy: [section()] } },
    ]) {
      expect(isBlankGenerationPage(data)).toBe(false);
      expect(() => compileGenerationSchema(catalog(), ["en"], data)).toThrow();
    }
  });

  it("uses direct values, contextual defaults and fresh identities without stripping undeclared defaults", () => {
    const c = catalog();
    const compiled = compileGenerationSchema(c, ["en"]);
    const response = create([section(), section()]);
    const result = compiled.materialize(response).spec!;
    const child = result.content[0].props.slots.heading[0];
    expect(child.props.text).toBe("Contextual");
    expect(child.props.style.width).toBe(25);
    expect(child.props.id).not.toBe("template");
    expect(collectAuthoredIds(c, result).size).toBe(4);
    expect(collectAuthoredIds(c, result)).not.toEqual(
      collectAuthoredIds(c, compiled.materialize(response).spec!)
    );
    expect(c.data.components.Section.defaultProps!.slots).toMatchObject({
      heading: [{ props: { id: "template" } }],
    });
    const direct = compiled.materialize(
      create([
        section({
          ...heading(null),
          props: { ...heading(null).props, text: "Authored" },
        }),
      ])
    ).spec!;
    expect(direct.content[0].props.slots.heading[0].props).toMatchObject({
      text: "Authored",
      optional: null,
    });
    expect(Object.hasOwn(child.props, "optional")).toBe(false);
  });

  it("preserves undeclared object and union defaults while validating all authored constraints", () => {
    const c = createPuckGenerationCatalog({
      Box: {
        generation: {
          props: z.strictObject({
            style: z.strictObject({
              width: z.number().min(1).describe("Width in pixels"),
            }),
            choice: z.union([
              z.strictObject({ kind: z.literal("a"), text: z.string() }),
              z.strictObject({ kind: z.literal("b"), count: z.number() }),
            ]),
            nullable: z.string().nullable(),
            fallback: z.string().default("Schema default"),
          }),
        },
        defaultProps: {
          hidden: true,
          style: { width: 2, internal: 99 },
          choice: { kind: "b", internal: "Preserve" },
          nullable: null,
        },
      },
    });
    const compiled = compileGenerationSchema(c, ["en"]);
    const response = create([
      {
        type: "Box",
        props: {
          style: { width: 3 },
          choice: { kind: "b", count: 4 },
          nullable: null,
          fallback: defaults,
        },
      },
    ]);
    const result = compiled.materialize(response).spec!;
    expect(result.content[0].props).toMatchObject({
      hidden: true,
      style: { width: 3, internal: 99 },
      choice: { kind: "b", count: 4, internal: "Preserve" },
      nullable: null,
      fallback: "Schema default",
    });
    expect(() => validateAuthored(c, result)).not.toThrow();
    response.result.content[0].props.style.width = 0;
    expect(() => compiled.materialize(response)).toThrow();
    expect(JSON.stringify(compiled.jsonSchema)).toContain("Width in pixels");
  });

  it("emits only reachable components and enforces root and slot permissions in final validation", () => {
    const c = createPuckGenerationCatalog(
      {
        Root: {
          generation: { props: z.object({ children: z.array(z.unknown()) }) },
          fields: {
            children: {
              type: "slot",
              allow: ["Child", "Blocked"],
              disallow: ["Blocked"],
            },
          },
          defaultProps: { children: [] },
          description: "Unique root description",
        },
        Child: {
          generation: { props: z.object({ text: z.string() }) },
          nestedOnly: true,
        },
        Blocked: {
          generation: { props: z.object({ secret: z.string() }) },
          nestedOnly: true,
        },
        Unreachable: {
          generation: { props: z.object({ unused: z.string() }) },
          nestedOnly: true,
        },
      },
      { rootAllowedComponentIds: ["Root", "Child"] }
    );
    const compiled = compileGenerationSchema(c, ["en"]);
    expect(compiled.availableComponentNames).toEqual(["Child", "Root"]);
    const serialized = JSON.stringify(compiled.jsonSchema);
    for (const name of [
      "Blocked",
      "Unreachable",
      "MainContent",
      "Unique root description",
    ])
      expect(serialized).not.toContain(name);
    const prompt = buildGenerationPrompt(c, compiled.availableComponentNames);
    expect(prompt.split("Unique root description")).toHaveLength(2);
    expect(prompt).not.toContain("Unreachable");
    const valid = {
      type: "Root",
      props: { children: [{ type: "Child", props: { text: "Hello" } }] },
    };
    expect(compiled.materialize(create([valid])).spec).toBeTruthy();
    for (const name of ["Blocked", "Unreachable", "Root"]) {
      const invalid = {
        type: "Root",
        props: {
          id: "root",
          children: [{ type: name, props: { id: "child", text: "Hello" } }],
        },
      };
      expect(() => validateAuthored(c, { content: [invalid] })).toThrow(
        /not allowed/
      );
      expect(() => compiled.materialize(create([invalid]))).toThrow();
    }
    expect(() =>
      compiled.materialize(
        create([{ type: "Child", props: { text: "Root child" } }])
      )
    ).toThrow();
    expect(() =>
      validateAuthored(c, {
        content: [
          { type: "Child", props: { id: "child", text: "Root child" } },
        ],
      })
    ).toThrow(/not allowed/);
    expect(() =>
      validateAuthored(c, {
        content: [{ type: "MainContent", props: { id: "main", content: [] } }],
      })
    ).toThrow(/not allowed/);
    // Even defaults must obey the final slot permissions.
    c.data.components.Root.defaultProps!.children = [
      { type: "Blocked", props: { secret: "x" } },
    ];
    expect(() =>
      compileGenerationSchema(c, ["en"]).materialize(
        create([{ type: "Root", props: { children: defaults } }])
      )
    ).toThrow(/not allowed/);
  });

  it("preflights unreachable contracts independently", () => {
    for (const value of [
      z.any(),
      z.record(z.string(), z.string()),
      z.string().transform((s) => s.length),
      z.string().refine((s) => !!s),
      z
        .string()
        .refine((s) => !!s)
        .optional(),
    ]) {
      expect(() =>
        compileGenerationSchema(
          createPuckGenerationCatalog(
            {
              Invalid: {
                generation: { props: z.object({ value }) },
                nestedOnly: true,
              },
            },
            { rootAllowedComponentIds: ["MainContent"] }
          ),
          ["en"]
        )
      ).toThrow();
    }
  });

  it.each(["fixed", "catchall"] as const)(
    "normalizes inherited and authored locale values with a %s schema",
    (kind) => {
      const fixed = z.object({
        defaultValue: z.string(),
        fr: z.string().optional(),
        de: z.string().optional(),
        hasLocalizedValue: z.literal("true").optional(),
      });
      const c = createPuckGenerationCatalog({
        Heading: {
          generation: {
            props: z.object({
              text: kind === "fixed" ? fixed : fixed.catchall(z.string()),
            }),
          },
          defaultProps: {
            text: {
              defaultValue: "Hello",
              fr: "Bonjour",
              de: "Hallo",
              hasLocalizedValue: "true",
            },
          },
        },
      });
      const compiled = compileGenerationSchema(c, ["en", "fr"]);
      for (const translationMode of ["defaultOnly", "translate"] as const) {
        for (const text of [
          defaults,
          {
            defaultValue: "Updated",
            fr: "Nouveau",
            de: "Neu",
            hasLocalizedValue: defaults,
            ...(kind === "catchall" ? { en: unset } : {}),
          },
        ]) {
          const result = compiled.materialize(
            create([{ type: "Heading", props: { text } }], translationMode)
          ).spec!;
          const inherited = text === defaults;
          expect(result.content[0].props.text).toEqual({
            defaultValue: inherited ? "Hello" : "Updated",
            hasLocalizedValue: "true",
            ...(translationMode === "translate"
              ? { fr: inherited ? "Bonjour" : "Nouveau" }
              : {}),
          });
        }
      }
    }
  );

  it.each(["defaultOnly", "translate"] as const)(
    "materializes localized text in %s mode with nested slots",
    (translationMode) => {
      const c = createPuckGenerationCatalog({
        Child: {
          generation: { props: z.object({ text: z.string() }) },
          defaultProps: { text: "Child" },
          nestedOnly: true,
        },
        List: {
          generation: {
            props: z.object({
              text: z.object({ defaultValue: z.string() }).catchall(z.string()),
              rows: z
                .array(
                  z.object({
                    label: z.string().optional(),
                    children: z.array(z.unknown()),
                  })
                )
                .max(2),
            }),
          },
          fields: {
            rows: {
              type: "array",
              arrayFields: { children: { type: "slot", allow: ["Child"] } },
            },
          },
          defaultProps: {
            text: { defaultValue: "Hello", es: "Hola" },
            rows: [],
          },
        },
      });
      const compiled = compileGenerationSchema(c, ["en", "es"]);
      const result = compiled.materialize(
        create(
          [
            {
              type: "List",
              props: {
                text: { defaultValue: defaults, en: unset, es: "Nuevo" },
                rows: [
                  {
                    label: unset,
                    children: [{ type: "Child", props: { text: defaults } }],
                  },
                ],
              },
            },
          ],
          translationMode
        )
      ).spec!;
      expect(result.content[0].props.text).toEqual({
        defaultValue: "Hello",
        ...(translationMode === "translate" ? { es: "Nuevo" } : {}),
      });
      expect(result.content[0].props.rows[0].children[0].props.text).toBe(
        "Child"
      );
      expect(Object.hasOwn(result.content[0].props.rows[0], "label")).toBe(
        false
      );
    }
  );

  it("rejects incomplete output, model Ids, invalid values, unavailable defaults and removed outcomes", () => {
    const c = createPuckGenerationCatalog({
      Required: {
        generation: { props: z.object({ title: z.string().min(1) }) },
      },
    });
    const compiled = compileGenerationSchema(c, ["en"]);
    for (const props of [
      {},
      { title: defaults },
      { title: unset },
      { title: null },
      { title: "" },
      { title: 42 },
      { title: "Valid", id: "invented" },
    ]) {
      expect(() =>
        compiled.materialize(create([{ type: "Required", props }]))
      ).toThrow();
    }
    expect(() =>
      compiled.materialize(
        create([{ type: "Required", id: null, props: { title: "Valid" } }])
      )
    ).toThrow();
    for (const action of [
      "edit",
      "insert",
      "update",
      "remove",
      "move",
      "redesign",
    ])
      expect(() =>
        compiled.materialize({ ...create([]), result: { action, content: [] } })
      ).toThrow();
    const { translationMode: _translationMode, ...missingMode } = create([
      { type: "Required", props: { title: "Valid" } },
    ]);
    expect(() => compiled.materialize(missingMode)).toThrow("translationMode");
    expect(() => compiled.materialize(create([]))).toThrow();
    expect(compiled.materialize(clarificationResponse("Which page?"))).toEqual({
      text: "Which page?",
      spec: null,
    });
  });

  it("reduces a large catalog against the previous override schema baseline", () => {
    // Measured with the previous compiler: 20 sections, 75 defaulted string props each.
    const previousSchemaBytes = 344_080;
    const components = Object.fromEntries(
      Array.from({ length: 20 }, (_, componentIndex) => [
        `Section${componentIndex}`,
        {
          generation: {
            props: z.object(
              Object.fromEntries(
                Array.from({ length: 75 }, (_, index) => [
                  `property${index}`,
                  z.string(),
                ])
              )
            ),
          },
          defaultProps: Object.fromEntries(
            Array.from({ length: 75 }, (_, index) => [
              `property${index}`,
              "Default",
            ])
          ),
        },
      ])
    );
    const compiled = compileGenerationSchema(
      createPuckGenerationCatalog(components),
      ["en"]
    );
    expect(Buffer.byteLength(JSON.stringify(compiled.jsonSchema))).toBeLessThan(
      previousSchemaBytes * 0.6
    );
  });

  it("keeps all wire objects closed and required", () => {
    const visit = (node: any) => {
      if (node.type === "object") {
        expect(node.additionalProperties).toBe(false);
        expect(node.required?.sort()).toEqual(
          Object.keys(node.properties).sort()
        );
      }
      for (const child of Object.values(node.properties ?? {})) visit(child);
      for (const child of Object.values(node.$defs ?? {})) visit(child);
      for (const child of node.anyOf ?? []) visit(child);
      if (node.items) visit(node.items);
    };
    visit(compileGenerationSchema(catalog(), ["en"]).jsonSchema);
  });
});
