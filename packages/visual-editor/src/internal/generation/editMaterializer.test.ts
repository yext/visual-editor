// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { createPuckGenerationCatalog } from "../../vite-plugin/layout-generation/puckGenerationCatalog.ts";
import { buildEditInventory, clone, type SavedComponent } from "./authored.ts";
import type {
  SectionEditOperation,
  SectionEditTask,
  NewEditComponent,
  PlannedStructureEdit,
} from "./editProtocol.ts";
import {
  materializeSectionEdit,
  preserveSectionEditResolution,
  structuralEditResult,
} from "./editMaterializer.ts";
import { slottedFixture } from "./slottedGenerationTestUtils.ts";

const catalog = () =>
  createPuckGenerationCatalog({
    Header: { generation: { props: z.object({ text: z.string() }) } },
    Footer: { generation: { props: z.object({ text: z.string() }) } },
    Section: {
      generation: {
        props: z.object({ title: z.string(), cards: z.array(z.unknown()) }),
      },
      fields: { cards: { type: "slot", allow: ["Card", "Opaque", "Unknown"] } },
      defaultProps: { title: "Default section", cards: [] },
    },
    Card: {
      nestedOnly: true,
      generation: {
        props: z.object({
          text: z
            .object({ defaultValue: z.string(), fr: z.string().optional() })
            .catchall(z.string()),
          binding: z.object({
            field: z.string(),
            constantValueEnabled: z.boolean(),
          }),
          optional: z.string().nullable().optional(),
          links: z.array(z.object({ label: z.string(), url: z.string() })),
        }),
      },
      defaultProps: {
        text: { defaultValue: "Default card", fr: "Défaut" },
        binding: { field: "name", constantValueEnabled: false },
        links: [],
      },
    },
    Opaque: {},
  });
const card = (id: string): SavedComponent => ({
  type: "Card",
  props: {
    id,
    text: { defaultValue: id, fr: "Traduction", de: "Übersetzung" },
    binding: { field: "name", constantValueEnabled: false },
    optional: "Old",
    links: [{ label: "Old", url: "/old", hidden: "Do not inherit" }],
    parentData: { id: "parent", untouched: true },
    hidden: { deep: [1, 2] },
  },
  readOnly: { binding: true },
});
const section = (
  id: string,
  cards = [card(`${id}-a`), card(`${id}-b`)]
): SavedComponent => ({
  type: "Section",
  props: { id, title: id, cards, editorOwned: "Keep" },
});
const page = () => ({
  root: { props: { theme: "Keep", version: 12 } },
  zones: { empty: [] },
  content: [
    { type: "Header", props: { id: "header", text: "Header" } },
    {
      type: "MainContent",
      props: { id: "main", content: [section("first"), section("second")] },
    },
    { type: "Footer", props: { id: "footer", text: "Footer" } },
  ],
});
const task = (
  targets = ["first-a"],
  structuralOperations: PlannedStructureEdit[] = [],
  sectionId = "first"
): SectionEditTask => ({
  taskId: `task-${sectionId}`,
  sectionId,
  targetComponentIds: targets,
  instructions: "Edit the section",
  structuralOperations,
  dependsOn: [],
});
const update = (
  componentId = "first-a",
  path = "/text/defaultValue",
  value: unknown = "Updated"
): SectionEditOperation => ({
  kind: "update",
  componentId,
  changes: [{ kind: "set", path, value }],
});
const apply = (data = page(), editTask = task(), operations = [update()]) =>
  materializeSectionEdit(catalog(), data, editTask, {
    taskId: editTask.taskId,
    sectionId: editTask.sectionId,
    operations,
  });
const find = (
  data: ReturnType<typeof page>,
  componentId: string
): SavedComponent => {
  const visit = (items: SavedComponent[]): SavedComponent | undefined => {
    for (const item of items) {
      if (item.props.id === componentId) {
        return item;
      }
      const child = visit(item.props.content ?? item.props.cards ?? []);
      if (child) {
        return child;
      }
    }
  };
  return visit(data.content)!;
};

