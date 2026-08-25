import { createElement } from "react";
import { describe, expect, it } from "vitest";
import {
  testEntityFieldAiSchema,
  testRichTextFieldAiDescription,
  testRichTextFieldAiSchema,
  yextAiFieldTypes,
} from "./fieldTypes.ts";
import { preparePuckAiConfig, preparePuckAiRequest } from "./prepareRequest.ts";
import {
  puckAiDesignModeInstructions,
  puckAiSystemContext,
} from "./systemPrompt.ts";

describe("preparePuckAiConfig", () => {
  it("provides a generic custom-field component contract", () => {
    expect(puckAiSystemContext).toContain("fields");
    expect(puckAiSystemContext).toContain("defaultProps");
    expect(puckAiSystemContext).toContain("Repeated static UI is supported.");
    expect(puckAiSystemContext).toContain("card1Title");
    expect(puckAiSystemContext).toContain(
      "Do not use slots or child components"
    );
    expect(puckAiSystemContext).not.toContain("MiniHero");
    expect(puckAiDesignModeInstructions).not.toContain("MiniHero");
  });

  it("keeps only the Test reference components in the AI-visible config", () => {
    const config = preparePuckAiConfig({
      root: { render: "root-render" },
      components: {
        TestHero: {
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
    expect(Object.keys(config?.components ?? {})).toEqual([
      "TestHero",
      "TestBanner",
    ]);
  });

  it("adds the Test references when the host config does not include them", () => {
    const config = preparePuckAiConfig({
      components: {
        HeroSection: {
          fields: {
            title: {
              type: "text",
            },
          },
        },
      },
    });

    expect(config?.components.TestHero).toMatchObject({
      fields: {
        title: {
          type: "testEntityField",
        },
      },
    });
    expect(config?.components.TestBanner).toMatchObject({
      fields: {
        primarycta: {
          type: "testCTA",
        },
      },
    });
  });

  it("excludes unsupported custom and code fields while preserving field ai metadata", () => {
    const config = preparePuckAiConfig({
      components: {
        TestHero: {
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

    expect(config?.components.TestHero.fields.title.ai).toEqual({
      instructions: "Use mapped Yext text.",
      schema: testEntityFieldAiSchema,
    });
    expect(config?.components.TestHero.fields.html.ai).toEqual({
      exclude: true,
    });
    expect(config?.components.TestHero.fields.inspector.ai).toEqual({
      exclude: true,
    });
    expect(config?.components.TestHero.fields.body.ai).toEqual({
      instructions: testRichTextFieldAiDescription,
      schema: testRichTextFieldAiSchema,
    });
  });

  it("prepares the complete Puck design-mode request", async () => {
    window.localStorage.setItem(
      "visual-editor.local-editor.puck-api-key",
      "local-editor-api-key"
    );

    const request = await preparePuckAiRequest({
      headers: { "x-test": "test-value" },
      body: {
        config: {
          components: {
            TestHero: {
              render: () => createElement("div"),
              fields: {
                title: { type: "testEntityField" },
              },
            },
          },
        },
        mode: "design",
      },
    });

    expect({ ...request.headers }).toMatchObject({
      "x-puck-api-key": "local-editor-api-key",
      "x-test": "test-value",
    });
    expect(request.body).toMatchObject({
      config: {
        components: {
          TestHero: {
            fields: {
              title: { type: "testEntityField" },
            },
          },
          TestBanner: {
            fields: {
              title: { type: "testEntityField" },
            },
          },
        },
      },
      context: puckAiSystemContext,
      fieldTypes: yextAiFieldTypes,
      designMode: {
        allowed: true,
        instructions: puckAiDesignModeInstructions,
      },
      byok: { model: "openai/gpt-5.6-luna" },
    });
    window.localStorage.removeItem("visual-editor.local-editor.puck-api-key");
  });
});
