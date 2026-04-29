import { describe, expect, it } from "vitest";
import {
  getMappedCardSourceMode,
  getBaseEntityListSourceRootFields,
  resolveLinkedEntitySourceItems,
} from "./linkedEntityListWrapper.ts";
import { type StreamFields } from "../../types/entityFields.ts";
import { isTopLevelLinkedEntityField } from "../linkedEntityFieldUtils.ts";

describe("linkedEntityListWrapper", () => {
  const entityFields: StreamFields = {
    fields: [
      {
        name: "c_linkedLocation",
        displayName: "Linked Location",
        definition: {
          name: "c_linkedLocation",
          typeRegistryId: "type.entity_reference",
          type: {
            documentType: "DOCUMENT_TYPE_ENTITY",
          },
        },
        children: {
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
      },
    ],
  };

  it("detects top-level linked entity source roots", () => {
    expect(isTopLevelLinkedEntityField("c_linkedLocation", entityFields)).toBe(
      true
    );
    expect(
      isTopLevelLinkedEntityField("c_linkedLocation.name", entityFields)
    ).toBe(false);
    expect(isTopLevelLinkedEntityField("name", entityFields)).toBe(false);
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
});
