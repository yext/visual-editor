import { describe, expect, it } from "vitest";
import {
  testEntityFieldAiSchema,
  testRichTextFieldAiDescription,
  testRichTextFieldAiSchema,
} from "./fieldTypes.ts";
import { preparePuckAiConfig } from "./prepareRequest.ts";

describe("preparePuckAiConfig", () => {
  it("keeps only the MiniHero reference component in the AI-visible config", () => {
    const config = preparePuckAiConfig({
      root: { render: "root-render" },
      components: {
        MiniHero: {
          fields: {
            data: {
              type: "object",
            },
          },
        },
        HeroSection: {
          fields: {
            title: {
              type: "text",
            },
          },
        },
      },
    });

    expect(config?.root).toBeUndefined();
    expect(Object.keys(config?.components ?? {})).toEqual(["MiniHero"]);
  });

  it("excludes unsupported custom and code fields while preserving field ai metadata", () => {
    const config = preparePuckAiConfig({
      components: {
        MiniHero: {
          fields: {
            title: {
              type: "testEntityField",
              ai: {
                instructions: "Use mapped Yext text.",
              },
            },
            html: {
              type: "code",
            },
            inspector: {
              type: "custom",
            },
            body: {
              type: "testRichText",
            },
          },
        },
      },
    });

    expect(config?.components.MiniHero.fields.title.ai).toEqual({
      instructions: "Use mapped Yext text.",
      schema: testEntityFieldAiSchema,
    });
    expect(config?.components.MiniHero.fields.html.ai).toEqual({
      exclude: true,
    });
    expect(config?.components.MiniHero.fields.inspector.ai).toEqual({
      exclude: true,
    });
    expect(config?.components.MiniHero.fields.body.ai).toEqual({
      instructions: testRichTextFieldAiDescription,
      schema: testRichTextFieldAiSchema,
    });
  });
});
