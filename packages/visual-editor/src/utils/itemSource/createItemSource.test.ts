import { describe, expect, it } from "vitest";
import {
  type TranslatableRichText,
  type TranslatableString,
} from "../../types/types.ts";
import { createItemSource } from "./index.ts";

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
      constantValue: [
        {
          eyebrow: "",
        },
      ],
      mappings: {
        eyebrow: "",
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

    expect(
      imageSource.defaultValue.constantValue[0].image.constantValueEnabled
    ).toBe(true);
    expect(imageSource.defaultValue.mappings?.image.constantValueEnabled).toBe(
      false
    );
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
});
