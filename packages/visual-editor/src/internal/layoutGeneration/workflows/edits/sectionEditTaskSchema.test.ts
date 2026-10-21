// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { editPlanningPrompt } from "../../prompts.ts";
import { clone } from "../../shared/authoredValues.ts";
import {
  editGenerationFixture,
  editPlan,
  editTask,
} from "../../testing/editFixtures.ts";
import { slottedFixture } from "../../testing/slottedFixtures.ts";
import { compileEditPlanningSchema } from "./sectionEditPlanningSchema.ts";
import { validateSectionEditTask } from "./taskValidation.ts";
import type { SectionEditTask } from "./types.ts";

describe("follow-up planning", () => {
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
    expect(compiled.parseResponse(JSON.stringify(question)).tasks).toEqual([]);
    expect(fixture.data).toEqual(before);
    const approved = editPlan([
      { ...editTask(), translationMode: "translate" },
    ]);
    expect(
      compiled.parseResponse(JSON.stringify(approved)).tasks[0].translationMode
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
      z.fromJSONSchema(compiled.jsonSchema).safeParse(output).success
    ).toBe(true);
    expect(compiled.parseResponse(JSON.stringify(output)).limitations).toBe(
      output.limitations
    );
    const { limitations: _limitations, ...incomplete } = output;
    expect(() => compiled.parseResponse(JSON.stringify(incomplete))).toThrow(
      "limitations"
    );
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
    expect(wire.safeParse(response).success).toBe(true);
    for (const field of [
      "translationMode",
      "description",
      "generateContent",
    ] as const) {
      const task: Record<string, unknown> = { ...response.tasks[0] };
      delete task[field];
      const incomplete = { ...response, tasks: [task] };
      expect(wire.safeParse(incomplete).success).toBe(false);
      expect(() => compiled.parseResponse(JSON.stringify(incomplete))).toThrow(
        field
      );
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
      selectedComponentId: "first-b",
      selectedSectionId: "first",
    });
    expect(
      compiled.context.inventory.components
        .filter((item) => item.type === "Card")
        .map((item) => [item.componentId, item.position, item.sectionId])
    ).toEqual([
      ["first-a", 0, "first"],
      ["first-b", 1, "first"],
      ["second-a", 0, "second"],
      ["second-b", 1, "second"],
    ]);
    expect(compiled.context.capabilities.Card.authoredPaths).toContainEqual({
      path: "/text/defaultValue",
      set: true,
      unset: false,
    });
    expect(compiled.context.localizedText["first-a"]).toContainEqual({
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
      JSON.stringify(editPlan([editTask("second", ["second-b"])]))
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
      expect(compiled.parseResponse(JSON.stringify(response))).toEqual(
        response
      );
      expect(fixture.data).toEqual(before);
      expect(() =>
        compiled.parseResponse(
          JSON.stringify({ ...response, tasks: [editTask()] })
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
    expect(compiled.parseResponse(JSON.stringify(response)).tasks).toHaveLength(
      1
    );
    expect(
      compiled.parseResponse(
        JSON.stringify({ ...response, globalStyleGuidance: null })
      )
    ).toEqual({ ...response, intent: "content", globalStyleGuidance: null });
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({ ...response, globalStyleGuidance: " " })
      )
    ).toThrow("Styling requests require");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({ ...response, clarification: "Question?" })
      )
    ).toThrow("Clarification must match");
  });

  it.each([false, true])(
    "offers FAQ insertions in the model schema only for manual lists (linked %s)",
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
      expect(wire.safeParse(response).success).toBe(!linked);
      if (linked) {
        expect(() => compiled.parseResponse(JSON.stringify(response))).toThrow(
          "Insertion violates component or slot permissions"
        );
      } else {
        expect(
          compiled.parseResponse(JSON.stringify(response)).tasks
        ).toHaveLength(1);
      }
      response.tasks[0].structuralOperations[0] = {
        kind: "insert",
        insertionKey: "wrong-card-type",
        componentType: "Section",
        collection: { ownerId: sectionId, slotPath: "/slots/CardSlot" },
        anchor: { position: "end" },
      };
      expect(wire.safeParse(response).success).toBe(false);
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
    const result = compiled.parseResponse(JSON.stringify(response));
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
          JSON.stringify(editPlan([editTask("first", [targetId])]))
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
        JSON.stringify(editPlan([editTask("first", ["second-a"])]))
      )
    ).toThrow("outside its section");
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
      compiled.parseResponse(JSON.stringify(editPlan([move])))
    ).toThrow("existing sibling");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          editPlan([
            {
              ...move,
              structuralOperations: [
                { kind: "move", componentId: "first-a", sectionId: "second" },
              ],
            } as unknown as SectionEditTask,
          ])
        )
      )
    ).toThrow();
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({ ...editPlan(), root: { theme: "Changed" } })
      )
    ).toThrow();
  });

  it("validates dependencies, task uniqueness and section grouping", () => {
    const fixture = editGenerationFixture();
    const compiled = compileEditPlanningSchema(
      fixture.catalog,
      ["en", "fr"],
      fixture.data
    );
    const first = editTask();
    const second = {
      ...editTask("second", ["second-a"]),
      dependsOn: [first.taskId],
    };
    expect(
      compiled.parseResponse(JSON.stringify(editPlan([first, second]))).tasks
    ).toHaveLength(2);
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          editPlan([{ ...first, dependsOn: [second.taskId] }, second])
        )
      )
    ).toThrow("acyclic");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(editPlan([{ ...first, dependsOn: ["missing"] }]))
      )
    ).toThrow("does not exist");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(editPlan([first, { ...first, taskId: "another" }]))
      )
    ).toThrow("unique");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(editPlan([first, { ...second, taskId: first.taskId }]))
      )
    ).toThrow("unique");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify(
          editPlan([
            { ...second, dependsOn: [first.taskId, first.taskId] },
            first,
          ])
        )
      )
    ).toThrow("unique");
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
    const plan = compiled.parseResponse(JSON.stringify(response));
    expect(plan.tasks[0].sectionId).toMatch(/^generated-/);
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...response,
          tasks: [{ ...insertion, sectionId: "model-id" }],
        })
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
        JSON.stringify({ ...response, tasks: [disallowed] })
      )
    ).toThrow("permissions");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({
          ...response,
          tasks: [{ ...insertion, targetComponentIds: ["first-a"] }],
        })
      )
    ).toThrow("outside its section");
  });

  it("honors static permissions and read-only slots without confusing insert permission with drag permission", () => {
    const fixture = editGenerationFixture();
    fixture.components.Card.permissions = { insert: false };
    const reorder = {
      ...editTask(
        "first",
        ["first-a"],
        [
          {
            kind: "reorder",
            componentId: "first-a",
            anchor: { position: "end" },
          },
        ]
      ),
      generateContent: false,
    };
    expect(
      validateSectionEditTask(fixture.catalog, fixture.data, reorder).task
    ).toEqual(reorder);
    fixture.data.content[1].props.content[0].readOnly = { cards: true };
    expect(() =>
      validateSectionEditTask(fixture.catalog, fixture.data, reorder)
    ).toThrow("protected slot");
    fixture.components.Card.permissions = { edit: false };
    expect(() =>
      validateSectionEditTask(fixture.catalog, fixture.data, editTask())
    ).toThrow("protected");
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
    expect(compiled.context.readOnlyFields["first-a"]).toMatchObject({
      text: true,
    });
    expect(() => compiled.parseResponse(JSON.stringify(editPlan()))).toThrow(
      "no writable authored paths"
    );
    expect(compiled.context.localizedText["first-a"]).toBeUndefined();
    expect(compiled.context.localizedText["first-b"]).toContainEqual({
      path: "/text",
      overrideLocales: ["fr"],
    });
    expect(
      compiled.parseResponse(
        JSON.stringify(editPlan([editTask("first", ["first-b"])]))
      ).tasks
    ).toHaveLength(1);
    // A later compilation must observe new permissions rather than a cached contract.
    fixture.data.content[1].props.content[0].props.cards[0].readOnly = {};
    expect(
      compileEditPlanningSchema(
        fixture.catalog,
        ["en", "fr"],
        fixture.data
      ).parseResponse(JSON.stringify(editPlan())).tasks
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
    expect(compiled.parseResponse(JSON.stringify(output)).tasks).toEqual([]);
  });

  it("rejects implicit changes to opaque descendants, removed parents and invalid layouts", () => {
    const fixture = editGenerationFixture();
    const remove = {
      ...editTask(
        "first",
        ["first"],
        [{ kind: "remove", componentId: "first" }]
      ),
      generateContent: false,
    };
    const underRemoved = {
      ...remove,
      targetComponentIds: ["first", "first-a"],
    };
    expect(() =>
      validateSectionEditTask(fixture.catalog, fixture.data, underRemoved)
    ).toThrow("descendant");
    fixture.data.content[1].props.content[0].props.cards.push({
      type: "Opaque",
      props: { id: "opaque" },
    });
    expect(() =>
      validateSectionEditTask(fixture.catalog, fixture.data, remove)
    ).toThrow("protected content");
    fixture.data.zones = { legacy: fixture.data.content };
    expect(() =>
      compileEditPlanningSchema(fixture.catalog, ["en"], fixture.data)
    ).toThrow("legacy zones");
  });
});
