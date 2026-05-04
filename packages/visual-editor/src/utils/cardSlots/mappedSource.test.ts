import { describe, expect, it } from "vitest";
import {
  classifyMappedSource,
  getBaseEntityListSourceRootFields,
  resolveMappedSourceItems,
} from "./mappedSource.ts";

describe("mappedSource", () => {
  it("classifies constant value, section, mapped, unresolved, and empty sources", () => {
    expect(
      classifyMappedSource({
        streamDocument: {},
        constantValueEnabled: true,
        fieldPath: "c_linkedLocation",
        listFieldName: "events",
      })
    ).toBe("constantValue");

    expect(
      classifyMappedSource({
        streamDocument: {
          c_eventsSection: {
            events: [{ title: "Cooking Class" }],
          },
        },
        fieldPath: "c_eventsSection",
        listFieldName: "events",
      })
    ).toBe("sectionField");

    expect(
      classifyMappedSource({
        streamDocument: {
          c_linkedLocation: [{ name: "Downtown" }],
        },
        fieldPath: "c_linkedLocation",
        listFieldName: "events",
      })
    ).toBe("mappedItemList");

    expect(
      classifyMappedSource({
        streamDocument: {
          c_linkedLocation: { name: "Downtown" },
        },
        fieldPath: "c_linkedLocation",
        listFieldName: "events",
      })
    ).toBe("mappedItemList");

    expect(
      classifyMappedSource({
        streamDocument: {},
        fieldPath: "c_linkedLocation",
        listFieldName: "events",
      })
    ).toBe("mappedItemList");

    expect(
      classifyMappedSource({
        streamDocument: {
          c_linkedLocation: [],
        },
        fieldPath: "c_linkedLocation",
        listFieldName: "events",
      })
    ).toBe("mappedItemList");
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

  it("resolves mapped source items for empty, single, and multiple values", () => {
    expect(resolveMappedSourceItems({}, "c_linkedLocation")).toEqual([]);
    expect(
      resolveMappedSourceItems(
        {
          c_linkedLocation: {
            name: "Downtown",
          },
        },
        "c_linkedLocation"
      )
    ).toEqual([{ name: "Downtown" }]);
    expect(
      resolveMappedSourceItems(
        {
          c_linkedLocation: [{ name: "Downtown" }, { name: "Uptown" }],
        },
        "c_linkedLocation"
      )
    ).toEqual([{ name: "Downtown" }, { name: "Uptown" }]);
  });
});
