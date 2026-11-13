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
  { kind: "keep", sectionId: "missing" },
  { kind: "replace", sectionId: "missing", sections: [newHeading("new")] },
  { kind: "reorder", sectionId: "missing", anchor: { position: "end" } },
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

it("ignores missing and repeated removals without mutating the baseline", () => {
  const catalog = creationCatalog();
  const baseline = fullPageUpdateLayout();
  const before = clone(baseline);
  expect(
    applyFullPageUpdateStep(catalog, baseline, {
      kind: "remove",
      sectionId: "missing",
    })
  ).toEqual(before);
  const removed = applyFullPageUpdateStep(catalog, baseline, {
    kind: "remove",
    sectionId: "services",
  });
  expect(
    applyFullPageUpdateStep(catalog, removed, {
      kind: "remove",
      sectionId: "services",
    })
  ).toEqual(removed);
  expect(baseline).toEqual(before);
});

it.each([
  { type: "Header", ownerId: "main", expectedAllowed: ["Heading"] },
  { type: "Heading", ownerId: null, expectedAllowed: ["Header"] },
  { type: "MainContent", ownerId: "main", expectedAllowed: ["Heading"] },
])(
  "when $type is prohibited in collection $ownerId then the error identifies the type and permitted alternatives",
  ({ type, ownerId, expectedAllowed }) => {
    const catalog = creationCatalog();
    catalog.data.components.Header = { ...catalog.data.components.Heading };
    catalog.puckOptions.rootAllowedComponentIds = ["Header", "MainContent"];
    const baseline = fullPageUpdateLayout();
    const before = clone(baseline);
    const collection = {
      ownerId,
      slotPath: ownerId === null ? null : "/content",
    };
    expect(() =>
      applyFullPageUpdateStep(catalog, baseline, {
        kind: "insert",
        collection,
        anchor: { position: "end" },
        sections: [
          {
            type,
            props: {
              id: "new-section",
              text: "Do not include this content in the error",
            },
          },
        ],
      })
    ).toThrow(
      `Component type is not permitted in this section collection. Component type: ${JSON.stringify(type)}. Destination: ${JSON.stringify(collection)}. Allowed component types: ${JSON.stringify(expectedAllowed)}.`
    );
    expect(baseline).toEqual(before);
  }
);
