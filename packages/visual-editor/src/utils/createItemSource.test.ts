import { describe, expect, it } from "vitest";
import {
  type TranslatableRichText,
  type TranslatableString,
} from "../types/types.ts";
import { createItemSource } from "./createItemSource.ts";

type ArticleItem = {
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
  rootTitle: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: TranslatableString;
  };
};

type TestProps = {
  articleSource: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: ArticleItem[];
  };
  articleMappings?: ArticleItem;
};

const articleItems = createItemSource<TestProps, ArticleItem>({
  itemSourcePath: "articleSource",
  itemMappingsPath: "articleMappings",
  itemSourceLabel: "Articles",
  itemMappingsLabel: "Article Mappings",
  itemFields: {
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
    rootTitle: {
      type: "entityField",
      label: "Root Title",
      sourceEntityPath: null,
      filter: { types: ["type.string"] },
    },
  },
});

describe("createItemSource", () => {
  it("shows shared mappings only when linked mode is active", () => {
    const manualFields = articleItems.resolveFields({
      props: {
        articleSource: {
          field: "",
          constantValueEnabled: true,
          constantValue: [],
        },
        articleMappings: articleItems.defaultProps.articleMappings,
      },
    }) as any;
    const linkedFields = articleItems.resolveFields({
      props: {
        articleSource: {
          field: "c_articles",
          constantValueEnabled: false,
          constantValue: [],
        },
        articleMappings: articleItems.defaultProps.articleMappings,
      },
    }) as any;

    expect(manualFields.articleMappings.visible).toBe(false);
    expect(linkedFields.articleMappings.visible).toBe(true);
  });

  it("resolves linked items against the current item and root-scoped fields against the page", () => {
    const resolved = articleItems.resolveItems(
      {
        field: "c_articles",
        constantValueEnabled: false,
        constantValue: [],
      },
      {
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
        rootTitle: {
          field: "name",
          constantValueEnabled: false,
          constantValue: { defaultValue: "" },
        },
      },
      {
        locale: "en",
        name: "Root name",
        c_articles: [
          {
            name: "Article one",
            summary: { html: "<p>Summary one</p>" },
          },
          {
            name: "Article two",
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
        rootTitle: "Root name",
      },
      {
        title: "Article two",
        description: { html: "<p>Summary two</p>" },
        eyebrow: "Featured",
        rootTitle: "Root name",
      },
    ]);
  });

  it("resolves manual items without requiring a derived output prop", () => {
    const resolved = articleItems.resolveItems(
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
            rootTitle: {
              field: "name",
              constantValueEnabled: false,
              constantValue: { defaultValue: "" },
            },
          },
        ],
      },
      articleItems.defaultProps.articleMappings,
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
        rootTitle: "Root fallback",
      },
    ]);
  });

  it("keeps mapping-only constant toggle restrictions out of manual items", () => {
    const imageItems = createItemSource<
      {
        itemSource: {
          field: string;
          constantValueEnabled?: boolean;
          constantValue: {
            image: {
              field: string;
              constantValueEnabled?: boolean;
              constantValue: { url?: string };
            };
          }[];
        };
        itemMappings?: {
          image: {
            field: string;
            constantValueEnabled?: boolean;
            constantValue: { url?: string };
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
        };
      },
      {
        image: {
          field: string;
          constantValueEnabled?: boolean;
          constantValue: { url?: string };
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
      }
    >({
      itemSourcePath: "itemSource",
      itemMappingsPath: "itemMappings",
      itemFields: {
        image: {
          type: "entityField",
          label: "Image",
          filter: { types: ["type.image"] },
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
      imageItems.defaultProps.itemSource?.constantValue?.[0]?.image
        ?.constantValueEnabled
    ).toBe(true);
    expect(
      imageItems.defaultProps.itemMappings?.image?.constantValueEnabled
    ).toBe(false);
    expect(
      (imageItems.fields as any).itemMappings.objectFields.image
        .disableConstantValueToggle
    ).toBe(true);
    expect(
      (imageItems.fields as any).itemMappings.objectFields.title
        .disableConstantValueToggle
    ).toBe(false);
    expect(
      (imageItems.fields as any).itemMappings.objectFields.cta
        .disableConstantValueToggle
    ).toBe(false);
  });
});
