// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  editGenerationFixture,
  editPlan,
  editTask,
} from "../../testing/editFixtures.ts";
import {
  buildPlanningContext,
  validateEditPlan,
  validateSectionEditTask,
} from "./taskValidation.ts";

describe("edit plan and task validation", () => {
  it("validates dependencies, task uniqueness and section grouping", () => {
    const fixture = editGenerationFixture();
    const context = buildPlanningContext(fixture.catalog, fixture.data);
    const first = editTask();
    const second = {
      ...editTask("second", ["second-a"]),
      dependsOn: [first.taskId],
    };
    expect(
      validateEditPlan(fixture.catalog, context, editPlan([first, second]))
        .tasks
    ).toHaveLength(2);
    expect(() =>
      validateEditPlan(
        fixture.catalog,
        context,
        editPlan([{ ...first, dependsOn: [second.taskId] }, second])
      )
    ).toThrow("acyclic");
    expect(() =>
      validateEditPlan(
        fixture.catalog,
        context,
        editPlan([{ ...first, dependsOn: ["missing"] }])
      )
    ).toThrow("does not exist");
    expect(() =>
      validateEditPlan(
        fixture.catalog,
        context,
        editPlan([first, { ...first, taskId: "another" }])
      )
    ).toThrow("unique");
    expect(() =>
      validateEditPlan(
        fixture.catalog,
        context,
        editPlan([first, { ...second, taskId: first.taskId }])
      )
    ).toThrow("unique");
    expect(() =>
      validateEditPlan(
        fixture.catalog,
        context,
        editPlan([
          { ...second, dependsOn: [first.taskId, first.taskId] },
          first,
        ])
      )
    ).toThrow("unique");
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
    expect(() => buildPlanningContext(fixture.catalog, fixture.data)).toThrow(
      "legacy zones"
    );
  });
});
