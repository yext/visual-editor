import { describe, expect, it } from "vitest";
import {
  buildLinkedEntityStreamFields,
  isLinkedEntityFieldPath,
  type LinkedEntitySchemas,
} from "./linkedEntityFieldUtils.ts";

describe("linkedEntityFieldUtils", () => {
  it("builds synthetic stream fields and display names from linked entity schemas", () => {
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
            children: {
              fields: [
                {
                  name: "city",
                  displayName: "City",
                  definition: {
                    name: "city",
                    typeName: "type.string",
                    type: {},
                  },
                },
              ],
            },
          },
        ],
      },
    };

    const streamFields = buildLinkedEntityStreamFields(linkedEntitySchemas);

    expect(streamFields).toEqual({
      fields: [
        {
          name: "c_linkedLocation",
          definition: {
            name: "c_linkedLocation",
            type: {},
          },
          children: {
            fields: linkedEntitySchemas.c_linkedLocation.fields,
          },
          displayName: "Linked Location",
        },
      ],
      displayNames: {
        c_linkedLocation: "Linked Location",
        "c_linkedLocation.address": "Linked Location > Address",
        "c_linkedLocation.address.city": "Linked Location > Address > City",
      },
    });
  });

  it("returns null when linked entity schemas are missing", () => {
    expect(buildLinkedEntityStreamFields()).toBeNull();
  });

  it("returns true only for direct linked schema root keys", () => {
    const linkedEntitySchemas = Object.create({
      inheritedLinkedField: {
        displayName: "Inherited Linked Field",
        fields: [],
      },
    }) as LinkedEntitySchemas;

    linkedEntitySchemas.c_linkedLocation = {
      displayName: "Linked Location",
      fields: [],
    };

    expect(
      isLinkedEntityFieldPath(
        "c_linkedLocation.address.city",
        linkedEntitySchemas
      )
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
