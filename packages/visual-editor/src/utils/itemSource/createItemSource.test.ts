import { type ComponentData } from "@puckeditor/core";
import { describe, expect, it } from "vitest";
import {
  type TranslatableRichText,
  type TranslatableString,
} from "../../types/types.ts";
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

  it("clears mapping field bindings while preserving constants when the source changes", () => {
    const resolved = articleItems.normalizeData(
      {
        type: "ArticleList",
        props: {
          articleSource: {
            field: "c_newArticles",
            constantValueEnabled: false,
            constantValue: [],
          },
          articleMappings: {
            title: {
              field: "title",
              constantValueEnabled: false,
              constantValue: { defaultValue: "Fallback title" },
            },
            description: {
              field: "description",
              constantValueEnabled: false,
              constantValue: { defaultValue: "" },
            },
            eyebrow: "Featured",
            rootTitle: {
              field: "name",
              constantValueEnabled: false,
              constantValue: { defaultValue: "Root fallback" },
            },
          },
        },
      } as unknown as ComponentData<TestProps>,
      {
        lastData: {
          props: {
            articleSource: {
              field: "c_oldArticles",
              constantValueEnabled: false,
              constantValue: [],
            },
          },
        },
      }
    );

    expect(resolved.props.articleMappings?.title.field).toBe("");
    expect(resolved.props.articleMappings?.rootTitle.field).toBe("");
    expect(resolved.props.articleMappings?.title.constantValue).toEqual({
      defaultValue: "Fallback title",
    });
    expect(resolved.props.articleMappings?.eyebrow).toBe("Featured");
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
});