describe("deterministic section edits", () => {
  it("patches explicit fields while preserving identities, translations, bindings and editor data", () => {
    const baseline = page();
    const before = clone(baseline);
    const candidate = apply(baseline, task(), [
      update("first-a", "/text", { defaultValue: "Updated" }),
    ]);
    const expected = clone(before);
    find(expected, "first-a").props.text.defaultValue = "Updated";
    expect(candidate).toEqual(expected);
    expect(baseline).toEqual(before);
    expect(
      buildEditInventory(catalog(), candidate).components.map(
        (item) => item.componentId
      )
    ).toEqual(
      buildEditInventory(catalog(), baseline).components.map(
        (item) => item.componentId
      )
    );
  });

  it("distinguishes explicit null and unset from preservation and rejects invalid values", () => {
    const nulled = apply(page(), task(), [
      update("first-a", "/optional", null),
    ]);
    expect(find(nulled, "first-a").props.optional).toBeNull();
    const unset = apply(nulled, task(), [
      {
        kind: "update",
        componentId: "first-a",
        changes: [{ kind: "unset", path: "/optional" }],
      },
    ]);
    expect(Object.hasOwn(find(unset, "first-a").props, "optional")).toBe(false);
    expect(() =>
      apply(page(), task(), [update("first-a", "/optional", 3)])
    ).toThrow("Invalid authored edit");
    expect(() =>
      apply(page(), task(), [
        {
          kind: "update",
          componentId: "first-a",
          changes: [{ kind: "unset", path: "/text" }],
        },
      ])
    ).toThrow("Invalid authored edit");
  });

  it("replaces ordinary arrays without inheriting old items or hidden values", () => {
    const candidate = apply(page(), task(), [
      update("first-a", "/links", [{ label: "New", url: "/new" }]),
    ]);
    expect(find(candidate, "first-a").props.links).toEqual([
      { label: "New", url: "/new" },
    ]);
    expect(() =>
      apply(page(), task(), [update("first-a", "/links/0/label", "No")])
    ).toThrow("Invalid authored edit");
  });

  it.each([
    "/id",
    "/hidden",
    "/parentData",
    "/binding/field",
    "/__proto__/polluted",
    "/text/constructor",
    "/text/~2invalid",
  ])("rejects protected or invalid authored path %s", (path) => {
    expect(() =>
      apply(page(), task(), [update("first-a", path, "Forbidden")])
    ).toThrow();
  });

  it("rejects overlapping paths, unknown object keys and slot replacement", () => {
    expect(() =>
      apply(page(), task(), [
        {
          kind: "update",
          componentId: "first-a",
          changes: [
            { kind: "set", path: "/text", value: { defaultValue: "A" } },
            { kind: "set", path: "/text/fr", value: "B" },
          ],
        },
      ])
    ).toThrow("overlap");
    expect(() =>
      apply(page(), task(), [
        update("first-a", "/links", [{ label: "A", url: "/a", hidden: "No" }]),
      ])
    ).toThrow();
    expect(() =>
      apply(page(), task(["first"]), [update("first", "/cards", [])])
    ).toThrow("Invalid authored edit");
  });

  it("removes and reorders cards using existing Ids and relative anchors", () => {
    const editTask = task(
      ["first-a"],
      [
        {
          kind: "reorder",
          componentId: "first-a",
          anchor: { position: "after", componentId: "first-b" },
        },
      ]
    );
    const reordered = materializeSectionEdit(
      catalog(),
      page(),
      editTask,
      structuralEditResult(editTask)
    );
    expect(
      find(reordered, "first").props.cards.map(
        (item: SavedComponent) => item.props.id
      )
    ).toEqual(["first-b", "first-a"]);
    const removeTask = task(
      ["first-b"],
      [{ kind: "remove", componentId: "first-b" }]
    );
    const removed = materializeSectionEdit(
      catalog(),
      reordered,
      removeTask,
      structuralEditResult(removeTask)
    );
    expect(
      find(removed, "first").props.cards.map(
        (item: SavedComponent) => item.props.id
      )
    ).toEqual(["first-a"]);
    expect(find(removed, "second")).toEqual(find(page(), "second"));
  });

  it("reorders and removes sections without changing MainContent or root headers", () => {
    const editTask = task(
      ["first"],
      [
        {
          kind: "reorder",
          componentId: "first",
          anchor: { position: "after", componentId: "second" },
        },
      ]
    );
    const reordered = materializeSectionEdit(
      catalog(),
      page(),
      editTask,
      structuralEditResult(editTask)
    );
    expect(
      find(reordered, "main").props.content.map(
        (item: SavedComponent) => item.props.id
      )
    ).toEqual(["second", "first"]);
    const removeTask = task(
      ["first"],
      [{ kind: "remove", componentId: "first" }]
    );
    const removed = materializeSectionEdit(
      catalog(),
      reordered,
      removeTask,
      structuralEditResult(removeTask)
    );
    expect(
      find(removed, "main").props.content.map(
        (item: SavedComponent) => item.props.id
      )
    ).toEqual(["second"]);
    expect(removed.root).toEqual(page().root);
    expect(find(removed, "header")).toEqual(find(page(), "header"));
  });

  it("inserts cards with fresh application-owned Ids and no copied existing values", () => {
    const plan: PlannedStructureEdit = {
      kind: "insert",
      insertionKey: "new-card",
      componentType: "Card",
      collection: { ownerId: "first", slotPath: "/cards" },
      anchor: { position: "before", componentId: "first-b" },
    };
    const editTask = task([], [plan]);
    const component: NewEditComponent = {
      type: "Card",
      authoredValues: { text: { defaultValue: "New card" } },
      slots: [],
    };
    const { componentType: _componentType, ...operation } = plan;
    const candidate = apply(page(), editTask, [{ ...operation, component }]);
    const cards = find(candidate, "first").props.cards;
    expect(
      cards.map((item: SavedComponent) => item.props.text.defaultValue)
    ).toEqual(["first-a", "New card", "first-b"]);
    expect(cards[1].props.id).toMatch(/^generated-/);
    expect(cards[1].props.text.fr).toBe("Défaut");
    expect(cards[1].props).not.toHaveProperty("parentData");
    expect(() => structuralEditResult(editTask)).toThrow("Insertion requires");
    expect(() =>
      apply(page(), editTask, [
        {
          ...operation,
          component: { ...component, authoredValues: { id: "model-id" } },
        },
      ])
    ).toThrow();
  });

  it("inserts a section and descendants using the application-reserved section Id", () => {
    const plan: PlannedStructureEdit = {
      kind: "insert",
      insertionKey: "new-section",
      componentType: "Section",
      collection: { ownerId: "main", slotPath: "/content" },
      anchor: { position: "before", componentId: "second" },
    };
    const editTask = task([], [plan], "reserved-section");
    const { componentType: _componentType, ...operation } = plan;
    const candidate = apply(page(), editTask, [
      {
        ...operation,
        component: {
          type: "Section",
          authoredValues: { title: "New section" },
          slots: [
            {
              slotPath: "/cards",
              components: [{ type: "Card", authoredValues: {}, slots: [] }],
            },
          ],
        },
      },
    ]);
    const inserted = find(candidate, "reserved-section");
    expect(inserted.props.title).toBe("New section");
    expect(inserted.props.cards[0].props.id).toMatch(/^generated-/);
    expect(
      find(candidate, "main").props.content.map(
        (item: SavedComponent) => item.props.id
      )
    ).toEqual(["first", "reserved-section", "second"]);
  });

  it("constructs required object and union slots before validating a new section", () => {
    const customCatalog = createPuckGenerationCatalog({
      NestedSection: {
        generation: {
          props: z.object({
            layout: z.union([
              z.object({
                kind: z.literal("text"),
                title: z.string(),
                children: z.array(z.unknown()),
              }),
              z.object({
                kind: z.literal("other"),
                copy: z.string(),
                children: z.array(z.unknown()),
              }),
            ]),
          }),
        },
        fields: {
          layout: {
            type: "object",
            objectFields: { children: { type: "slot", allow: ["Leaf"] } },
          },
        },
      },
      Leaf: {
        nestedOnly: true,
        generation: { props: z.object({ text: z.string() }) },
      },
    });
    const editTask = task(
      [],
      [
        {
          kind: "insert",
          insertionKey: "nested",
          componentType: "NestedSection",
          collection: { ownerId: "main", slotPath: "/content" },
          anchor: { position: "end" },
        },
      ],
      "new-nested-section"
    );
    const result = (authoredValues: Record<string, unknown>) => ({
      taskId: editTask.taskId,
      sectionId: editTask.sectionId,
      operations: [
        {
          kind: "insert" as const,
          insertionKey: "nested",
          collection: { ownerId: "main", slotPath: "/content" },
          anchor: { position: "end" as const },
          component: {
            type: "NestedSection",
            authoredValues,
            slots: [
              {
                slotPath: "/layout/children",
                components: [
                  {
                    type: "Leaf",
                    authoredValues: { text: "Child" },
                    slots: [],
                  },
                ],
              },
            ],
          },
        },
      ],
    });
    const baseline = page();
    baseline.content = [baseline.content[1]];
    find(baseline, "main").props.content = [];
    const candidate = materializeSectionEdit(
      customCatalog,
      baseline,
      editTask,
      result({ layout: { kind: "text", title: "Nested" } })
    );
    expect(
      find(candidate, "new-nested-section").props.layout.children[0].props.text
    ).toBe("Child");
    expect(() =>
      materializeSectionEdit(
        customCatalog,
        baseline,
        editTask,
        result({ layout: { kind: "text" } })
      )
    ).toThrow();
  });

  it.each(["Header", "Opaque", "Unknown"])(
    "rejects insertion of %s into a card-only slot",
    (componentType) => {
      const editTask = task(
        [],
        [
          {
            kind: "insert",
            insertionKey: "forbidden",
            componentType,
            collection: { ownerId: "first", slotPath: "/cards" },
            anchor: { position: "end" },
          },
        ]
      );
      expect(() =>
        apply(page(), editTask, [
          {
            kind: "insert",
            insertionKey: "forbidden",
            collection: { ownerId: "first", slotPath: "/cards" },
            anchor: { position: "end" },
            component: { type: componentType, authoredValues: {}, slots: [] },
          },
        ])
      ).toThrow("not permitted");
    }
  );

  it("rejects cross-section targets, anchors and unplanned structural changes", () => {
    expect(() =>
      apply(page(), task(["second-a"]), [update("second-a")])
    ).toThrow("outside its section");
    expect(() => apply(page(), task(), [update("first-b")])).toThrow(
      "outside task scope"
    );
    const editTask = task(
      ["first-a"],
      [
        {
          kind: "reorder",
          componentId: "first-a",
          anchor: { position: "after", componentId: "second-a" },
        },
      ]
    );
    expect(() =>
      materializeSectionEdit(
        catalog(),
        page(),
        editTask,
        structuralEditResult(editTask)
      )
    ).toThrow("permitted collection");
    expect(() =>
      apply(page(), task(), [{ kind: "remove", componentId: "first-a" }])
    ).toThrow("planned structural");
    expect(() =>
      apply(page(), task(), [
        {
          ...update(),
          collection: { ownerId: "second", slotPath: "/cards" },
        } as SectionEditOperation,
      ])
    ).toThrow();
  });

  it("preserves registered opaque trees and rejects indirect deletion or reorder", () => {
    const data = page();
    find(data, "first").props.cards.push({
      type: "Opaque",
      props: { id: "opaque", secret: { nested: [card("hidden")] } },
    });
    const candidate = apply(data);
    expect(find(candidate, "opaque")).toEqual(find(data, "opaque"));
    expect(() => apply(data, task(["opaque"]), [update("opaque")])).toThrow(
      "protected"
    );
    const removeTask = task(
      ["first"],
      [{ kind: "remove", componentId: "first" }]
    );
    expect(() =>
      materializeSectionEdit(
        catalog(),
        data,
        removeTask,
        structuralEditResult(removeTask)
      )
    ).toThrow("protected content");
    const reorderTask = task(
      ["first"],
      [{ kind: "reorder", componentId: "first", anchor: { position: "end" } }]
    );
    expect(() =>
      materializeSectionEdit(
        catalog(),
        data,
        reorderTask,
        structuralEditResult(reorderTask)
      )
    ).toThrow("protected content");
  });

  it("rejects existing components whose type is absent from the catalog", () => {
    const data = page();
    find(data, "first").props.cards.push({
      type: "Unknown",
      props: { id: "unknown" },
    });
    const before = clone(data);
    expect(() => apply(data)).toThrow("unknown component Unknown");
    expect(data).toEqual(before);
  });

  it("checks editor permissions and read-only collections", () => {
    const editTask = task();
    expect(() =>
      materializeSectionEdit(
        catalog(),
        page(),
        editTask,
        {
          taskId: editTask.taskId,
          sectionId: editTask.sectionId,
          operations: [update()],
        },
        { can: () => false }
      )
    ).toThrow("permission denied");
    const data = page();
    find(data, "first").readOnly = { cards: true };
    const removeTask = task(
      ["first-a"],
      [{ kind: "remove", componentId: "first-a" }]
    );
    expect(() =>
      materializeSectionEdit(
        catalog(),
        data,
        removeTask,
        structuralEditResult(removeTask)
      )
    ).toThrow("read-only slot");
    expect(() =>
      apply(page(), task(["main"], [], "main"), [update("main")])
    ).toThrow("editable section");
  });

  it("rejects populated zones and mismatched task identities", () => {
    const data = page();
    Object.assign(data.zones, { legacy: [card("legacy")] });
    expect(() => apply(data)).toThrow("legacy zones");
    expect(() =>
      materializeSectionEdit(catalog(), page(), task(), {
        taskId: "wrong",
        sectionId: "first",
        operations: [update()],
      })
    ).toThrow("match its task");
  });

  it("verifies resolution and restores unexposed props, metadata, opaque trees and root settings", () => {
    const baseline = page();
    find(baseline, "first").props.cards.push({
      type: "Opaque",
      props: { id: "opaque", arbitrary: "Keep" },
    });
    const candidate = apply(baseline);
    const resolved = clone(candidate);
    find(resolved, "first-a").props.hidden = { deep: [99] };
    find(resolved, "first-a").props.parentData = { changed: true };
    find(resolved, "opaque").props.arbitrary = "Changed";
    resolved.root.props.theme = "Changed";
    const restored = preserveSectionEditResolution(
      catalog(),
      resolved,
      candidate
    );
    expect(restored).toEqual(candidate);
    find(resolved, "first-a").props.text.defaultValue = "Resolver changed copy";
    expect(() =>
      preserveSectionEditResolution(catalog(), resolved, candidate)
    ).toThrow("Resolution changed authored state");
  });
});

