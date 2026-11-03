import { describe, expect, it } from "vitest";
import {
  type TranslatableRichText,
  type TranslatableString,
} from "../../types/types.ts";
import { createItemSource } from "./index.ts";
import { ITEM_SOURCE_SELF_FIELD } from "./itemSourceTypes.ts";
import { createYextFieldTransforms } from "../../fields/fieldTransforms/index.ts";
import { toPuckFields } from "../../fields/fields.ts";

type ArticleItemProps = {
  title: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: TranslatableString;
  };
  description: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: TranslatableRichText;
  };
  eyebrow: string;
  secondaryTitle: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: TranslatableString;
  };
};

const articleSource = createItemSource<ArticleItemProps>({
  label: "Articles",
  mappingFields: {
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.rich_text_v2"] },
    },
    eyebrow: {
      type: "text",
      label: "Eyebrow",
    },
    secondaryTitle: {
      type: "entityField",
      label: "Secondary Title",
      filter: { types: ["type.string"] },
    },
  },
});

describe("createItemSource", () => {
  it("returns a repeated entity field with helper-owned defaults", () => {
    expect(articleSource).toHaveProperty("field");
    expect(articleSource).toHaveProperty("defaultValue");
    expect(articleSource).toHaveProperty("value");
    expect(articleSource.field).toMatchObject({
      type: "entityField",
      label: "Articles",
      filter: {
        itemSourceTypes: [
          ["type.string"],
          ["type.rich_text_v2"],
          ["type.string"],
        ],
      },
    });
    expect(articleSource.defaultValue).toMatchObject({
      field: "",
      constantValueEnabled: true,
      constantValue: [],
      mappings: {
        eyebrow: undefined,
      },
    });
  });

  it("uses the first default value as the add-item template and seeds manual items", () => {
    const customizedSource = createItemSource<ArticleItemProps>({
      label: "Articles",
      mappingFields: {
        title: {
          type: "entityField",
          label: "Title",
          filter: { types: ["type.string"] },
        },
        description: {
          type: "entityField",
          label: "Description",
          filter: { types: ["type.rich_text_v2"] },
        },
        eyebrow: {
          type: "text",
          label: "Eyebrow",
        },
        secondaryTitle: {
          type: "entityField",
          label: "Secondary Title",
          filter: { types: ["type.string"] },
        },
      },
      defaultValues: [
        {
          title: {
            field: "",
            constantValueEnabled: true,
            constantValue: { defaultValue: "Seeded title" },
          },
          description: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              defaultValue: { html: "<p>Seeded summary</p>" },
            },
          },
          eyebrow: "Manual",
          secondaryTitle: {
            field: "",
            constantValueEnabled: true,
            constantValue: { defaultValue: "" },
          },
        },
        {
          title: {
            field: "",
            constantValueEnabled: true,
            constantValue: { defaultValue: "Second title" },
          },
          description: {
            field: "",
            constantValueEnabled: true,
            constantValue: {
              defaultValue: { html: "<p>Second summary</p>" },
            },
          },
          eyebrow: "Secondary",
          secondaryTitle: {
            field: "",
            constantValueEnabled: true,
            constantValue: { defaultValue: "" },
          },
        },
      ],
    });

    expect((customizedSource.field as any).repeated.defaultItemValue).toEqual({
      title: {
        field: "",
        constantValueEnabled: true,
        constantValue: { defaultValue: "Seeded title" },
      },
      description: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          defaultValue: { html: "<p>Seeded summary</p>" },
        },
      },
      eyebrow: "Manual",
      secondaryTitle: {
        field: "",
        constantValueEnabled: true,
        constantValue: { defaultValue: "" },
      },
    });
    expect(customizedSource.defaultValue.constantValue).toEqual([
      {
        title: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "Seeded title" },
        },
        description: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            defaultValue: { html: "<p>Seeded summary</p>" },
          },
        },
        eyebrow: "Manual",
        secondaryTitle: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "" },
        },
      },
      {
        title: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "Second title" },
        },
        description: {
          field: "",
          constantValueEnabled: true,
          constantValue: {
            defaultValue: { html: "<p>Second summary</p>" },
          },
        },
        eyebrow: "Secondary",
        secondaryTitle: {
          field: "",
          constantValueEnabled: true,
          constantValue: { defaultValue: "" },
        },
      },
    ]);
    expect(customizedSource.defaultValue.mappings).toEqual({
      title: {
        field: "",
        constantValueEnabled: false,
        constantValue: undefined,
      },
      description: {
        field: "",
        constantValueEnabled: false,
        constantValue: undefined,
      },
      eyebrow: undefined,
      secondaryTitle: {
        field: "",
        constantValueEnabled: false,
        constantValue: undefined,
      },
    });
  });

  it("keeps mapping-only constant toggle restrictions out of manual items", () => {
    const imageSource = createItemSource<{
      image: {
        field: string;
        constantValueEnabled?: boolean;
        constantValue: { url?: string };
      };
      highlights: {
        field: string;
        constantValueEnabled?: boolean;
        constantValue: TranslatableString[];
      };
      title: {
        field: string;
        constantValueEnabled?: boolean;
        constantValue: TranslatableString;
      };
      cta: {
        field: string;
        constantValueEnabled?: boolean;
        constantValue: {
          label?: TranslatableString;
          link?: TranslatableString;
        };
      };
    }>({
      label: "Images",
      mappingFields: {
        image: {
          type: "entityField",
          label: "Image",
          filter: { types: ["type.image"] },
        },
        highlights: {
          type: "entityField",
          label: "Highlights",
          filter: { types: ["type.string"], includeListsOnly: true },
        },
        title: {
          type: "entityField",
          label: "Title",
          filter: { types: ["type.string"] },
        },
        cta: {
          type: "entityField",
          label: "CTA",
          filter: { types: ["type.cta"] },
        },
      },
    });

    expect(imageSource.defaultValue.constantValue).toEqual([]);
    expect(imageSource.defaultValue.mappings?.image.constantValueEnabled).toBe(
      false
    );
    expect(
      (imageSource.field as any).repeated?.defaultItemValue.image
        .constantValueEnabled
    ).toBe(true);
    expect(
      (imageSource.field as any).repeated?.mappingFields.image
        .disableConstantValueToggle
    ).toBe(true);
    expect(
      (imageSource.field as any).repeated?.mappingFields.title
        .disableConstantValueToggle
    ).toBe(false);
    expect(
      (imageSource.field as any).repeated?.manualItemFields.title
        .sourceFieldPath
    ).toBeUndefined();
  });

  it("resolves linked items against the current mapped item", () => {
    const resolved = articleSource.resolveItems(
      {
        field: "c_articles",
        constantValueEnabled: false,
        constantValue: [],
        mappings: {
          title: {
            field: "name",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
          description: {
            field: "summary",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
          eyebrow: "Featured",
          secondaryTitle: {
            field: "headline",
            constantValueEnabled: false,
            constantValue: { defaultValue: "" },
          },
        },
      },
      {
        locale: "en",
        name: "Root name",
        c_articles: [
          {
            name: "Article one",
            headline: "Headline one",
            summary: { html: "<p>Summary one</p>" },
          },
          {
            name: "Article two",
            headline: "Headline two",
            summary: { html: "<p>Summary two</p>" },
          },
        ],
      }
    );

    expect(resolved).toEqual([
      {
        title: "Article one",
        description: { html: "<p>Summary one</p>" },
        eyebrow: "Featured",
        secondaryTitle: "Headline one",
      },
      {
        title: "Article two",
        description: { html: "<p>Summary two</p>" },
        eyebrow: "Featured",
        secondaryTitle: "Headline two",
      },
    ]);
  });

  it("resolves manual items from constantValue", () => {
    const resolved = articleSource.resolveItems(
      {
        field: "",
        constantValueEnabled: true,
        constantValue: [
          {
            title: {
              field: "",
              constantValueEnabled: true,
              constantValue: { defaultValue: "Manual title" },
            },
            description: {
              field: "",
              constantValueEnabled: true,
              constantValue: {
                defaultValue: { html: "<p>Manual summary</p>" },
              },
            },
            eyebrow: "Manual",
            secondaryTitle: {
              field: "name",
              constantValueEnabled: false,
              constantValue: { defaultValue: "" },
            },
          },
        ],
        mappings: articleSource.defaultValue.mappings,
      },
      {
        locale: "en",
        name: "Root fallback",
      }
    );

    expect(resolved).toEqual([
      {
        title: { defaultValue: "Manual title" },
        description: { defaultValue: { html: "<p>Manual summary</p>" } },
        eyebrow: "Manual",
        secondaryTitle: "Root fallback",
      },
    ]);
  });

  it("resolves direct image items and mapped object items with optional links", () => {
    const gallerySource = createItemSource<{
      image: {
        field: string;
        constantValueEnabled?: boolean;
        constantValue: { url: string };
      };
      link: {
        field: string;
        constantValueEnabled?: boolean;
        constantValue: string;
      };
    }>({
      label: "Images",
      mappingFields: {
        image: {
          type: "entityField",
          filter: { types: ["type.image"] },
        },
        link: {
          type: "entityField",
          filter: { types: ["type.string"] },
        },
      },
    });

    expect((gallerySource.field as any).filter).toEqual({
      itemSourceTypes: [["type.image"], ["type.string"]],
    });
    expect(
      (gallerySource.field as any).repeated.mappingFields.image.filter
    ).toEqual({
      types: ["type.image"],
    });

    expect(
      gallerySource.resolveItems(
        {
          field: "images",
          constantValue: [],
          constantValueEnabled: false,
          mappings: {
            image: {
              field: ITEM_SOURCE_SELF_FIELD,
              constantValue: { url: "" },
              constantValueEnabled: false,
            },
            link: {
              field: "clickthroughUrl",
              constantValue: "",
              constantValueEnabled: false,
            },
          },
        },
        {
          locale: "en",
          images: [
            { url: "https://example.com/one.jpg" },
            {
              image: { url: "https://example.com/two.jpg" },
              clickthroughUrl: "https://example.com/two",
            },
          ],
        }
      )
    ).toEqual([
      { image: { url: "https://example.com/one.jpg" }, link: undefined },
      {
        image: {
          image: { url: "https://example.com/two.jpg" },
          clickthroughUrl: "https://example.com/two",
        },
        link: "https://example.com/two",
      },
    ]);

    expect(
      gallerySource.resolveItems(
        {
          field: "products",
          constantValue: [],
          constantValueEnabled: false,
          mappings: {
            image: {
              field: "cover",
              constantValue: { url: "" },
              constantValueEnabled: false,
            },
            link: {
              field: "destination",
              constantValue: "",
              constantValueEnabled: false,
            },
          },
        },
        {
          locale: "en",
          products: [
            {
              cover: { url: "https://example.com/product.jpg" },
              destination: "/product",
            },
          ],
        }
      )
    ).toEqual([
      { image: { url: "https://example.com/product.jpg" }, link: "/product" },
    ]);
  });

  it.each([
    {
      field: "$item",
      constantValueEnabled: false,
      expected: { url: "https://example.com/source.jpg" },
    },
    {
      field: "$item",
      constantValueEnabled: true,
      expected: { url: "https://example.com/manual.jpg" },
    },
    { field: "", constantValueEnabled: false, expected: undefined },
    { field: "", constantValueEnabled: undefined, expected: undefined },
    {
      field: "",
      constantValueEnabled: true,
      expected: { url: "https://example.com/manual.jpg" },
    },
  ])(
    "when a direct mapping uses '$field' with constant mode $constantValueEnabled then it uses the selected value",
    ({ field, constantValueEnabled, expected }) => {
      const source = createItemSource<{
        image: {
          field: string;
          constantValueEnabled?: boolean;
          constantValue: { url: string };
        };
      }>({
        label: "Images",
        mappingFields: {
          image: {
            type: "entityField",
            filter: { types: ["type.image"] },
            disableConstantValueToggle: false,
          },
        },
      });

      const value = {
        field: "images",
        constantValueEnabled: false,
        constantValue: [],
        mappings: {
          image: {
            field,
            constantValueEnabled,
            constantValue: { url: "https://example.com/manual.jpg" },
          },
        },
      };
      const streamDocument = {
        locale: "en",
        images: [{ url: "https://example.com/source.jpg" }],
      };
      const authored = structuredClone(value);
      expect(source.resolveItems(value, streamDocument)).toEqual([
        { image: expected },
      ]);
      expect(
        createYextFieldTransforms(streamDocument, "en").custom({
          field: toPuckFields({ images: { ...source.field, transform: true } })
            .images,
          value,
          componentId: "test",
          propName: "images",
          propPath: "images",
          isReadOnly: true,
        })
      ).toEqual([{ image: expected }]);
      expect(value).toEqual(authored);
    }
  );
  it.each([
    {
      type: "type.image" as const,
      item: { url: "https://example.com/image.jpg" },
    },
    { type: "type.string" as const, item: "Caption" },
  ])(
    "when the mapping accepts $type then complete items resolve",
    ({ type, item }): void => {
      const source = createItemSource({
        label: "Items",
        mappingFields: {
          value: {
            type: "entityField",
            filter: { types: [type] },
          },
        },
      });

      expect(source.field).toMatchObject({
        filter: { itemSourceTypes: [[type]] },
        repeated: {
          mappingFields: { value: { filter: { types: [type] } } },
          manualItemFields: { value: { filter: { types: [type] } } },
        },
      });
      expect(
        source.resolveItems(
          {
            field: "items",
            constantValueEnabled: false,
            constantValue: [],
            mappings: {
              value: { field: "$item", constantValueEnabled: false },
            },
          },
          { items: [item] }
        )
      ).toEqual([{ value: item }]);
      expect(
        createYextFieldTransforms({ items: [item] }, "en").custom({
          field: toPuckFields({ value: { ...source.field, transform: true } })
            .value,
          value: {
            field: "items",
            constantValueEnabled: false,
            constantValue: [],
            mappings: {
              value: { field: "$item", constantValueEnabled: false },
            },
          },
          componentId: "test",
          propName: "value",
          propPath: "value",
          isReadOnly: true,
        })
      ).toEqual([{ value: item }]);
    }
  );
});
