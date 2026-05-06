import { describe, expect, it } from "vitest";
import {
  type TranslatableRichText,
  type TranslatableString,
} from "../../types/types.ts";
import { createItemSource } from "./index.ts";

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
  secondaryTitle: {
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
  sourcePath: "articleSource",
  mappingsPath: "articleMappings",
  sourceLabel: "Articles",
  mappingsLabel: "Article Mappings",
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

  it("resolves linked items against the current mapped item", () => {
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
        secondaryTitle: {
          field: "headline",
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
            secondaryTitle: {
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
        secondaryTitle: "Root fallback",
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
        };
      },
      {
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
      }
    >({
      sourcePath: "itemSource",
      mappingsPath: "itemMappings",
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
      (imageItems.fields as any).itemMappings.objectFields.highlights
        .disableConstantValueToggle
    ).toBe(false);
    expect(
      (imageItems.fields as any).itemMappings.objectFields.cta
        .disableConstantValueToggle
    ).toBe(false);
    expect(
      (imageItems.fields as any).itemMappings.objectFields.title.sourceFieldPath
    ).toBe("itemSource");
    expect(
      (imageItems.fields as any).itemSource.itemFields.title.sourceFieldPath
    ).toBeUndefined();
  });

  it("collects nested entity field types for the parent source selector", () => {
    const nestedItems = createItemSource<
      {
        itemSource: {
          field: string;
          constantValueEnabled?: boolean;
          constantValue: {
            content: {
              title: {
                field: string;
                constantValueEnabled?: boolean;
                constantValue: TranslatableString;
              };
            };
            highlights: {
              text: {
                field: string;
                constantValueEnabled?: boolean;
                constantValue: TranslatableString;
              };
            }[];
          }[];
        };
        itemMappings?: {
          content: {
            title: {
              field: string;
              constantValueEnabled?: boolean;
              constantValue: TranslatableString;
            };
          };
          highlights: {
            text: {
              field: string;
              constantValueEnabled?: boolean;
              constantValue: TranslatableString;
            };
          }[];
        };
      },
      {
        content: {
          title: {
            field: string;
            constantValueEnabled?: boolean;
            constantValue: TranslatableString;
          };
        };
        highlights: {
          text: {
            field: string;
            constantValueEnabled?: boolean;
            constantValue: TranslatableString;
          };
        }[];
      }
    >({
      sourcePath: "itemSource",
      mappingsPath: "itemMappings",
      mappingFields: {
        content: {
          type: "object",
          label: "Content",
          objectFields: {
            title: {
              type: "entityField",
              label: "Title",
              filter: { types: ["type.string"] },
            },
          },
        },
        highlights: {
          type: "array",
          label: "Highlights",
          arrayFields: {
            text: {
              type: "entityField",
              label: "Text",
              filter: { types: ["type.string"] },
            },
          },
        },
      },
    });

    expect(
      (nestedItems.fields as any).itemSource.filter.itemSourceTypes
    ).toEqual([["type.string"], ["type.string"]]);
  });
});
