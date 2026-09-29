import { describe, expect, it } from "vitest";
import {
  getEntityFieldDisplayName,
  getFieldsForSelector,
} from "./yextEntityFieldUtils.ts";
import { ITEM_SOURCE_SELF_FIELD } from "../utils/itemSource/itemSourceTypes.ts";

describe("getFieldsForSelector", () => {
  it("offers image lists and image-bearing object lists for direct item sources", () => {
    const entityFields = {
      fields: [
        {
          name: "images",
          definition: {
            name: "images",
            isList: true,
            typeRegistryId: "type.image",
            type: {},
          },
        },
        {
          name: "gallery",
          definition: {
            name: "gallery",
            isList: true,
            typeRegistryId: "type.image",
            type: {},
          },
          children: {
            fields: [
              {
                name: "image",
                definition: {
                  name: "image",
                  typeRegistryId: "type.image",
                  type: {},
                },
              },
            ],
          },
        },
        {
          name: "products",
          definition: { name: "products", isList: true, type: {} },
          children: {
            fields: [
              {
                name: "cover",
                definition: {
                  name: "cover",
                  typeRegistryId: "type.image",
                  type: {},
                },
              },
            ],
          },
        },
        {
          name: "names",
          definition: {
            name: "names",
            isList: true,
            typeRegistryId: "type.string",
            type: {},
          },
        },
      ],
    };

    expect(
      getFieldsForSelector(entityFields, {
        itemSourceTypes: [["type.image"]],
        directItemTypes: ["type.image"],
      }).map((field) => field.name)
    ).toEqual(["gallery", "images", "products"]);
    expect(
      getFieldsForSelector(
        entityFields,
        { types: ["type.image"], directItemTypes: ["type.image"] },
        undefined,
        "images"
      ).map((field) => field.name)
    ).toEqual([ITEM_SOURCE_SELF_FIELD]);
    expect(
      getFieldsForSelector(
        entityFields,
        { types: ["type.image"] },
        undefined,
        "images"
      )
    ).toEqual([]);
  });
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

  it("allows string descendants to satisfy rich text item source requirements", () => {
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
        itemSourceTypes: [["type.rich_text_v2"]],
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

  it("applies rich text compatibility to mapped source descendant checks", () => {
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
        mappedSourceTypes: [["type.rich_text_v2"]],
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

describe("getEntityFieldDisplayName", () => {
  it("falls back to the first field-path segment when the schema path is unknown", () => {
    expect(
      getEntityFieldDisplayName("c_linkedEntity.unknownField", {
        fields: [],
        displayNames: {},
      })
    ).toBe("c_linkedEntity");
  });
});
