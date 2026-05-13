import { describe, expect, it } from "vitest";
import { buildEntityFieldOptionGroups } from "./entityFieldOptionGroups.ts";

describe("buildEntityFieldOptionGroups", () => {
  it("renders linked entity fields after entity fields", () => {
    const groups = buildEntityFieldOptionGroups({
      entityFields: {
        fields: [
          {
            name: "name",
            definition: {
              name: "name",
              typeName: "type.string",
              type: {},
            },
          },
          {
            name: "c_linkedLocation",
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
        displayNames: {
          name: "Name",
          c_linkedLocation: "Linked Location",
          "c_linkedLocation.name": "Linked Location > Name",
        },
      },
      options: [
        { label: "Select a Field", value: "", fieldPath: "" },
        { label: "Name", value: "name", fieldPath: "name" },
        {
          label: "Linked Location > Name",
          value: "c_linkedLocation.name",
          fieldPath: "c_linkedLocation.name",
        },
      ],
      entityGroupTitle: "Entity Fields",
      linkedGroupTitle: "Linked Entity Fields",
    });

    expect(groups).toEqual([
      {
        options: [{ label: "Select a Field", value: "" }],
      },
      {
        title: "Entity Fields",
        options: [{ label: "Name", value: "name" }],
      },
      {
        title: "Linked Entity Fields",
        options: [
          {
            label: "Linked Location > Name",
            value: "c_linkedLocation.name",
          },
        ],
      },
    ]);
  });
});
