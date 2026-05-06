import { describe, expect, it } from "vitest";
import { getFieldsForSelector } from "./yextEntityFieldUtils.ts";

describe("getFieldsForSelector", () => {
  it("allows one descendant to satisfy multiple compatible mapping requirements", () => {
    const fields = getFieldsForSelector(
      {
        fields: [
          {
            name: "c_articles",
            definition: {
              name: "c_articles",
              typeName: "c_articles",
              isList: true,
              type: {},
            },
            children: {
              fields: [
                {
                  name: "title",
                  definition: {
                    name: "title",
                    typeName: "type.string",
                    type: {},
                  },
                },
              ],
            },
          },
        ],
        displayNames: {
          c_articles: "Articles",
          "c_articles.title": "Articles > Title",
        },
      },
      {
        itemSourceTypes: [["type.string"], ["type.string"]],
      }
    );

    expect(fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "c_articles",
        }),
      ])
    );
  });
});
