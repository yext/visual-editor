// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { clone, type Content } from "../../internal/generation/authored.ts";
import {
  materializeSectionEdit,
  preserveSectionEditResolution,
} from "../../internal/generation/editMaterializer.ts";
import { slottedFixture } from "../../internal/generation/slottedGenerationTestUtils.ts";
import { createPuckGenerationCatalog } from "./puckGenerationCatalog.ts";
import {
  compileSectionEditSchema,
  buildSectionEditPrompt,
} from "./sectionEditSchema.ts";
import {
  editGenerationFixture,
  editTask,
  editResponse,
} from "./editGenerationTestUtils.ts";

const defaults = { $default: true };
const unset = { $unset: true };
const insertedCard = () => ({
  type: "Card",
  props: {
    text: defaults,
    binding: defaults,
    optional: unset,
    rows: [{ label: "New row", note: unset }],
    style: defaults,
  },
});

describe("narrow section edit schemas", () => {
  it("accepts a coordinated banner color change through schema decoding and materialization", () => {
    const color = z.union([
      z.object({
        selectedColor: z.literal("white"),
        contrastingColor: z.literal("black"),
      }),
      z.object({
        selectedColor: z.literal("palette-primary-dark"),
        contrastingColor: z.literal("white"),
      }),
    ]);
    const catalog = createPuckGenerationCatalog({
      Banner: {
        generation: {
          props: z.object({
            text: z.string(),
            styles: z.object({ backgroundColor: color }),
          }),
        },
      },
    });
    const data = {
      root: { props: { theme: "Keep" } },
      zones: { legacy: [] },
      content: [
        {
          type: "Banner",
          props: {
            id: "banner",
            text: "Keep banner text",
            metadata: "Private",
            styles: {
              backgroundColor: {
                selectedColor: "white",
                contrastingColor: "black",
              },
            },
          },
        },
      ],
    };
    const before = clone(data);
    const task = editTask("banner", ["banner"]);
    const compiled = compileSectionEditSchema(catalog, ["en"], data, task);
    const result = compiled.parseResponse(
      JSON.stringify({
        taskId: task.taskId,
        sectionId: "banner",
        insertions: [],
        updates: [
          {
            kind: "update",
            componentId: "banner",
            changes: [
              {
                kind: "set",
                path: "/styles/backgroundColor/selectedColor",
                value: "palette-primary-dark",
              },
              {
                kind: "set",
                path: "/styles/backgroundColor/contrastingColor",
                value: "white",
              },
            ],
          },
        ],
      })
    );
    const applied = materializeSectionEdit(catalog, data, task, result);
    const expected = clone(before);
    expected.content[0].props.styles.backgroundColor = {
      selectedColor: "palette-primary-dark",
      contrastingColor: "white",
    };
    expect(applied).toEqual(expected);
    expect(data).toEqual(before);
  });

  it("limits output to concrete targets and preserves unrelated data", () => {
    const fixture = editGenerationFixture();
    const before = clone(fixture.data);
    const task = editTask();
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task,
      "Use consistent copy"
    );
    const schema = JSON.stringify(compiled.jsonSchema);
    expect(schema).toContain('"first-a"');
    expect(schema).not.toContain('"first-b"');
    expect(schema).not.toContain("unrelatedValue");
    expect(schema).not.toContain("editorMetadata");
    expect(compiled.context.sharedIntent).toBe("Use consistent copy");
    expect(
      compiled.context.section.some((item) => item.componentId === "first-b")
    ).toBe(true);
    expect(
      compiled.context.section.some((item) => item.componentId === "second-a")
    ).toBe(false);
    const result = compiled.parseResponse(JSON.stringify(editResponse(task)));
    const candidate = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      result
    );
    const expected = clone(before);
    expected.content[1].props.content[0].props.cards[0].props.text.defaultValue =
      "Updated";
    expect(candidate).toEqual(expected);
    expect(fixture.data).toEqual(before);
    expect(buildSectionEditPrompt()).toContain(
      "does not widen this task's scope"
    );
  });

  it.each(["/id", "/editorMetadata", "/missing", "/cards", "/binding/missing"])(
    "does not offer undeclared or structural update path %s",
    (path) => {
      const fixture = editGenerationFixture();
      const compiled = compileSectionEditSchema(
        fixture.catalog,
        ["en", "fr"],
        fixture.data,
        editTask()
      );
      expect(() =>
        compiled.parseResponse(JSON.stringify(editResponse(editTask(), path)))
      ).toThrow();
    }
  );

  it("distinguishes set, null, unset and preservation without permitting top-level markers", () => {
    const fixture = editGenerationFixture();
    const task = editTask();
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    const nulled = compiled.parseResponse(
      JSON.stringify(editResponse(task, "/optional", null))
    );
    expect(nulled.operations[0]).toMatchObject({
      changes: [{ kind: "set", path: "/optional", value: null }],
    });
    const response = {
      ...editResponse(task),
      updates: [
        {
          kind: "update",
          componentId: "first-a",
          changes: [
            { kind: "unset", path: "/optional" },
            { kind: "unset", path: "/text/fr" },
          ],
        },
      ],
    };
    const removed = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      compiled.parseResponse(JSON.stringify(response))
    );
    expect(
      removed.content[1].props.content[0].props.cards[0].props.optional
    ).toBeUndefined();
    expect(
      removed.content[1].props.content[0].props.cards[0].props.text.fr
    ).toBeUndefined();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(editResponse(task, "/optional", unset))
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(editResponse(task, "/optional", defaults))
      )
    ).toThrow();
  });

  it("replaces authored arrays without inheriting by index or component type", () => {
    const fixture = editGenerationFixture();
    const task = editTask();
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    const result = compiled.parseResponse(
      JSON.stringify(
        editResponse(task, "/rows", [{ label: "Replacement", note: unset }])
      )
    );
    const candidate = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      result
    );
    expect(
      candidate.content[1].props.content[0].props.cards[0].props.rows
    ).toEqual([{ label: "Replacement" }]);
  });

  it("excludes read-only values and rejects invalid output, duplicates and scope changes", () => {
    const fixture = editGenerationFixture();
    fixture.data.content[1].props.content[0].props.cards[0].readOnly = {
      binding: true,
    };
    const task = editTask();
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    expect(JSON.stringify(compiled.jsonSchema)).not.toContain("/binding/field");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(editResponse(task, "/binding/field", "address"))
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({ ...editResponse(task), updates: [] })
      )
    ).toThrow("no changes");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...editResponse(task),
          updates: [
            ...editResponse(task).updates,
            ...editResponse(task).updates,
          ],
        })
      )
    ).toThrow("only once");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({ ...editResponse(task), sectionId: "second" })
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...editResponse(task),
          updates: [
            { ...editResponse(task).updates[0], componentId: "first-b" },
          ],
        })
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(editResponse(task, "/style/color", "green"))
      )
    ).toThrow();
  });

  it("generates only planned insertions with library defaults and explicit unsets", () => {
    const fixture = editGenerationFixture();
    const task = editTask(
      "first",
      [],
      [
        {
          kind: "insert",
          insertionKey: "new-card",
          componentType: "Card",
          collection: { ownerId: "first", slotPath: "/cards" },
          anchor: { position: "after", componentId: "first-a" },
        },
      ]
    );
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    const response = {
      taskId: task.taskId,
      sectionId: task.sectionId,
      updates: [],
      insertions: [{ insertionKey: "new-card", component: insertedCard() }],
    };
    const result = compiled.parseResponse(JSON.stringify(response));
    expect(JSON.stringify(result)).not.toContain('"id"');
    const candidate = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      result
    );
    const cards = candidate.content[1].props.content[0].props.cards;
    expect(cards.map((card: any) => card.props.text.defaultValue)).toEqual([
      "First card",
      "Default",
      "Second card",
    ]);
    expect(cards[1].props.id).toMatch(/^generated-/);
    expect(cards[1].props.optional).toBeUndefined();
    expect(cards[1].props.rows).toEqual([{ label: "New row" }]);
    expect(cards[1].props.text.fr).toBe("Défaut");
    expect(cards[1].props).not.toHaveProperty("editorMetadata");
    expect(() =>
      compiled.parseResponse(JSON.stringify({ ...response, insertions: [] }))
    ).toThrow("omitted");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...response,
          insertions: [...response.insertions, ...response.insertions],
        })
      )
    ).toThrow("only once");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...response,
          insertions: [
            {
              ...response.insertions[0],
              component: { type: "Section", props: {} },
            },
          ],
        })
      )
    ).toThrow();
  });

  it("inserts cards whose default styles leave an optional union unset", () => {
    const fixture = editGenerationFixture();
    fixture.components.Card.generation!.props =
      fixture.components.Card.generation!.props.extend({
        style: z.object({
          color: z.enum(["red", "blue"]),
          border: z
            .union([
              z.object({ color: z.literal("black") }),
              z.object({ color: z.literal("white") }),
            ])
            .optional(),
        }),
      });
    fixture.components.Card.defaultProps!.style = {
      color: "blue",
      border: undefined,
    };
    const task = editTask(
      "first",
      [],
      [
        {
          kind: "insert",
          insertionKey: "new-card",
          componentType: "Card",
          collection: { ownerId: "first", slotPath: "/cards" },
          anchor: { position: "end" },
        },
      ]
    );
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    const result = compiled.parseResponse(
      JSON.stringify({
        taskId: task.taskId,
        sectionId: task.sectionId,
        updates: [],
        insertions: [{ insertionKey: "new-card", component: insertedCard() }],
      })
    );
    const inserted = result.operations.find(
      (operation) => operation.kind === "insert"
    )!;
    expect(inserted.component.unsetPaths).toContain("/style/border");
    const candidate = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      result
    );
    expect(
      candidate.content[1].props.content[0].props.cards[2].props.style
    ).toEqual({ color: "blue" });
    expect(candidate.content[1].props.content[0].props.cards[0]).toEqual(
      fixture.data.content[1].props.content[0].props.cards[0]
    );
  });

  it("decodes new section descendants into application-owned identities", () => {
    const fixture = editGenerationFixture();
    const task = editTask(
      "reserved-section",
      [],
      [
        {
          kind: "insert",
          insertionKey: "new-section",
          componentType: "Section",
          collection: { ownerId: "main", slotPath: "/content" },
          anchor: { position: "end" },
        },
      ]
    );
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    const response = {
      taskId: task.taskId,
      sectionId: task.sectionId,
      updates: [],
      insertions: [
        {
          insertionKey: "new-section",
          component: {
            type: "Section",
            props: { title: "New section", cards: [insertedCard()] },
          },
        },
      ],
    };
    const candidate = materializeSectionEdit(
      fixture.catalog,
      fixture.data,
      task,
      compiled.parseResponse(JSON.stringify(response))
    );
    const inserted = candidate.content[1].props.content.at(-1);
    expect(inserted.props.id).toBe("reserved-section");
    expect(inserted.props.cards[0].props.id).toMatch(/^generated-/);
    expect(inserted.props.cards[0].props.optional).toBeUndefined();
  });

  it("handles required arrays containing slots without using existing array members", () => {
    const catalog = createPuckGenerationCatalog({
      Group: {
        generation: {
          props: z.object({
            groups: z.array(
              z.object({ label: z.string(), children: z.array(z.unknown()) })
            ),
          }),
        },
        fields: {
          groups: {
            type: "array",
            arrayFields: {
              label: { type: "text" },
              children: { type: "slot", allow: ["Text"] },
            },
          },
        },
      },
      Text: {
        nestedOnly: true,
        generation: { props: z.object({ text: z.string() }) },
      },
    });
    const data: Content = {
      content: [{ type: "MainContent", props: { id: "main", content: [] } }],
    };
    const task = editTask(
      "new-group",
      [],
      [
        {
          kind: "insert",
          insertionKey: "group",
          componentType: "Group",
          collection: { ownerId: "main", slotPath: "/content" },
          anchor: { position: "end" },
        },
      ]
    );
    const compiled = compileSectionEditSchema(catalog, ["en"], data, task);
    const result = compiled.parseResponse(
      JSON.stringify({
        taskId: task.taskId,
        sectionId: task.sectionId,
        updates: [],
        insertions: [
          {
            insertionKey: "group",
            component: {
              type: "Group",
              props: {
                groups: [
                  {
                    label: "One",
                    children: [{ type: "Text", props: { text: "Nested" } }],
                  },
                ],
              },
            },
          },
        ],
      })
    );
    const candidate = materializeSectionEdit(catalog, data, task, result);
    expect(
      candidate.content[0].props.content[0].props.groups[0].children[0].props
        .text
    ).toBe("Nested");
  });

  it("uses slotted-source helpers for new cards and preserves existing card identities", async () => {
    const fixture = slottedFixture();
    const data = fixture.materialize([
      fixture.section([fixture.card("Existing")]),
    ]);
    const section = data.content[0];
    const task = editTask(
      section.props.id,
      [],
      [
        {
          kind: "insert",
          insertionKey: "card",
          componentType: "FAQCard",
          collection: {
            ownerId: section.props.id,
            slotPath: "/slots/CardSlot",
          },
          anchor: { position: "end" },
        },
      ]
    );
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      data,
      task
    );
    const result = compiled.parseResponse(
      JSON.stringify({
        taskId: task.taskId,
        sectionId: task.sectionId,
        updates: [],
        insertions: [
          {
            insertionKey: "card",
            component: {
              type: "FAQCard",
              props: { data: defaults, styles: defaults, slots: defaults },
            },
          },
        ],
      })
    );
    const candidate = materializeSectionEdit(
      fixture.catalog,
      data,
      task,
      result
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

  it.each([
    { source: "library defaults", count: 3 },
    { source: "explicit empty cards", count: 0 },
    { source: "explicit cards", count: 1 },
  ])(
    "preserves $source in nested new source wrappers",
    async ({ source, count }) => {
      const fixture = slottedFixture();
      const data = fixture.materialize([
        fixture.section([fixture.card("Existing")]),
      ]);
      fixture.components.Outer = {
        generation: { props: z.object({ children: z.array(z.unknown()) }) },
        fields: { children: { type: "slot", allow: ["Section"] } },
        defaultProps: {
          children: [
            {
              type: "Section",
              props: clone(fixture.components.Section.defaultProps),
            },
          ],
        },
        render: () => null,
      };
      const task = editTask(
        "new-outer",
        [],
        [
          {
            kind: "insert",
            insertionKey: "outer",
            componentType: "Outer",
            collection: { ownerId: null, slotPath: null },
            anchor: { position: "end" },
          },
        ]
      );
      const compiled = compileSectionEditSchema(
        fixture.catalog,
        ["en", "fr"],
        data,
        task
      );
      const result = compiled.parseResponse(
        JSON.stringify({
          taskId: task.taskId,
          sectionId: task.sectionId,
          updates: [],
          insertions: [
            {
              insertionKey: "outer",
              component: {
                type: "Outer",
                props: {
                  children:
                    source === "library defaults"
                      ? defaults
                      : [
                          fixture.section(
                            source === "explicit cards"
                              ? [fixture.card("Nested question")]
                              : []
                          ),
                        ],
                },
              },
            },
          ],
        })
      );
      const candidate = materializeSectionEdit(
        fixture.catalog,
        data,
        task,
        result
      );
      expect(
        candidate.content[1].props.children[0].props.slots.CardSlot
      ).toHaveLength(count);
      if (source === "explicit cards") {
        expect(
          candidate.content[1].props.children[0].props.slots.CardSlot[0].props
            .data.question.defaultValue
        ).toBe("Nested question");
      }
      const resolved = await fixture.resolve(candidate);
      expect(() =>
        preserveSectionEditResolution(fixture.catalog, resolved, candidate)
      ).not.toThrow();
    }
  );

  it("prepares pure removal and reorder results without a generation call", () => {
    const fixture = editGenerationFixture();
    const task = {
      ...editTask(
        "first",
        ["first-a"],
        [
          {
            kind: "reorder" as const,
            componentId: "first-a",
            anchor: { position: "after" as const, componentId: "first-b" },
          },
        ]
      ),
      generateContent: false,
    };
    const compiled = compileSectionEditSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      task
    );
    expect(compiled.localResult).toEqual({
      taskId: task.taskId,
      sectionId: task.sectionId,
      operations: task.structuralOperations,
    });
    expect(JSON.stringify(compiled.jsonSchema)).not.toContain(
      "/text/defaultValue"
    );
  });
});
