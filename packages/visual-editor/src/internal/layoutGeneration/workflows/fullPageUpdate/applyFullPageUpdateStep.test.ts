import { expect, it } from "vitest";
import { clone, type Content } from "../../shared/authoredValues.ts";
import { creationCatalog } from "../../testing/creationFixtures.ts";
import { applyFullPageUpdateStep } from "./applyFullPageUpdateStep.ts";
import type { FullPageUpdateStep } from "./contracts.ts";
import {
  fullPageUpdateLayout,
  newHeading,
  bodySections,
} from "../../testing/fullPageUpdateFixtures.ts";

it("applies keep, deletion, insertion, and reordering without modifying saved metadata", () => {
  const catalog = creationCatalog();
  let data = fullPageUpdateLayout() as Content;
  data = applyFullPageUpdateStep(catalog, data, {
    kind: "keep",
    sectionId: "header",
  });
  data = applyFullPageUpdateStep(catalog, data, {
    kind: "remove",
    sectionId: "services",
  });
  expect(bodySections(data).map((item) => item.props.id)).toEqual([
    "hero",
    "testimonials",
  ]);
  data = applyFullPageUpdateStep(catalog, data, {
    kind: "reorder",
    sectionId: "testimonials",
    anchor: { position: "before", componentId: "hero" },
  });
  expect(bodySections(data)[0]).toEqual(
    bodySections(fullPageUpdateLayout() as Content)[2]
  );
  data = applyFullPageUpdateStep(catalog, data, {
    kind: "insert",
    collection: { ownerId: "main", slotPath: "/content" },
    anchor: { position: "end" },
    sections: [newHeading("new")],
  });
  expect(bodySections(data).map((item) => item.props.id)).toEqual([
    "testimonials",
    "hero",
    "new",
  ]);
  expect(data.content[2].props.id).toBe("footer");
});

it("reports a root anchor incorrectly used for insertion into MainContent", () => {
  const baseline = fullPageUpdateLayout() as Content;
  const anchor = { position: "before" as const, componentId: "footer" };
  const collection = { ownerId: "main", slotPath: "/content" };
  expect(() =>
    applyFullPageUpdateStep(creationCatalog(), baseline, {
      kind: "insert",
      collection,
      anchor,
      sections: [newHeading("new")],
    })
  ).toThrow(
    `Anchor is not in the permitted collection. Anchor: ${JSON.stringify(anchor)}. Destination: ${JSON.stringify(collection)}. Available sibling Ids: ${JSON.stringify(["hero", "services", "testimonials"])}.`
  );
  expect(baseline).toEqual(fullPageUpdateLayout());
});

it.each([
  { kind: "remove", sectionId: "main" },
  { kind: "remove", sectionId: "missing" },
  {
    kind: "reorder",
    sectionId: "hero",
    anchor: { position: "before", componentId: "footer" },
  },
  {
    kind: "insert",
    collection: { ownerId: "hero", slotPath: "/content" },
    anchor: { position: "end" },
    sections: [newHeading("new")],
  },
  {
    kind: "insert",
    collection: { ownerId: "main", slotPath: "/content" },
    anchor: { position: "end" },
    sections: [{ type: "MainContent", props: { id: "new", content: [] } }],
  },
  { kind: "replace", sectionId: "hero", sections: [newHeading("services")] },
] as FullPageUpdateStep[])(
  "rejects invalid step $kind without mutating the page",
  (step) => {
    const baseline = fullPageUpdateLayout() as Content;
    const before = clone(baseline);
    expect(() =>
      applyFullPageUpdateStep(creationCatalog(), baseline, step)
    ).toThrow();
    expect(baseline).toEqual(before);
  }
);

it.each(["delete", "insert", "edit"])(
  "enforces %s permission for replacement",
  (permission) => {
    expect(() =>
      applyFullPageUpdateStep(
        creationCatalog(),
        fullPageUpdateLayout() as Content,
        { kind: "replace", sectionId: "hero", sections: [newHeading("new")] },
        (requested) => requested !== permission
      )
    ).toThrow("permission denied");
  }
);

it("respects root placement restrictions, read-only slots, and drag permissions", () => {
  const catalog = creationCatalog();
  catalog.puckOptions.rootAllowedComponentIds = ["MainContent"];
  expect(() =>
    applyFullPageUpdateStep(catalog, fullPageUpdateLayout() as Content, {
      kind: "insert",
      collection: { ownerId: null, slotPath: null },
      anchor: { position: "end" },
      sections: [newHeading("new")],
    })
  ).toThrow("not permitted");
  const data = fullPageUpdateLayout() as Content;
  data.content[1].readOnly = { content: true };
  expect(() =>
    applyFullPageUpdateStep(creationCatalog(), data, {
      kind: "remove",
      sectionId: "hero",
    })
  ).toThrow("read-only");
  expect(() =>
    applyFullPageUpdateStep(
      creationCatalog(),
      fullPageUpdateLayout() as Content,
      { kind: "reorder", sectionId: "hero", anchor: { position: "end" } },
      (permission) => permission !== "drag"
    )
  ).toThrow("permission denied");
});
