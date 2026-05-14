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

  it("merges duplicate scoped fields when one has a display name and another has nested children", () => {
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
                  name: "author",
                  displayName: "Author",
                  definition: {
                    name: "author",
                    typeName: "type.object",
                    type: {},
                  },
                },
                {
                  name: "author",
                  definition: {
                    name: "author",
                    typeName: "type.object",
                    type: {},
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
            },
          },
        ],
        displayNames: {
          c_articles: "Articles",
          "c_articles.author": "Articles > Author",
          "c_articles.author.name": "Articles > Author > Name",
        },
      },
      {},
      undefined,
      "c_articles"
    );

    expect(fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "author",
          displayName: "Author",
          children: {
            fields: [
              expect.objectContaining({
                name: "name",
                displayName: "Name",
              }),
            ],
          },
        }),
      ])
    );
  });
});
