// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import { puckDataToFlatSpec, flatSpecToPuckData } from "./puckFlatAdapter.ts";

describe("Puck and flat layout conversion", () => {
  it("reconstructs a new component's declared slot when its parent props are absent", () => {
    const catalog = createPuckGenerationCatalog({
      Promo: {
        props: z.object({
          slots: z.object({ HeadingSlot: z.array(z.unknown()) }),
        }),
        fields: {
          slots: {
            type: "object",
            objectFields: { HeadingSlot: { type: "slot" } },
          },
        },
      },
      Text: { props: z.object({ value: z.string() }) },
    });
    const baseline = {
      root: { props: { title: "Page" } },
      content: [],
      zones: {},
    } as any;
    const flat = {
      root: "root",
      elements: {
        root: { type: "__PuckContentRoot", props: {}, children: ["promo"] },
        promo: {
          type: "Promo",
          props: {},
          slots: { "/slots/HeadingSlot": ["heading"] },
        },
        heading: { type: "Text", props: { value: "Welcome" } },
      },
    };
    const native = flatSpecToPuckData(catalog, flat, baseline);
    expect(native.content).toEqual([
      {
        type: "Promo",
        props: {
          id: "promo",
          slots: {
            HeadingSlot: [
              { type: "Text", props: { id: "heading", value: "Welcome" } },
            ],
          },
        },
      },
    ]);
    expect(
      flatSpecToPuckData(catalog, puckDataToFlatSpec(catalog, native), native)
    ).toEqual(native);
  });

  it("materializes deep slot objects and dense array items while preserving sibling data", () => {
    const catalog = createPuckGenerationCatalog({
      Group: {
        props: z.object({
          groups: z.array(
            z.object({
              label: z.string().optional(),
              settings: z.object({ body: z.array(z.unknown()) }),
            })
          ),
        }),
        fields: {
          groups: {
            type: "array",
            arrayFields: {
              label: { type: "text" },
              settings: {
                type: "object",
                objectFields: { body: { type: "slot" } },
              },
            },
          },
        },
      },
    });
    const baseline = { root: { props: {} }, content: [], zones: {} } as any;
    const flat = {
      root: "root",
      elements: {
        root: { type: "__PuckContentRoot", props: {}, children: ["group"] },
        group: {
          type: "Group",
          props: { groups: [{ label: "Keep" }] },
          slots: {
            "/groups/0/settings/body": [],
            "/groups/1/settings/body": [],
          },
        },
      },
    };
    const native = flatSpecToPuckData(catalog, flat, baseline);
    expect(native.content[0].props.groups).toEqual([
      { label: "Keep", settings: { body: [] } },
      { settings: { body: [] } },
    ]);
    flat.elements.group.props = {} as any;
    flat.elements.group.slots = { "/groups/0/settings/body": [] } as any;
    expect(
      flatSpecToPuckData(catalog, flat, baseline).content[0].props.groups
    ).toEqual([{ settings: { body: [] } }]);
    expect(
      flatSpecToPuckData(catalog, puckDataToFlatSpec(catalog, native), native)
    ).toEqual(native);
  });

  it.each([
    ["/unknown", {}, "Undeclared"],
    ["/label", {}, "declared slot"],
    ["/groups/01/body", {}, "array index"],
    ["/groups/-/body", {}, "array index"],
    ["/groups/2/body", {}, "gap"],
    ["/settings/body", { settings: null }, "slot parent"],
    ["/settings/body", { settings: "wrong" }, "slot parent"],
    ["/settings/body", { settings: [] }, "slot parent"],
    ["/groups/0/body", { groups: {} }, "slot parent"],
    ["/settings/bad~2", {}, "Pointer escape"],
    ["/settings/__proto__", {}, "Reserved property"],
  ])("rejects invalid slot reconstruction at %s", (pointer, props, error) => {
    const catalog = createPuckGenerationCatalog({
      Group: {
        props: z.object({}).passthrough(),
        fields: {
          label: { type: "text" },
          settings: {
            type: "object",
            objectFields: { body: { type: "slot" } },
          },
          groups: { type: "array", arrayFields: { body: { type: "slot" } } },
        },
      },
    });
    const flat = {
      root: "root",
      elements: {
        root: { type: "__PuckContentRoot", props: {}, children: ["group"] },
        group: { type: "Group", props, slots: { [pointer]: [] } },
      },
    };
    expect(() =>
      flatSpecToPuckData(catalog, flat, { root: { props: {} }, content: [] })
    ).toThrow(error);
  });

  it("requires MainContent children to use the dedicated children references", () => {
    const catalog = createPuckGenerationCatalog({});
    expect(() =>
      flatSpecToPuckData(
        catalog,
        {
          root: "root",
          elements: {
            root: { type: "__PuckContentRoot", props: {}, children: ["main"] },
            main: {
              type: "MainContent",
              props: {},
              children: [],
              slots: { "/content": [] },
            },
          },
        },
        { root: { props: {} }, content: [] }
      )
    ).toThrow("Undeclared slot path content");
  });

  it("names disconnected element keys in graph validation errors", () => {
    const catalog = createPuckGenerationCatalog({
      Heading: { props: z.object({ text: z.string() }) },
    });
    expect(() =>
      flatSpecToPuckData(
        catalog,
        {
          root: "root",
          elements: {
            root: { type: "__PuckContentRoot", props: {}, children: [] },
            "disconnected-heading": {
              type: "Heading",
              props: { text: "Orphan" },
            },
          },
        },
        { root: { props: {} }, content: [] }
      )
    ).toThrow("disconnected-heading");
  });

  it("round-trips authored content while preserving the native root and zones", () => {
    const catalog = createPuckGenerationCatalog({
      Heading: { props: z.object({ text: z.string() }) },
    });
    const puckData = {
      root: { props: { title: "Page title" } },
      content: [
        {
          type: "MainContent",
          props: {
            id: "main",
            content: [
              {
                type: "Heading",
                props: { id: "hero/title", text: "Welcome" },
                readOnly: { text: true },
              },
            ],
          },
        },
      ],
      zones: {
        footer: [{ type: "Heading", props: { id: "zoned", text: "Footer" } }],
      },
    } as any;

    const flat = puckDataToFlatSpec(catalog, puckData);
    expect(flat.root).toBeDefined();
    expect(flat.elements).toBeDefined();
    expect(flatSpecToPuckData(catalog, flat, puckData)).toEqual(puckData);
  });

  it("preserves declared nested slot order and IDs containing pointer characters", () => {
    const catalog = createPuckGenerationCatalog({
      Panel: {
        props: z.object({ content: z.array(z.unknown()) }),
        fields: { content: { type: "slot" } },
      },
      Text: { props: z.object({ value: z.string() }) },
    });
    const puckData = {
      root: { props: {} },
      content: [
        {
          type: "Panel",
          props: {
            id: "panel",
            content: [
              { type: "Text", props: { id: "text/~1", value: "inside" } },
            ],
          },
        },
      ],
      zones: {},
    } as any;
    const flat = puckDataToFlatSpec(catalog, puckData);
    expect(flat.elements["panel"].slots).toEqual({ "/content": ["text~1~01"] });
    expect(flatSpecToPuckData(catalog, flat, puckData)).toEqual(puckData);
  });

  it("keeps an explicitly empty slot and safely handles prototype-shaped IDs", () => {
    const catalog = createPuckGenerationCatalog({
      Panel: {
        props: z.object({ content: z.array(z.unknown()) }),
        fields: { content: { type: "slot" } },
      },
    });
    const puckData = {
      root: { props: {} },
      content: [
        { type: "Panel", props: { id: "__proto__", content: [] } },
        { type: "Panel", props: { id: "constructor", content: [] } },
      ],
      zones: {},
    } as any;
    const flat = puckDataToFlatSpec(catalog, puckData);
    expect(flat.elements["__proto__"].slots).toEqual({ "/content": [] });
    expect(flatSpecToPuckData(catalog, flat, puckData)).toEqual(puckData);
  });

  it("rejects missing references and unreachable elements", () => {
    const catalog = createPuckGenerationCatalog({
      Heading: { props: z.object({ text: z.string() }) },
    });
    const baseline = { root: { props: {} }, content: [], zones: {} } as any;
    expect(() =>
      flatSpecToPuckData(
        catalog,
        {
          root: "root",
          elements: {
            root: {
              type: "__PuckContentRoot",
              props: {},
              children: ["missing"],
            },
          },
        },
        baseline
      )
    ).toThrow("Missing flat element missing");
    expect(() =>
      flatSpecToPuckData(
        catalog,
        {
          root: "root",
          elements: {
            root: { type: "__PuckContentRoot", props: {}, children: [] },
            orphan: { type: "Heading", props: { text: "orphan" } },
          },
        },
        baseline
      )
    ).toThrow("unreachable elements");
  });

  it("updates a native derived-slot copy from the single authored graph node", () => {
    const catalog = createPuckGenerationCatalog({
      Group: {
        props: z.object({
          authored: z.array(z.unknown()),
          mirror: z.array(z.unknown()),
        }),
        fields: {
          authored: { type: "slot", allow: ["Text"] },
          mirror: { type: "slot", allow: ["Text"] },
        },
        derivedSlotPaths: [["mirror"]],
      },
      Text: { props: z.object({ value: z.string() }) },
    });
    const authored = { type: "Text", props: { id: "shared", value: "before" } };
    const baseline = {
      root: { props: {} },
      content: [
        {
          type: "MainContent",
          props: {
            id: "main",
            content: [
              {
                type: "Group",
                props: {
                  id: "group",
                  authored: [authored],
                  mirror: [
                    {
                      ...authored,
                      props: { ...authored.props, value: "stale" },
                    },
                  ],
                },
              },
            ],
          },
        },
      ],
      zones: {},
    } as any;
    const flat = puckDataToFlatSpec(catalog, baseline);
    expect(flat.elements.group.slots).toEqual({ "/authored": ["shared"] });
    flat.elements.shared.props.value = "after";
    const decoded = flatSpecToPuckData(catalog, flat, baseline);
    const group = decoded.content[0].props.content[0];
    expect(group.props.mirror[0].props.value).toBe("after");
  });

  it("preserves absent, empty, and nullable slots and maps slots nested in arrays", () => {
    const catalog = createPuckGenerationCatalog({
      Container: {
        props: z.object({
          optionalItems: z.array(z.unknown()).optional(),
          nullableItems: z.array(z.unknown()).nullable(),
          groups: z.array(
            z.object({ nested: z.array(z.unknown()).optional() })
          ),
          values: z.array(z.string()),
        }),
        fields: {
          optionalItems: { type: "slot", allow: ["Text"] },
          nullableItems: { type: "slot", allow: ["Text"] },
          groups: {
            type: "array",
            arrayFields: { nested: { type: "slot", allow: ["Text"] } },
          },
        },
      },
      Text: { props: z.object({ value: z.string() }) },
    });
    const puckData = {
      root: { props: {} },
      content: [
        {
          type: "Container",
          props: {
            id: "container",
            optionalItems: [],
            nullableItems: null,
            groups: [
              {
                nested: [
                  { type: "Text", props: { id: "nested", value: "child" } },
                ],
              },
            ],
            values: ["ordinary", "array"],
          },
        },
      ],
      zones: {},
    } as any;
    const flat = puckDataToFlatSpec(catalog, puckData);
    expect(flat.elements.container.slots).toEqual({
      "/optionalItems": [],
      "/groups/0/nested": ["nested"],
    });
    expect(flat.elements.container.props).toMatchObject({
      nullableItems: null,
      values: ["ordinary", "array"],
    });
    expect(flatSpecToPuckData(catalog, flat, puckData)).toEqual(puckData);

    const absent = structuredClone(puckData);
    delete absent.content[0].props.optionalItems;
    const absentFlat = puckDataToFlatSpec(catalog, absent);
    expect(absentFlat.elements.container.slots).not.toHaveProperty(
      "/optionalItems"
    );
    expect(flatSpecToPuckData(catalog, absentFlat, absent)).toEqual(absent);
  });

  it("allocates a deterministic root key that cannot collide with authored IDs", () => {
    const catalog = createPuckGenerationCatalog({
      Text: { props: z.object({ value: z.string() }) },
    });
    const puckData = {
      root: { props: {} },
      content: [
        {
          type: "Text",
          props: { id: "__puck_content_root__", value: "first" },
        },
        { type: "Text", props: { id: "second", value: "second" } },
      ],
      zones: {},
    } as any;
    const flat = puckDataToFlatSpec(catalog, puckData);
    expect(flat.root).toBe("___puck_content_root__");
    expect(flat.elements[flat.root].children).toEqual([
      "__puck_content_root__",
      "second",
    ]);
    expect(flatSpecToPuckData(catalog, flat, puckData)).toEqual(puckData);
  });
});
