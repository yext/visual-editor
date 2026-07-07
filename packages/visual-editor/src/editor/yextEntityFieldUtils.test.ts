import { describe, expect, it } from "vitest";
import { productCardsSource } from "../components/pageSections/ProductSection/ProductCardsWrapper.tsx";
import {
  getEntityFieldDisplayName,
  getFieldsForSelector,
} from "./yextEntityFieldUtils.ts";

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

  it("treats c_productReference as a valid source for product cards requirements, despite missing CTA", () => {
    const fields = getFieldsForSelector(
      {
        fields: [
          {
            name: "c_productReference",
            definition: {
              name: "c_productReference",
              typeRegistryId: "type.entity_reference",
              isList: true,
              type: {
                documentType: "DOCUMENT_TYPE_ENTITY",
              },
            },
            children: {
              fields: [
                {
                  name: "brand",
                  definition: {
                    name: "brand",
                    typeName: "type.string",
                    type: {},
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
                {
                  name: "price",
                  definition: {
                    name: "price",
                    typeName: "type.price",
                    type: {},
                  },
                },
                {
                  name: "primaryPhoto",
                  definition: {
                    name: "primaryPhoto",
                    typeName: "type.image",
                    type: {},
                  },
                },
              ],
            },
          },
        ],
        displayNames: {
          c_productReference: "Product Reference",
          "c_productReference.brand": "Product Reference > Brand",
          "c_productReference.name": "Product Reference > Name",
          "c_productReference.price": "Product Reference > Price",
          "c_productReference.primaryPhoto":
            "Product Reference > Primary Photo",
        },
      },
      productCardsSource.field.filter
    );

    expect(fields).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          name: "c_productReference",
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
