// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import { compileGenerationSchema } from "./generationSchema.ts";
import {
  extractAuthored,
  indexAuthored,
  type Content,
} from "../../internal/generation/authored.ts";

const keep = { mode: "keep" };
const unset = { mode: "unset" };
const set = (value: any) => ({ mode: "set", value });
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
const baseline = (): Content => ({
  content: [
    {
      type: "Section",
      props: {
        id: "section",
        title: "Original",
        extra: { keep: true },
        slots: {
          heading: [
            {
              type: "Heading",
              props: {
                id: "heading",
                text: "Authored",
                optional: null,
                style: { color: "red", width: 15, inherited: 99 },
                links: [],
                hidden: true,
              },
              readOnly: { text: true },
            },
          ],
        },
        copied: [{ type: "Heading", props: { id: "heading", text: "Copy" } }],
      },
      readOnly: { title: true },
    },
  ],
});
const headingProps = (text = keep) => ({
  text,
  optional: keep,
  style: keep,
  links: keep,
});
const edit = (operations: any[]) => ({
  text: "Updated",
  result: { action: "edit", operations },
});
const create = (content: any[]) => ({
  text: "Created",
  result: { action: "create", content },
});
const heading = (id: string | null = null, props = headingProps()) => ({
  type: "Heading",
  id,
  props,
});

