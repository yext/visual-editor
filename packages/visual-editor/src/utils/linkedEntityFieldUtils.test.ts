import { describe, expect, it } from "vitest";
import {
  getTopLevelLinkedEntitySourceFields,
  isLinkedEntityFieldPath,
  isTopLevelLinkedEntityField,
  type LinkedEntitySchemas,
} from "./linkedEntityFieldUtils.ts";
import { type StreamFields } from "../types/entityFields.ts";

describe("linkedEntityFieldUtils", () => {
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
              name: "address",
              displayName: "Address",
              definition: {
                name: "address",
                typeName: "type.address",
                type: {},
              },
            },
          ],
        },
      },
      {
        name: "name",
        definition: {
          name: "name",
          typeName: "type.string",
          type: {},
        },
      },
    ],
    displayNames: {
      c_linkedLocation: "Linked Location",
      "c_linkedLocation.address": "Linked Location > Address",
    },
  };
  const linkedEntitySchemas: LinkedEntitySchemas = {
    c_linkedLocation: {
      displayName: "Linked Location",
      fields: [
        {
          name: "address",
          displayName: "Address",
          definition: {
            name: "address",
            typeName: "type.address",
            type: {},
          },
        },
      ],
    },
  };

  it("returns top-level linked entity source fields", () => {
    expect(getTopLevelLinkedEntitySourceFields(entityFields)).toEqual([
      entityFields.fields[0],
    ]);
  });

  it("uses entity fields and linked entity schemas to detect linked paths", () => {
    expect(isTopLevelLinkedEntityField("c_linkedLocation", entityFields)).toBe(
      true
    );
    expect(
      isLinkedEntityFieldPath("c_linkedLocation.address", linkedEntitySchemas)
    ).toBe(true);
    expect(
      isLinkedEntityFieldPath(
        "inheritedLinkedField.address.city",
        linkedEntitySchemas
      )
    ).toBe(false);
    expect(isLinkedEntityFieldPath("name", linkedEntitySchemas)).toBe(false);
    expect(isLinkedEntityFieldPath(undefined, linkedEntitySchemas)).toBe(false);
  });
});
