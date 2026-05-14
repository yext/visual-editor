import { describe, expect, it } from "vitest";
import { getListSourceRootFields } from "./mappedSource.ts";

describe("mappedSource", () => {
  it("returns descendant list roots with nested fields for mapped sources", () => {
    expect(
      getListSourceRootFields([
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
            fields: [
              {
                name: "items",
                definition: {
                  isList: true,
                  name: "items",
                  type: {},
                },
                children: {
                  fields: [{ name: "title" }],
                },
              },
            ],
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
      {
        name: "heroSection.items",
        definition: {
          isList: true,
          name: "items",
          type: {},
        },
        children: {
          fields: [{ name: "title" }],
        },
      },
    ]);
  });
});
