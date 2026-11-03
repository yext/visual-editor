import { expect, it } from "vitest";
import { createRequestLocalIds } from "./requestLocalIds.ts";

it("avoids saved Id collisions and keeps each request's mapping independent", () => {
  const first = createRequestLocalIds(["saved-first", "c0", "c1"]);
  expect(first.encode("saved-first")).toBe("c2");
  expect(first.decode(first.encode("c0"))).toBe("c0");
  expect(first.encode(null)).toBeNull();
  const second = createRequestLocalIds(["saved-second"]);
  expect(second.decode("c0")).toBe("saved-second");
  expect(first.decode(first.encode("saved-first"))).toBe("saved-first");
});

it("maps only planning references, retaining prose and task dependency identities", () => {
  const ids = createRequestLocalIds(["saved-first"]);
  const plan = {
    text: "saved-first c0",
    tasks: [
      {
        taskId: "saved-first",
        dependsOn: ["saved-first"],
        instructions: "saved-first c0",
        sectionId: "saved-first",
        targetComponentIds: ["saved-first"],
        structuralOperations: [
          {
            componentType: "saved-first",
            insertionKey: "saved-first",
            collection: {
              ownerId: "saved-first",
              slotPath: "/slots/saved-first",
            },
            anchor: { componentId: "saved-first" },
          },
        ],
      },
    ],
  };
  const wire = ids.references(plan, ids.encode);
  expect(wire).toMatchObject({
    text: plan.text,
    tasks: [
      {
        taskId: "saved-first",
        dependsOn: ["saved-first"],
        instructions: plan.tasks[0].instructions,
        sectionId: "c0",
        targetComponentIds: ["c0"],
        structuralOperations: [
          {
            componentType: "saved-first",
            insertionKey: "saved-first",
            collection: { ownerId: "c0", slotPath: "/slots/saved-first" },
            anchor: { componentId: "c0" },
          },
        ],
      },
    ],
  });
  expect(ids.references(wire, ids.decode)).toEqual(plan);
});
