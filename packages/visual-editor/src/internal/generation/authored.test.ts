// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../vite-plugin/layout-generation/puckGenerationCatalog.ts";
import {
  buildEditInventory,
  clone,
  walkAuthored,
  type SavedComponent,
} from "./authored.ts";
import { slottedFixture } from "./slottedGenerationTestUtils.ts";

const heading = (id: string, text: string): SavedComponent => ({
  type: "Heading",
  props: { id, text, editorMetadata: "private" },
});
const section = (id: string, children: SavedComponent[]): SavedComponent => ({
  type: "Section",
  props: { id, title: id, children },
});
const catalog = () =>
  createPuckGenerationCatalog({
    Header: { generation: { props: z.object({ title: z.string() }) } },
    Footer: { generation: { props: z.object({ title: z.string() }) } },
    Section: {
      description: "A content section",
      generation: {
        props: z.object({ title: z.string(), children: z.array(z.unknown()) }),
      },
      fields: {
        children: {
          type: "slot",
          allow: ["Heading", "Opaque"],
          disallow: ["Footer"],
        },
      },
    },
    Heading: {
      generation: { props: z.object({ text: z.string() }) },
      nestedOnly: true,
    },
    Opaque: { fields: { children: { type: "slot" } } },
  });
const page = () => ({
  root: { props: { theme: "unchanged" } },
  content: [
    { type: "Header", props: { id: "header", title: "Header" } },
    {
      type: "MainContent",
      props: {
        id: "main",
        content: [
          section("first", [heading("first-heading", "First heading")]),
          section("second", [heading("second-heading", "Second heading")]),
        ],
      },
    },
    { type: "Footer", props: { id: "footer", title: "Footer" } },
  ],
});

describe("follow-up targeting inventory", () => {
  it("distinguishes repeated types by content, position, ancestry and selection", () => {
    const inventory = buildEditInventory(catalog(), page(), "second-heading");
    expect(inventory.selectedComponentId).toBe("second-heading");
    expect(inventory.selectedSectionId).toBe("second");
    expect(inventory.components.map((item) => item.componentId)).toEqual([
      "header",
      "main",
      "first",
      "first-heading",
      "second",
      "second-heading",
      "footer",
    ]);
    expect(inventory.components[5]).toMatchObject({
      authoredValues: { text: "Second heading" },
      displayOrder: 5,
      parentId: "second",
      ancestorIds: ["main", "second"],
      sectionId: "second",
      editable: true,
      collection: { ownerId: "second", slotPath: "/children" },
    });
    expect(inventory.components[2]).toMatchObject({
      position: 0,
      description: "A content section",
      sectionId: "first",
      authoredValues: { title: "first", children: [] },
    });
    expect(inventory.components[4].position).toBe(1);
    expect(inventory.components[0].sectionId).toBe("header");
    expect(inventory.components[6].sectionId).toBe("footer");
    expect(inventory.components[1]).toMatchObject({
      sectionId: null,
      protectedReason: "scaffolding",
      editable: false,
      canRemove: false,
      canReorder: false,
    });
    expect(JSON.stringify(inventory)).not.toContain("editorMetadata");
  });

  it("records empty slots and filters insertion types using root and slot restrictions", () => {
    const data = page();
    data.content[1].props.content = [section("empty", [])];
    const inventory = buildEditInventory(catalog(), data);
    expect(
      inventory.collections.find((item) => item.ownerId === "empty")
    ).toEqual({
      ownerId: "empty",
      slotPath: "/children",
      componentIds: [],
      allow: ["Heading", "Opaque"],
      disallow: ["Footer"],
      allowedInsertionTypes: ["Heading"],
    });
    expect(inventory.collections[0].allowedInsertionTypes).toEqual([
      "Header",
      "Footer",
      "Section",
    ]);
    const restricted = createPuckGenerationCatalog(
      {},
      { rootAllowedComponentIds: ["MainContent"] }
    );
    expect(
      buildEditInventory(restricted, { content: [] }).collections[0]
        .allowedInsertionTypes
    ).toEqual([]);
  });

  it("keeps opaque components as boundaries and protects ancestors from deletion or reorder", () => {
    const data = {
      content: [
        section("section", [
          {
            type: "Opaque",
            props: {
              id: "opaque",
              secret: "hidden",
              children: [heading("hidden", "Secret")],
            },
          },
        ]),
      ],
    };
    const before = clone(data);
    const inventory = buildEditInventory(catalog(), data, "hidden");
    expect(inventory.components.map((item) => item.componentId)).toEqual([
      "section",
      "opaque",
    ]);
    expect(inventory.components[0]).toMatchObject({
      editable: true,
      hasOpaqueDescendants: true,
      canRemove: false,
      canReorder: false,
    });
    expect(inventory.components[1]).toMatchObject({
      authoredValues: {},
      editable: false,
      protectedReason: "opaque",
    });
    expect(inventory.selectedComponentId).toBeNull();
    expect(inventory.selectedSectionId).toBeNull();
    expect(JSON.stringify(inventory)).not.toContain("Secret");
    expect(data).toEqual(before);
  });

  it("rejects populated zones just like fresh generation without changing the layout", () => {
    const data = {
      ...page(),
      zones: { legacy: [heading("zone-heading", "Zone secret")] },
    };
    const before = clone(data);
    expect(() => buildEditInventory(catalog(), data, "zone-heading")).toThrow(
      "Populated legacy zones"
    );
    expect(data).toEqual(before);
    expect(() => walkAuthored(catalog(), data, () => {})).toThrow(
      "Populated legacy zones"
    );
  });

  it.each(["", "first-heading"])(
    "rejects missing or duplicate identities (%s)",
    (id) => {
      const data = {
        content: [
          section("section", [heading("first-heading", "A"), heading(id, "B")]),
        ],
      };
      expect(() => buildEditInventory(catalog(), data)).toThrow(
        id ? "duplicate component Id" : "missing component Id"
      );
    }
  );

  it("does not expose linked visible cards or allow edits to inactive manual backups", async () => {
    const fixture = slottedFixture();
    const data = fixture.materialize([fixture.section([fixture.card()])]);
    data.content[0].props.data.field = "c_items";
    data.content[0].props.data.constantValueEnabled = false;
    const resolved = await fixture.resolve(data, {
      locale: "en",
      c_items: [{ name: "Derived question" }],
    });
    const before = clone(resolved);
    const inventory = buildEditInventory(fixture.catalog, resolved);
    expect(JSON.stringify(inventory)).not.toContain("Derived question");
    expect(
      inventory.collections.find((item) => item.slotPath === "/slots/CardSlot")
        ?.allowedInsertionTypes
    ).toEqual([]);
    expect(
      inventory.collections.find(
        (item) => item.slotPath === "/manualSlots/CardSlot"
      )?.allowedInsertionTypes
    ).toEqual([]);
    const backups = inventory.components.filter(
      (item) => item.componentId !== data.content[0].props.id
    );
    expect(backups).toHaveLength(2);
    expect(
      backups.every(
        (item) =>
          !item.editable &&
          !item.canRemove &&
          !item.canReorder &&
          item.protectedReason === "inactiveManual"
      )
    ).toBe(true);
    expect(
      backups.every((item) => Object.keys(item.authoredValues).length === 0)
    ).toBe(true);
    expect(resolved).toEqual(before);
  });
});
