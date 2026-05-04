import { describe, expect, it } from "vitest";
import {
  getBaseEntityListSourceRootFields,
  resolveMappedListSource,
} from "./mappedSource.ts";

describe("mappedSource", () => {
  it("resolves constant value, section, mapped, unresolved, and empty sources", () => {
    expect(
      resolveMappedListSource({
        streamDocument: {},
        constantValueEnabled: true,
        fieldPath: "c_linkedLocation",
        listFieldName: "events",
      })
    ).toEqual({ mode: "constantValue", items: [] });

    expect(
      resolveMappedListSource({
        streamDocument: {
          c_eventsSection: {
            events: [{ title: "Cooking Class" }],
          },
        },
        fieldPath: "c_eventsSection",
        listFieldName: "events",
      })
    ).toEqual({
      mode: "resolvedItems",
      itemSource: "sectionField",
      items: [{ title: "Cooking Class" }],
    });

    expect(
      resolveMappedListSource({
        streamDocument: {
          c_linkedLocation: [{ name: "Downtown" }],
        },
        fieldPath: "c_linkedLocation",
        listFieldName: "events",
      })
    ).toEqual({
      mode: "resolvedItems",
      itemSource: "mappedItemList",
      items: [{ name: "Downtown" }],
    });

    expect(
      resolveMappedListSource({
        streamDocument: {
          c_linkedLocation: { name: "Downtown" },
        },
        fieldPath: "c_linkedLocation",
        listFieldName: "events",
      })
    ).toEqual({
      mode: "resolvedItems",
      itemSource: "mappedItemList",
      items: [{ name: "Downtown" }],
    });

    expect(
      resolveMappedListSource({
        streamDocument: {},
        fieldPath: "c_linkedLocation",
        listFieldName: "events",
      })
    ).toEqual({
      mode: "resolvedItems",
      itemSource: "mappedItemList",
      items: [],
    });

    expect(
      resolveMappedListSource({
        streamDocument: {
          c_linkedLocation: [],
        },
        fieldPath: "c_linkedLocation",
        listFieldName: "events",
      })
    ).toEqual({
      mode: "resolvedItems",
      itemSource: "mappedItemList",
      items: [],
    });
  });

  it("returns top-level list roots with nested fields for base entity sources", () => {
    expect(
      getBaseEntityListSourceRootFields([
        {
          name: "c_customEvents",
          definition: {
            isList: true,
            name: "c_customEvents",
            type: {},
          },
          children: {
            fields: [{ name: "title" }],
          },
        },
        {
          name: "heroSection",
          definition: {
            name: "heroSection",
            type: {},
          },
          children: {
            fields: [{ name: "title" }],
          },
        },
        {
          name: "photoGallery",
          definition: {
            name: "photoGallery",
            type: {},
          },
        },
      ] as any)
    ).toEqual([
      {
        name: "c_customEvents",
        definition: {
          isList: true,
          name: "c_customEvents",
          type: {},
        },
        children: {
          fields: [{ name: "title" }],
        },
      },
    ]);
  });

  it("treats a missing source field as constant value mode", () => {
    expect(
      resolveMappedListSource({
        streamDocument: {},
        listFieldName: "events",
      })
    ).toEqual({ mode: "constantValue", items: [] });
  });
});
