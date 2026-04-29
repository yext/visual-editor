import { describe, expect, it } from "vitest";
import {
  getMappedCardSourceMode,
  getBaseEntityListSourceRootFields,
  isTopLevelLinkedEntitySourceField,
  resolveLinkedEntityMappedField,
  resolveLinkedEntitySourceItems,
} from "./linkedEntityListWrapper.ts";
import { type LinkedEntitySchemas } from "../linkedEntityFieldUtils.ts";

describe("linkedEntityListWrapper", () => {
  const linkedEntitySchemas: LinkedEntitySchemas = {
    c_linkedLocation: {
      displayName: "Linked Location",
      fields: [
        {
          name: "name",
          displayName: "Name",
          definition: {
            name: "name",
            typeName: "type.string",
            type: {},
          },
        },
      ],
    },
  };

  it("detects top-level linked entity source roots", () => {
    expect(
      isTopLevelLinkedEntitySourceField("c_linkedLocation", linkedEntitySchemas)
    ).toBe(true);
    expect(
      isTopLevelLinkedEntitySourceField(
        "c_linkedLocation.name",
        linkedEntitySchemas
      )
    ).toBe(false);
    expect(isTopLevelLinkedEntitySourceField("name", linkedEntitySchemas)).toBe(
      false
    );
  });

  it("detects linked list and section source modes", () => {
    expect(
      getMappedCardSourceMode(
        {
          c_eventsSection: {
            events: [{ title: "Cooking Class" }],
          },
        },
        "c_eventsSection",
        "events"
      )
    ).toBe("section");

    expect(
      getMappedCardSourceMode(
        {
          c_linkedLocation: [{ name: "Downtown" }],
        },
        "c_linkedLocation",
        "events"
      )
    ).toBe("itemList");
  });

  it("returns top-level list roots with nested fields for base entity sources", () => {
    expect(
      getBaseEntityListSourceRootFields([
        {
          name: "c_customEvents",
          children: {
            fields: [{ name: "title" }],
          },
        },
        {
          name: "photoGallery",
        },
      ] as any)
    ).toEqual([
      {
        name: "c_customEvents",
        children: {
          fields: [{ name: "title" }],
        },
      },
    ]);
  });

  it("resolves linked entity source items for empty, single, and multiple values", () => {
    expect(resolveLinkedEntitySourceItems({}, "c_linkedLocation")).toEqual([]);
    expect(
      resolveLinkedEntitySourceItems(
        {
          c_linkedLocation: {
            name: "Downtown",
          },
        },
        "c_linkedLocation"
      )
    ).toEqual([{ name: "Downtown" }]);
    expect(
      resolveLinkedEntitySourceItems(
        {
          c_linkedLocation: [{ name: "Downtown" }, { name: "Uptown" }],
        },
        "c_linkedLocation"
      )
    ).toEqual([{ name: "Downtown" }, { name: "Uptown" }]);
  });

  it("resolves mapped fields relative to the linked source root", () => {
    expect(
      resolveLinkedEntityMappedField(
        {
          name: "Downtown",
          address: {
            city: "New York",
          },
        },
        "c_linkedLocation",
        "c_linkedLocation.address.city"
      )
    ).toBe("New York");
  });
});