describe("card source edit consistency", () => {
  it("updates and reorders manual cards while preserving child Ids and mirroring storage", async () => {
    const fixture = slottedFixture();
    const baseline = fixture.materialize([
      fixture.section([fixture.card("First"), fixture.card("Second")]),
    ]);
    const section = baseline.content[0];
    const [first, second] = section.props.slots.CardSlot;
    const editTask = task(
      [first.props.id],
      [
        {
          kind: "reorder",
          componentId: first.props.id,
          anchor: { position: "after", componentId: second.props.id },
        },
      ],
      section.props.id
    );
    const operations: SectionEditOperation[] = [
      update(first.props.id, "/data/question/defaultValue", "Updated"),
      ...structuralEditResult(editTask).operations,
    ];
    const candidate = materializeSectionEdit(
      fixture.catalog,
      baseline,
      editTask,
      { taskId: editTask.taskId, sectionId: editTask.sectionId, operations }
    );
    const cards = candidate.content[0].props.slots.CardSlot;
    expect(cards.map((card: SavedComponent) => card.props.id)).toEqual([
      second.props.id,
      first.props.id,
    ]);
    expect(cards[1].props.slots.BodySlot[0].props.id).toBe(
      first.props.slots.BodySlot[0].props.id
    );
    expect(cards[1].props.data.question.fr).toBe("Traduction");
    expect(candidate.content[0].props.manualSlots.CardSlot).toEqual(cards);
    expect(candidate.content[0].props.data.constantValue).toEqual(
      cards.map((card: SavedComponent) => ({ id: card.props.id }))
    );
    const resolved = await fixture.resolve(candidate);
    expect(() =>
      preserveSectionEditResolution(fixture.catalog, resolved, candidate)
    ).not.toThrow();
  });

  it("inserts new cards with fresh children using the helper's Id convention", async () => {
    const fixture = slottedFixture();
    const baseline = fixture.materialize([
      fixture.section([fixture.card("Existing")]),
    ]);
    const section = baseline.content[0];
    const plan: PlannedStructureEdit = {
      kind: "insert",
      insertionKey: "card",
      componentType: "FAQCard",
      collection: { ownerId: section.props.id, slotPath: "/slots/CardSlot" },
      anchor: { position: "end" },
    };
    const editTask = task([], [plan], section.props.id);
    const { componentType: _componentType, ...operation } = plan;
    const candidate = materializeSectionEdit(
      fixture.catalog,
      baseline,
      editTask,
      {
        taskId: editTask.taskId,
        sectionId: editTask.sectionId,
        operations: [
          {
            ...operation,
            component: {
              type: "FAQCard",
              authoredValues: {
                data: { question: { defaultValue: "New question" } },
              },
              slots: [],
            },
          },
        ],
      }
    );
    const cards = candidate.content[0].props.slots.CardSlot;
    expect(cards[0]).toEqual(section.props.slots.CardSlot[0]);
    expect(cards[1].props.slots.BodySlot[0].props.id).toBe(
      `${cards[1].props.id}-BodySlot-0`
    );
    const resolved = await fixture.resolve(candidate);
    expect(() =>
      preserveSectionEditResolution(fixture.catalog, resolved, candidate)
    ).not.toThrow();
  });

  it("appends a new child to an existing card without renaming its existing child", async () => {
    const fixture = slottedFixture();
    const baseline = fixture.materialize([
      fixture.section([fixture.card("Existing")]),
    ]);
    const section = baseline.content[0];
    const card = section.props.slots.CardSlot[0];
    const plan: PlannedStructureEdit = {
      kind: "insert",
      insertionKey: "body",
      componentType: "Text",
      collection: { ownerId: card.props.id, slotPath: "/slots/BodySlot" },
      anchor: { position: "end" },
    };
    const editTask = task([], [plan], section.props.id);
    const { componentType: _componentType, ...operation } = plan;
    const candidate = materializeSectionEdit(
      fixture.catalog,
      baseline,
      editTask,
      {
        taskId: editTask.taskId,
        sectionId: editTask.sectionId,
        operations: [
          {
            ...operation,
            component: {
              type: "Text",
              authoredValues: { text: "Appended" },
              slots: [],
            },
          },
        ],
      }
    );
    const children =
      candidate.content[0].props.slots.CardSlot[0].props.slots.BodySlot;
    expect(children[0]).toEqual(card.props.slots.BodySlot[0]);
    expect(children[1].props.id).toBe(`${card.props.id}-BodySlot-1`);
    const resolved = await fixture.resolve(candidate);
    expect(() =>
      preserveSectionEditResolution(fixture.catalog, resolved, candidate)
    ).not.toThrow();
  });

  it("preserves extra mirror metadata and keeps manual storage consistent after removal", async () => {
    const fixture = slottedFixture();
    const baseline = fixture.materialize([
      fixture.section([fixture.card("First"), fixture.card("Second")]),
    ]);
    const section = baseline.content[0];
    section.props.manualSlots.editorOwned = { keep: true };
    const removedId = section.props.slots.CardSlot[0].props.id;
    const editTask = task(
      [removedId],
      [{ kind: "remove", componentId: removedId }],
      section.props.id
    );
    const candidate = materializeSectionEdit(
      fixture.catalog,
      baseline,
      editTask,
      structuralEditResult(editTask)
    );
    expect(candidate.content[0].props.manualSlots.editorOwned).toEqual({
      keep: true,
    });
    expect(candidate.content[0].props.manualSlots.CardSlot).toEqual(
      candidate.content[0].props.slots.CardSlot
    );
    const resolved = await fixture.resolve(candidate);
    const restored = preserveSectionEditResolution(
      fixture.catalog,
      resolved,
      candidate
    );
    expect(restored.content[0].props.manualSlots.editorOwned).toEqual({
      keep: true,
    });
  });

  it("rejects resolution that renames an existing descendant", async () => {
    const fixture = slottedFixture();
    const baseline = fixture.materialize([
      fixture.section([fixture.card("Existing")]),
    ]);
    const section = baseline.content[0];
    const card = section.props.slots.CardSlot[0];
    const editTask = task([card.props.id], [], section.props.id);
    const candidate = materializeSectionEdit(
      fixture.catalog,
      baseline,
      editTask,
      {
        taskId: editTask.taskId,
        sectionId: editTask.sectionId,
        operations: [update(card.props.id, "/data/answer", "Changed answer")],
      }
    );
    const resolved = await fixture.resolve(candidate);
    resolved.content[0].props.slots.CardSlot[0].props.slots.BodySlot[0].props.id =
      "resolver-renamed";
    resolved.content[0].props.manualSlots.CardSlot[0].props.slots.BodySlot[0].props.id =
      "resolver-renamed";
    expect(() =>
      preserveSectionEditResolution(fixture.catalog, resolved, candidate)
    ).toThrow("Resolution changed authored state");
  });

  it("preserves linked backups and applies derived visible cards after a source change", async () => {
    const fixture = slottedFixture();
    const baseline = fixture.materialize([
      fixture.section([fixture.card("Manual backup")]),
    ]);
    const section = baseline.content[0];
    const editTask = task([section.props.id], [], section.props.id);
    const candidate = materializeSectionEdit(
      fixture.catalog,
      baseline,
      editTask,
      {
        taskId: editTask.taskId,
        sectionId: editTask.sectionId,
        operations: [
          update(section.props.id, "/data", {
            field: "c_items",
            constantValueEnabled: false,
          }),
        ],
      }
    );
    expect(candidate.content[0].props.manualSlots.CardSlot).toEqual(
      section.props.manualSlots.CardSlot
    );
    const resolved = await fixture.resolve(candidate, {
      locale: "en",
      c_items: [{ name: "Entity question" }],
    });
    const restored = preserveSectionEditResolution(
      fixture.catalog,
      resolved,
      candidate
    );
    expect(restored.content[0].props.slots.CardSlot).toEqual(
      resolved.content[0].props.slots.CardSlot
    );
    expect(restored.content[0].props.manualSlots.CardSlot).toEqual(
      section.props.manualSlots.CardSlot
    );
  });
});
