// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { editPlanningPrompt } from "../../prompts.ts";
import { clone } from "../../shared/authoredValues.ts";
import {
  editGenerationFixture,
  editPlan,
  planningResponse,
  editTask,
} from "../../testing/editFixtures.ts";
import { slottedFixture } from "../../testing/slottedFixtures.ts";
import { createRequestLocalIds } from "../../shared/requestLocalIds.ts";
import { buildEditInventory } from "./buildEditInventory.ts";
import { compileEditPlanningSchema } from "./sectionEditPlanningSchema.ts";
import type { SectionEditTask } from "./types.ts";

const requestIds = (fixture: ReturnType<typeof editGenerationFixture>) =>
  createRequestLocalIds(
    buildEditInventory(fixture.catalog, fixture.data).components.map(
      (item) => item.componentId
    )
  );
describe("follow-up planning", () => {
  it("round-trips local targets, collection owners and anchors without changing prose", () => {
    const fixture = editGenerationFixture();
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data
    );
    const output = editPlan([
      editTask(
        "first",
        ["first-a"],
        [
          {
            kind: "reorder",
            componentId: "first-a",
            anchor: { position: "after", componentId: "first-b" },
          },
        ]
      ),
    ]);
    output.tasks[0].instructions = "Keep c2 and first-a as literal copy.";
    const wire = planningResponse(output, fixture.catalog, fixture.data);
    expect(z.fromJSONSchema(compiled.jsonSchema).safeParse(wire).success).toBe(
      true
    );
    expect(compiled.parseResponse(JSON.stringify(wire))).toEqual(output);
    expect(JSON.stringify(compiled.jsonSchema)).not.toContain('"first-a"');
    const insert = {
      ...editPlan([]),
      tasks: [
        {
          ...editTask(
            "unused",
            [],
            [
              {
                kind: "insert",
                insertionKey: "new",
                componentType: "Section",
                collection: { ownerId: "main", slotPath: "/content" },
                anchor: { position: "before", componentId: "second" },
              },
            ]
          ),
          sectionId: null,
        },
      ],
    };
    const result = compiled.parseResponse(
      JSON.stringify(planningResponse(insert, fixture.catalog, fixture.data))
    );
    expect(result.tasks[0].structuralOperations).toEqual(
      insert.tasks[0].structuralOperations
    );
    const invalid = editPlan([editTask("first", ["c99999"])]);
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(planningResponse(invalid, fixture.catalog, fixture.data))
      )
    ).toThrow();
  });

  it("deduplicates structural metadata while retaining every authored value and insertion restriction", () => {
    const fixture = editGenerationFixture();
    const original = buildEditInventory(fixture.catalog, fixture.data);
    const before = clone(fixture.data);
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data
    );
    const wire = compiled.context.inventory;
    const ids = requestIds(fixture);
    wire.components.forEach((item, index) => {
      expect(item.authoredValues).toEqual(
        original.components[index].authoredValues
      );
      expect(ids.decode(item.componentId)).toBe(
        original.components[index].componentId
      );
      expect(item.parentId === null ? null : ids.decode(item.parentId)).toBe(
        original.components[index].parentId
      );
      expect(item).not.toHaveProperty("ancestorIds");
      expect(item).not.toHaveProperty("description");
      expect(item).not.toHaveProperty("collection");
    });
    wire.collections.forEach((collection, index) => {
      expect(wire.insertionTypes[collection.insertionTypeSet]).toEqual(
        original.collections[index].allowedInsertionTypes
      );
      expect(collection.componentIds.map(ids.decode)).toEqual(
        original.collections[index].componentIds
      );
    });
    expect(Object.keys(wire.insertionTypes).length).toBeLessThan(
      wire.collections.length
    );
    expect(fixture.data).toEqual(before);
  });

  it("pauses a translated text edit before application and retains the approved translation mode", () => {
    const fixture = editGenerationFixture();
    const before = clone(fixture.data);
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data
    );
    const question = {
      ...editPlan([]),
      intent: "clarification",
      text: "The heading has a French translation.",
      clarification:
        "Would you like the new heading translated into French, or should I leave the French text unchanged?",
    };
    expect(
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(question, fixture.catalog, fixture.data)
        )
      ).tasks
    ).toEqual([]);
    expect(fixture.data).toEqual(before);
    const approved = editPlan([
      { ...editTask(), translationMode: "translate" },
    ]);
    expect(
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(approved, fixture.catalog, fixture.data)
        )
      ).tasks[0].translationMode
    ).toBe("translate");
  });

  it("retains batch limitations separately from planner prose", () => {
    const fixture = editGenerationFixture();
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data
    );
    const output = {
      ...editPlan(),
      limitations: "The card grid cannot be changed.",
    };
    expect(
      z
        .fromJSONSchema(compiled.jsonSchema)
        .safeParse(planningResponse(output, fixture.catalog, fixture.data))
        .success
    ).toBe(true);
    expect(
      compiled.parseResponse(
        JSON.stringify(planningResponse(output, fixture.catalog, fixture.data))
      ).limitations
    ).toBe(output.limitations);
    const { limitations: _limitations, ...incomplete } = output;
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(incomplete, fixture.catalog, fixture.data)
        )
      )
    ).toThrow("limitations");
  });

  it("requires the same task fields in model output and response parsing", () => {
    const fixture = editGenerationFixture();
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data
    );
    const response = editPlan();
    const wire = z.fromJSONSchema(compiled.jsonSchema);
    expect(
      wire.safeParse(planningResponse(response, fixture.catalog, fixture.data))
        .success
    ).toBe(true);
    for (const field of [
      "translationMode",
      "description",
      "generateContent",
    ] as const) {
      const task: Record<string, unknown> = { ...response.tasks[0] };
      delete task[field];
      const incomplete = { ...response, tasks: [task] };
      expect(
        wire.safeParse(
          planningResponse(incomplete, fixture.catalog, fixture.data)
        ).success
      ).toBe(false);
      expect(() =>
        compiled.parseResponse(
          JSON.stringify(
            planningResponse(incomplete, fixture.catalog, fixture.data)
          )
        )
      ).toThrow(field);
    }
  });

  it("supplies distinct repeated targets, ancestry, selection and insertion capabilities", () => {
    const fixture = editGenerationFixture();
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data,
      "first-b"
    );
    expect(compiled.context.inventory).toMatchObject({
      selectedComponentId: requestIds(fixture).encode("first-b"),
      selectedSectionId: requestIds(fixture).encode("first"),
    });
    expect(
      compiled.context.inventory.components
        .filter((item) => item.type === "Card")
        .map((item) => [item.componentId, item.position, item.sectionId])
    ).toEqual([
      [
        requestIds(fixture).encode("first-a"),
        0,
        requestIds(fixture).encode("first"),
      ],
      [
        requestIds(fixture).encode("first-b"),
        1,
        requestIds(fixture).encode("first"),
      ],
      [
        requestIds(fixture).encode("second-a"),
        0,
        requestIds(fixture).encode("second"),
      ],
      [
        requestIds(fixture).encode("second-b"),
        1,
        requestIds(fixture).encode("second"),
      ],
    ]);
    expect(compiled.context.capabilities.Card.authoredPaths).toContainEqual({
      path: "/text/defaultValue",
      set: true,
      unset: false,
    });
    expect(
      compiled.context.localizedText[requestIds(fixture).encode("first-a")]
    ).toContainEqual({
      path: "/text",
      overrideLocales: ["fr"],
    });
    const context = JSON.stringify(compiled.context);
    expect(context).not.toContain("editorMetadata");
    expect(context).not.toContain("Private root setting");
    expect(context).not.toContain('"zones"');
    const prompt = editPlanningPrompt;
    expect(prompt).toContain("explicit user references override selection");
    expect(prompt).toContain("User ordinals are one-based");
    expect(prompt).toContain("materially plausible");
    expect(prompt).toContain(
      "Cross-section moves are unsupported, including removal followed by insertion"
    );
    // An explicit reference to the second section can override the first section's selection.
    const plan = compiled.parseResponse(
      JSON.stringify(
        planningResponse(
          editPlan([editTask("second", ["second-b"])]),
          fixture.catalog,
          fixture.data
        )
      )
    );
    expect(plan.tasks[0].targetComponentIds).toEqual(["second-b"]);
    expect(
      fixture.data.content[1].props.content[0].props.cards[0].props.text
        .defaultValue
    ).toBe("First card");
  });

  it.each(["clarification", "conversation", "globalStyle"] as const)(
    "returns %s without tasks or changes",
    (intent) => {
      const fixture = editGenerationFixture();
      const before = clone(fixture.data);
      const compiled = compileEditPlanningSchema(
        fixture.catalog,
        ["en", "fr"],
        fixture.data
      );
      const response = {
        ...editPlan([]),
        intent,
        clarification: intent === "clarification" ? "Which heading?" : null,
        globalStyleGuidance:
          intent === "globalStyle"
            ? "Use the global style editor to change the font."
            : null,
      };
      expect(
        compiled.parseResponse(
          JSON.stringify(
            planningResponse(response, fixture.catalog, fixture.data)
          )
        )
      ).toEqual(response);
      expect(fixture.data).toEqual(before);
      expect(() =>
        compiled.parseResponse(
          JSON.stringify(
            planningResponse(
              { ...response, tasks: [editTask()] },
              fixture.catalog,
              fixture.data
            )
          )
        )
      ).toThrow("Only content and mixed");
    }
  );

  it("retains content work in mixed requests and requires style guidance", () => {
    const fixture = editGenerationFixture();
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data
    );
    const response = {
      ...editPlan(),
      intent: "mixed",
      globalStyleGuidance: "Use the global style editor for the color palette.",
    };
    expect(
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(response, fixture.catalog, fixture.data)
        )
      ).tasks
    ).toHaveLength(1);
    expect(
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(
            { ...response, globalStyleGuidance: null },
            fixture.catalog,
            fixture.data
          )
        )
      )
    ).toEqual({ ...response, intent: "content", globalStyleGuidance: null });
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(
            { ...response, globalStyleGuidance: " " },
            fixture.catalog,
            fixture.data
          )
        )
      )
    ).toThrow("Styling requests require");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(
            { ...response, clarification: "Question?" },
            fixture.catalog,
            fixture.data
          )
        )
      )
    ).toThrow("Clarification must match");
  });

  it.each([false, true])(
    "validates FAQ insertion permissions locally with the common wire shape (linked %s)",
    (linked) => {
      const fixture = slottedFixture();
      const data = linked
        ? fixture.materialize([fixture.section([], fixture.linked)])
        : fixture.materialize();
      const sectionId = data.content[0].props.id;
      const compiled = compileEditPlanningSchema(
        fixture.catalog,
        ["en", "fr"],
        data
      );
      const wire = z.fromJSONSchema(compiled.jsonSchema);
      const response = editPlan([
        editTask(
          sectionId,
          [sectionId],
          [
            {
              kind: "insert",
              insertionKey: "new-faq",
              componentType: "FAQCard",
              collection: { ownerId: sectionId, slotPath: "/slots/CardSlot" },
              anchor: { position: "end" },
            },
          ]
        ),
      ]);
      response.tasks[0].translationMode = "defaultOnly";
      const toWire = () => planningResponse(response, fixture.catalog, data);
      expect(wire.safeParse(toWire()).success).toBe(true);
      if (linked) {
        expect(() =>
          compiled.parseResponse(
            JSON.stringify(planningResponse(response, fixture.catalog, data))
          )
        ).toThrow("Insertion violates component or slot permissions");
      } else {
        expect(
          compiled.parseResponse(
            JSON.stringify(planningResponse(response, fixture.catalog, data))
          ).tasks
        ).toHaveLength(1);
      }
      response.tasks[0].structuralOperations[0] = {
        kind: "insert",
        insertionKey: "wrong-card-type",
        componentType: "Section",
        collection: { ownerId: sectionId, slotPath: "/slots/CardSlot" },
        anchor: { position: "end" },
      };
      expect(wire.safeParse(toWire()).success).toBe(true);
      expect(() => compiled.parseResponse(JSON.stringify(toWire()))).toThrow(
        "Insertion violates component or slot permissions"
      );
    }
  );

  it("retains a batch of local edits when mixed was used without theme guidance", () => {
    const fixture = editGenerationFixture();
    const before = clone(fixture.data);
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data
    );
    const response = {
      ...editPlan([editTask(), editTask("second", ["second-a"])]),
      intent: "mixed",
      text: "Update both sections. Linked FAQ items cannot be added here.",
    };
    const result = compiled.parseResponse(
      JSON.stringify(planningResponse(response, fixture.catalog, fixture.data))
    );
    expect(result).toEqual({ ...response, intent: "content" });
    expect(fixture.data).toEqual(before);
  });

  it.each(["missing", "main", "opaque"])(
    "rejects protected or nonexistent target %s",
    (targetId) => {
      const fixture = editGenerationFixture();
      fixture.data.content[1].props.content[0].props.cards.push({
        type: "Opaque",
        props: { id: "opaque", arbitrary: "Private opaque data" },
      });
      const compiled = compileEditPlanningSchema(
        fixture.catalog,
        ["en", "fr"],
        fixture.data
      );
      expect(() =>
        compiled.parseResponse(
          JSON.stringify(
            planningResponse(
              editPlan([editTask("first", [targetId])]),
              fixture.catalog,
              fixture.data
            )
          )
        )
      ).toThrow();
      expect(JSON.stringify(compiled.context)).not.toContain(
        "Private opaque data"
      );
    }
  );

  it("rejects cross-section targets, card reorders and unsupported move operations", () => {
    const fixture = editGenerationFixture();
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data
    );
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(
            editPlan([editTask("first", ["second-a"])]),
            fixture.catalog,
            fixture.data
          )
        )
      )
    ).toThrow("Invalid option");
    const move = editTask(
      "first",
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
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(editPlan([move]), fixture.catalog, fixture.data)
        )
      )
    ).toThrow("existing sibling");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(
            editPlan([
              {
                ...move,
                structuralOperations: [
                  { kind: "move", componentId: "first-a", sectionId: "second" },
                ],
              } as unknown as SectionEditTask,
            ]),
            fixture.catalog,
            fixture.data
          )
        )
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(
            { ...editPlan(), root: { theme: "Changed" } },
            fixture.catalog,
            fixture.data
          )
        )
      )
    ).toThrow();
  });

  it("reserves new section identities in application code and validates placement", () => {
    const fixture = editGenerationFixture();
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data
    );
    const insertion = {
      ...editTask(
        "placeholder",
        [],
        [
          {
            kind: "insert",
            insertionKey: "new-section",
            componentType: "Section",
            collection: { ownerId: "main", slotPath: "/content" },
            anchor: { position: "before", componentId: "second" },
          },
        ]
      ),
      sectionId: null,
    };
    const response = { ...editPlan([]), tasks: [insertion] };
    const plan = compiled.parseResponse(
      JSON.stringify(planningResponse(response, fixture.catalog, fixture.data))
    );
    expect(plan.tasks[0].sectionId).toMatch(/^generated-/);
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(
            {
              ...response,
              tasks: [{ ...insertion, sectionId: "model-id" }],
            },
            fixture.catalog,
            fixture.data
          )
        )
      )
    ).toThrow();
    const disallowed = {
      ...insertion,
      structuralOperations: [
        { ...insertion.structuralOperations[0], componentType: "Card" },
      ],
    };
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(
            { ...response, tasks: [disallowed] },
            fixture.catalog,
            fixture.data
          )
        )
      )
    ).toThrow("permissions");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(
            {
              ...response,
              tasks: [{ ...insertion, targetComponentIds: ["first-a"] }],
            },
            fixture.catalog,
            fixture.data
          )
        )
      )
    ).toThrow();
  });

  it("exposes current read-only fields and rejects content tasks without writable paths", () => {
    const fixture = editGenerationFixture();
    fixture.data.content[1].props.content[0].props.cards[0].readOnly = {
      text: true,
      binding: true,
      optional: true,
      rows: true,
      style: true,
    };
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data
    );
    expect(
      compiled.context.readOnlyFields[requestIds(fixture).encode("first-a")]
    ).toMatchObject({
      text: true,
    });
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(editPlan(), fixture.catalog, fixture.data)
        )
      )
    ).toThrow("no writable authored paths");
    expect(
      compiled.context.localizedText[requestIds(fixture).encode("first-a")]
    ).toBeUndefined();
    expect(
      compiled.context.localizedText[requestIds(fixture).encode("first-b")]
    ).toContainEqual({
      path: "/text",
      overrideLocales: ["fr"],
    });
    expect(
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(
            editPlan([editTask("first", ["first-b"])]),
            fixture.catalog,
            fixture.data
          )
        )
      ).tasks
    ).toHaveLength(1);
    // A later compilation must observe new permissions rather than a cached contract.
    fixture.data.content[1].props.content[0].props.cards[0].readOnly = {};
    expect(
      compileEditPlanningSchema(
        fixture.catalog,
        ["en", "fr"],
        fixture.data
      ).parseResponse(
        JSON.stringify(
          planningResponse(editPlan(), fixture.catalog, fixture.data)
        )
      ).tasks
    ).toHaveLength(1);
  });

  it("supports clarification on an empty canvas without inventing a selected target", () => {
    const fixture = editGenerationFixture();
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      { content: [] },
      "stale-selection"
    );
    expect(compiled.context.inventory.selectedComponentId).toBeNull();
    const output = {
      ...editPlan([]),
      intent: "clarification",
      clarification: "Which section should I add?",
    };
    expect(
      compiled.parseResponse(
        JSON.stringify(
          planningResponse(output, fixture.catalog, { content: [] })
        )
      ).tasks
    ).toEqual([]);
  });

  it("rejects unknown section slots and second existing-section tasks disguised as new sections", () => {
    const fixture = slottedFixture("ProductCard");
    const data = fixture.materialize();
    const sectionId = data.content[0].props.id;
    const task = editTask(
      sectionId,
      [],
      [
        {
          kind: "insert",
          insertionKey: "fashion-card",
          componentType: "ProductCard",
          collection: { ownerId: sectionId, slotPath: "/slots/CardSlot" },
          anchor: { position: "end" },
        },
      ]
    );
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      data
    );
    const response = planningResponse(editPlan([task]), fixture.catalog, data);
    const wire = z.fromJSONSchema(compiled.jsonSchema);
    const existing = Object.values(response.existingTasks).find(
      Boolean
    ) as Record<string, unknown>;
    const duplicateSlot = clone(response);
    duplicateSlot.existingTasks["another-product-task"] = existing;
    expect(wire.safeParse(duplicateSlot).success).toBe(false);
    expect(() =>
      compiled.parseResponse(JSON.stringify(duplicateSlot))
    ).toThrow();
    const disguised = clone(response);
    disguised.newSections.push({ ...existing, taskId: "extra-product-task" });
    expect(wire.safeParse(disguised).success).toBe(true);
    expect(() => compiled.parseResponse(JSON.stringify(disguised))).toThrow(
      "Insertion is outside the owning section"
    );
  });

  it("limits provider content targets to the owning section", () => {
    const fixture = editGenerationFixture();
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en"],
      fixture.data
    );
    const output = planningResponse(
      editPlan([editTask("first", ["second-a"])]),
      fixture.catalog,
      fixture.data
    );
    expect(
      z.fromJSONSchema(compiled.jsonSchema).safeParse(output).success
    ).toBe(false);
    expect(() => compiled.parseResponse(JSON.stringify(output))).toThrow();
  });

  it("requires explicit reasons and kinds for dependencies and preserves success gating", () => {
    const fixture = editGenerationFixture();
    const first = editTask();
    const second = {
      ...editTask("second", [], [{ kind: "remove", componentId: "second" }]),
      dependsOn: [first.taskId],
      generateContent: false,
    };
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en"],
      fixture.data
    );
    const output = planningResponse(
      editPlan([first, second]),
      fixture.catalog,
      fixture.data
    );
    const wire = z.fromJSONSchema(compiled.jsonSchema);
    expect(wire.safeParse(output).success).toBe(true);
    expect(
      compiled.parseResponse(JSON.stringify(output)).tasks[1].dependsOn
    ).toEqual([first.taskId]);
    const dependent = Object.values(output.existingTasks).find(
      (value: any) => value?.dependsOn.length
    ) as any;
    dependent.dependsOn[0].reason = " ";
    expect(() => compiled.parseResponse(JSON.stringify(output))).toThrow();
    dependent.dependsOn = [first.taskId];
    expect(wire.safeParse(output).success).toBe(false);
  });
});
