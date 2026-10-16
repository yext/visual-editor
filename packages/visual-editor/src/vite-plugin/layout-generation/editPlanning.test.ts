// @vitest-environment node
import { describe, expect, it } from "vitest";
import { clone } from "../../internal/generation/authored.ts";
import type { SectionEditTask } from "../../internal/generation/editProtocol.ts";
import {
  compileEditPlanningSchema,
  buildEditPlanningPrompt,
  validateSectionEditTask,
} from "./editPlanning.ts";
import {
  editGenerationFixture,
  editPlan,
  editTask,
} from "./editGenerationTestUtils.ts";

describe("follow-up planning", () => {
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
    const context = JSON.stringify(compiled.context);
    expect(context).not.toContain("editorMetadata");
    expect(context).not.toContain("Private root setting");
    expect(context).not.toContain('"zones"');
    const prompt = buildEditPlanningPrompt();
    expect(prompt).toContain("Explicit user references override selection");
    expect(prompt).toContain("User ordinals are one-based");
    expect(prompt).toContain("materially plausible");
    expect(prompt).toContain("Do not simulate such a move");
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
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({ ...response, globalStyleGuidance: null })
      )
    ).toThrow("Styling requests require");
    expect(() =>
      compiled.parseResponse(
        JSON.stringify({ ...response, clarification: "Question?" })
      )
    ).toThrow("Clarification must match");
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