describe("strict authored overrides", () => {
  it("shares override modes and Id enums for a large catalog and starting inventory", () => {
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
        },
      ])
    );
    const content = Array.from({ length: 100 }, (_, index) => ({
      type: `Section${index % 20}`,
      props: {
        id: `existing-component-${index}`,
        ...Object.fromEntries(
          Array.from({ length: 75 }, (_, prop) => [
            `property${prop}`,
            "Authored",
          ])
        ),
      },
    }));
    const compiled = compileGenerationSchema(
      createPuckGenerationCatalog(components),
      ["en"],
      { content }
    );
    expect(JSON.stringify(compiled.jsonSchema)).toContain("$ref");
    expect(compiled.inventory.targets).toHaveLength(100);
    const overrides = Object.fromEntries(
      Array.from({ length: 75 }, (_, index) => [
        `property${index}`,
        index === 0 ? set("Updated") : keep,
      ])
    );
    const result = compiled.materialize(
      edit([{ action: "update", id: "existing-component-0", props: overrides }])
    ).spec!;
    expect(result.content[0].props.property0).toBe("Updated");
    expect(result.content[0].props.property1).toBe("Authored");
    expect(() =>
      compiled.materialize(
        edit([{ action: "update", id: "unknown", props: overrides }])
      )
    ).toThrow();
  });
  it("treats an empty MainContent scaffold as blank but counts its authored descendants", () => {
    const c = createPuckGenerationCatalog({
      Heading: { generation: { props: z.object({ text: z.string() }) } },
    });
    const scaffold = {
      content: [{ type: "MainContent", props: { id: "main", content: [] } }],
    };
    const compiled = compileGenerationSchema(c, ["en"], scaffold);
    expect(compiled.isBlankPage).toBe(true);
    const created = compiled.materialize(
      create([
        {
          type: "MainContent",
          id: "main",
          props: {
            content: set([
              { type: "Heading", id: null, props: { text: set("New page") } },
            ]),
          },
        },
      ])
    ).spec!;
    expect(created.content[0].props.id).toBe("main");
    expect(compileGenerationSchema(c, ["en"], created).isBlankPage).toBe(false);
  });
  it("keeps every wire property required and closes every object", () => {
    const compiled = compileGenerationSchema(catalog(), ["en"], baseline());
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
    visit(compiled.jsonSchema);
    expect(() =>
      compiled.materialize(
        edit([{ action: "update", id: "heading", props: { text: set("New") } }])
      )
    ).toThrow();
  });
  it("merges nested objects and preserves metadata, copied slots, and unexposed configuration", () => {
    const start = baseline();
    const compiled = compileGenerationSchema(catalog(), ["en"], start);
    const result = compiled.materialize(
      edit([
        {
          action: "update",
          id: "heading",
          props: {
            ...headingProps(set("New")),
            style: set({ color: set("blue"), width: keep }),
          },
        },
      ])
    ).spec!;
    const child = result.content[0].props.slots.heading[0];
    expect(child.props).toMatchObject({
      id: "heading",
      text: "New",
      style: { color: "blue", width: 15, inherited: 99 },
      optional: null,
      hidden: true,
    });
    expect(child.readOnly).toEqual({ text: true });
    expect(result.content[0].props.copied).toEqual(
      start.content[0].props.copied
    );
    expect(start).toEqual(baseline());
    expect(compiled.inventory.targets).toEqual(["section", "heading"]);
    expect(JSON.stringify(compiled.context)).not.toContain("copied");
    expect(JSON.stringify(compiled.context)).not.toContain("inherited");
  });
  it("distinguishes absence from explicit null and replaces arrays completely", () => {
    const compiled = compileGenerationSchema(catalog(), ["en"], baseline());
    const result = compiled.materialize(
      edit([
        {
          action: "update",
          id: "heading",
          props: {
            ...headingProps(),
            optional: unset,
            links: set([{ label: "Home", url: "/" }]),
          },
        },
      ])
    ).spec!;
    expect(
      Object.hasOwn(result.content[0].props.slots.heading[0].props, "optional")
    ).toBe(false);
    expect(
      compiled.materialize(
        edit([
          {
            action: "update",
            id: "heading",
            props: { ...headingProps(), optional: set(null) },
          },
        ])
      ).spec!.content[0].props.slots.heading[0].props.optional
    ).toBe(null);
    expect(result.content[0].props.slots.heading[0].props.links).toEqual([
      { label: "Home", url: "/" },
    ]);
    expect(() =>
      compiled.materialize(
        edit([
          {
            action: "update",
            id: "heading",
            props: { ...headingProps(), text: unset },
          },
        ])
      )
    ).toThrow();
  });
  it("uses defaults and contextual fixed-slot templates with fresh subtree identities", () => {
    const compiled = compileGenerationSchema(catalog(), ["en"]);
    const response = create([
      {
        type: "Section",
        id: null,
        props: { title: keep, slots: set({ heading: set([heading()]) }) },
      },
    ]);
    const result = compiled.materialize(response).spec!;
    const child = result.content[0].props.slots.heading[0];
    expect(child.props.text).toBe("Contextual");
    expect(child.props.style.width).toBe(25);
    expect(child.props.id).not.toBe("template");
    expect(result.content[0].props.id).not.toBe(child.props.id);
    expect(indexAuthored(catalog(), result).items.size).toBe(2);
  });
  it("preserves unexposed values in strict objects and object-valued unions", () => {
    const c = createPuckGenerationCatalog({
      Box: {
        generation: {
          props: z.strictObject({
            choice: z.union([
              z.strictObject({ kind: z.literal("a"), text: z.string() }),
              z.strictObject({ kind: z.literal("b"), count: z.number() }),
            ]),
          }),
        },
      },
    });
    const start = {
      content: [
        {
          type: "Box",
          props: {
            id: "box",
            choice: { kind: "a", text: "Old", inherited: "Keep" },
            hidden: true,
          },
        },
      ],
    };
    const compiled = compileGenerationSchema(c, ["en"], start);
    expect(compiled.context.content[0].props.choice).toEqual({
      kind: "a",
      text: "Old",
    });
    const result = compiled.materialize(
      edit([
        {
          action: "update",
          id: "box",
          props: { choice: set({ kind: keep, text: set("New") }) },
        },
      ])
    ).spec!;
    expect(result.content[0].props.choice).toEqual({
      kind: "a",
      text: "New",
      inherited: "Keep",
    });
    expect(result.content[0].props.hidden).toBe(true);
  });
  it("projects incomplete object-union defaults before applying explicit overrides", () => {
    const c = createPuckGenerationCatalog({
      Box: {
        generation: {
          props: z.object({
            choice: z.union([
              z.object({ kind: z.literal("a"), text: z.string() }),
              z.object({ kind: z.literal("b"), count: z.number() }),
            ]),
          }),
        },
        defaultProps: { choice: { kind: "b", internal: "Preserve" } },
      },
    });
    expect(
      extractAuthored(
        c,
        {
          content: [
            { type: "Box", props: c.data.components.Box.defaultProps! },
          ],
        },
        { includeIds: false }
      ).content[0].props.choice
    ).toEqual({ kind: "b" });
    const result = compileGenerationSchema(c, ["en"]).materialize(
      create([
        {
          type: "Box",
          id: null,
          props: { choice: set({ kind: keep, count: set(3) }) },
        },
      ])
    ).spec!;
    expect(result.content[0].props.choice).toEqual({
      kind: "b",
      count: 3,
      internal: "Preserve",
    });
  });
  it("handles complete arrays with optional values and nested authored slots", () => {
    const c = createPuckGenerationCatalog({
      Child: {
        generation: { props: z.object({ text: z.string() }) },
        defaultProps: { text: "Child" },
        nestedOnly: true,
      },
      List: {
        generation: {
          props: z.object({
            rows: z.array(
              z.object({
                label: z.string().optional(),
                children: z.array(z.unknown()),
              })
            ),
          }),
        },
        fields: {
          rows: {
            type: "array",
            arrayFields: { children: { type: "slot", allow: ["Child"] } },
          },
        },
        defaultProps: { rows: [] },
      },
    });
    const compiled = compileGenerationSchema(c, ["en"]);
    const result = compiled.materialize(
      create([
        {
          type: "List",
          id: null,
          props: {
            rows: set([
              {
                label: unset,
                children: set([
                  { type: "Child", id: null, props: { text: keep } },
                ]),
              },
            ]),
          },
        },
      ])
    ).spec!;
    expect(result.content[0].props.rows[0].children[0].props.text).toBe(
      "Child"
    );
    expect(Object.hasOwn(result.content[0].props.rows[0], "label")).toBe(false);
    expect(indexAuthored(c, result).items.size).toBe(2);
  });
  it("reuses existing subtree identities during an explicitly authorized redesign", () => {
    const compiled = compileGenerationSchema(catalog(), ["en"], baseline(), {
      allowRedesign: true,
    });
    const result = compiled.materialize({
      text: "Redesigned",
      result: {
        action: "redesign",
        content: [
          {
            type: "Section",
            id: "section",
            props: { title: set("Redesign"), slots: keep },
          },
        ],
      },
    }).spec!;
    expect(result.content[0].props.id).toBe("section");
    expect(result.content[0].props.slots.heading[0].props.id).toBe("heading");
  });
  it("uses the enclosing default template for new slot children during an edit", () => {
    const compiled = compileGenerationSchema(catalog(), ["en"], baseline());
    const result = compiled.materialize(
      edit([
        {
          action: "update",
          id: "section",
          props: { title: keep, slots: set({ heading: set([heading()]) }) },
        },
      ])
    ).spec!;
    expect(result.content[0].props.slots.heading[0].props.text).toBe(
      "Contextual"
    );
    expect(result.content[0].props.slots.heading[0].props.id).not.toBe(
      "heading"
    );
  });
  it("reports missing values and never fills invalid explicit values from defaults", () => {
    const c = createPuckGenerationCatalog({
      Required: {
        generation: { props: z.object({ title: z.string().min(1) }) },
      },
    });
    const compiled = compileGenerationSchema(c, ["en"]);
    expect(() =>
      compiled.materialize(
        create([{ type: "Required", id: null, props: { title: keep } }])
      )
    ).toThrow(/title/);
    expect(() =>
      compileGenerationSchema(catalog(), ["en"]).materialize(
        create([
          { type: "Section", id: null, props: { title: set(42), slots: keep } },
        ])
      )
    ).toThrow();
  });
  it("rejects duplicate, unknown, and incorrectly reused references and slot types", () => {
    const compiled = compileGenerationSchema(catalog(), ["en"], baseline());
    expect(() =>
      compiled.materialize(
        edit([
          {
            action: "update",
            id: "section",
            props: {
              title: keep,
              slots: set({ heading: set([heading("unknown")]) }),
            },
          },
        ])
      )
    ).toThrow();
    expect(() =>
      compiled.materialize(
        edit([
          {
            action: "update",
            id: "section",
            props: {
              title: keep,
              slots: set({ heading: set([heading("section")]) }),
            },
          },
        ])
      )
    ).toThrow(/reused/);
    expect(() =>
      compiled.materialize(
        edit([
          {
            action: "update",
            id: "section",
            props: {
              title: keep,
              slots: set({
                heading: set([heading("heading"), heading("heading")]),
              }),
            },
          },
        ])
      )
    ).toThrow();
    const duplicate = baseline();
    duplicate.content.push(duplicate.content[0]);
    expect(() => compileGenerationSchema(catalog(), ["en"], duplicate)).toThrow(
      /duplicate/
    );
  });
  it("applies multiple bounded operations atomically and rejects conflicts, cycles and invalid destinations", () => {
    const start = baseline();
    start.content.push({
      ...baseline().content[0],
      props: {
        ...baseline().content[0].props,
        id: "other",
        slots: {
          heading: [
            {
              type: "Heading",
              props: {
                id: "other-heading",
                text: "Other",
                optional: null,
                hidden: true,
                style: { color: "red", width: 10, inherited: 99 },
                links: [],
              },
            },
          ],
        },
      },
    });
    const compiled = compileGenerationSchema(catalog(), ["en"], start);
    const result = compiled.materialize(
      edit([
        { action: "update", id: "heading", props: headingProps(set("Edited")) },
        { action: "move", id: "other", destination: "content", index: 0 },
      ])
    ).spec!;
    expect(result.content.map((item) => item.props.id)).toEqual([
      "other",
      "section",
    ]);
    expect(result.content[1].props.slots.heading[0].props.text).toBe("Edited");
    expect(() =>
      compiled.materialize(
        edit([
          { action: "remove", id: "section" },
          { action: "update", id: "heading", props: headingProps() },
        ])
      )
    ).toThrow(/ancestor/);
    expect(() =>
      compiled.materialize(
        edit([
          {
            action: "move",
            id: "section",
            destination: "content/0/props/slots/heading",
            index: 0,
          },
        ])
      )
    ).toThrow(/cycle/);
    expect(() =>
      compiled.materialize(
        edit([
          {
            action: "insert",
            destination: "future",
            index: 0,
            component: heading(),
          },
        ])
      )
    ).toThrow();
    expect(() =>
      compiled.materialize(
        edit([
          { action: "move", id: "other", destination: "content", index: 99 },
        ])
      )
    ).toThrow(/bounds/);
    expect(start.content[0].props.slots.heading[0].props.text).toBe("Authored");
  });
  it("permits full-page redesign only with explicit authorization and clarifies without mutation", () => {
    const compiled = compileGenerationSchema(catalog(), ["en"], baseline());
    const response = {
      text: "Need details",
      result: { action: "clarification", question: "Which image?" },
    };
    expect(compiled.materialize(response)).toEqual({
      text: "Need details\n\nWhich image?",
      spec: null,
    });
    expect(() =>
      compiled.materialize({
        text: "Redesign",
        result: { action: "redesign", content: [] },
      })
    ).toThrow();
  });
  it("preserves entity bindings and locale values and rejects unsupported schemas before execution", () => {
    const c = createPuckGenerationCatalog({
      Text: {
        generation: {
          props: z.object({
            binding: z.object({ field: z.string(), constantValue: z.string() }),
            text: z.object({ defaultValue: z.string() }).catchall(z.string()),
          }),
        },
        defaultProps: {
          binding: { field: "name", constantValue: "" },
          text: { defaultValue: "Hello", es: "Hola" },
        },
      },
    });
    const compiled = compileGenerationSchema(c, ["en", "es"]);
    const result = compiled.materialize(
      create([
        {
          type: "Text",
          id: null,
          props: {
            binding: keep,
            text: set({ defaultValue: keep, en: unset, es: set("Nuevo") }),
          },
        },
      ])
    ).spec!;
    expect(result.content[0].props).toMatchObject({
      binding: { field: "name", constantValue: "" },
      text: { defaultValue: "Hello", es: "Nuevo" },
    });
    expect(extractAuthored(c, result).content[0].props.text).toEqual({
      defaultValue: "Hello",
      es: "Nuevo",
    });
    for (const schema of [
      z.any(),
      z.record(z.string(), z.string()),
      z.string().transform((s) => s.length),
      z.string().refine((s) => !!s),
    ]) {
      expect(() =>
        compileGenerationSchema(
          createPuckGenerationCatalog({
            Invalid: { generation: { props: z.object({ value: schema }) } },
          }),
          ["en"]
        )
      ).toThrow();
    }
    expect(() =>
      compileGenerationSchema(catalog(), ["en"], {
        ...baseline(),
        zones: { old: baseline().content },
      })
    ).toThrow(/legacy zones/);
  });
});
