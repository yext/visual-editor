import { describe, expect, it } from "vitest";
import {
  testCTAFieldAiSchema,
  testEntityFieldAiSchema,
  testImageFieldAiSchema,
  testRichTextFieldAiSchema,
  yextAiFieldTypes,
} from "./fieldTypes.ts";

describe("yextAiFieldTypes", () => {
  it("registers the spike test field family with schemas and descriptions", () => {
    expect(Object.keys(yextAiFieldTypes)).toEqual([
      "testEntityField",
      "testCTA",
      "testImage",
      "testRichText",
    ]);

    expect(yextAiFieldTypes.testEntityField.schema).toEqual(
      testEntityFieldAiSchema
    );
    expect(yextAiFieldTypes.testCTA.schema).toEqual(testCTAFieldAiSchema);
    expect(yextAiFieldTypes.testImage.schema).toEqual(testImageFieldAiSchema);
    expect(yextAiFieldTypes.testRichText.schema).toEqual(
      testRichTextFieldAiSchema
    );

    expect(yextAiFieldTypes.testEntityField.description).toBe(
      "A Yext text binding for one complete prop."
    );
    expect(yextAiFieldTypes.testCTA.description).toBe(
      "A Yext CTA binding for one complete CTA prop."
    );
    expect(yextAiFieldTypes.testImage.description).toBe(
      "Renders one complete Yext image component. Attach it to an empty non-void HTML element such as a div. Use only the direct image URL, dimensions, and alternate text allowed by the schema; do not add assetImage metadata. Never attach it to an img element or add hard-coded src, alt, width, or height attributes."
    );
    expect(yextAiFieldTypes.testRichText.description).toBe(
      "A Yext rich text binding for one complete body-copy prop."
    );
  });

  it("requires valid transform-backed field values", () => {
    expect(testEntityFieldAiSchema).toMatchObject({
      type: "object",
      required: ["field", "constantValueEnabled", "constantValue"],
      properties: { constantValue: { type: "string" } },
    });
    expect(testCTAFieldAiSchema).toMatchObject({
      type: "object",
      required: [
        "field",
        "constantValueEnabled",
        "selectedType",
        "constantValue",
      ],
      properties: {
        constantValueEnabled: { type: "boolean", enum: [true] },
        selectedType: { type: "string", enum: ["textAndLink"] },
        constantValue: {
          required: ["ctaType", "label", "link", "linkType"],
          properties: {
            ctaType: { type: "string", enum: ["textAndLink"] },
            label: {
              type: "object",
              required: ["en", "hasLocalizedValue"],
              properties: {
                hasLocalizedValue: { type: "string", enum: ["true"] },
              },
            },
            linkType: { type: "string", enum: ["URL"] },
          },
        },
      },
    });
    expect(testImageFieldAiSchema).toEqual({
      type: "object",
      additionalProperties: false,
      required: [
        "field",
        "constantValueEnabled",
        "constantValue",
        "aspectRatio",
        "imageFillType",
        "width",
      ],
      properties: {
        field: { type: "string" },
        constantValueEnabled: { type: "boolean", enum: [true] },
        constantValue: {
          type: "object",
          additionalProperties: false,
          required: ["url", "alternateText"],
          properties: {
            url: { type: "string" },
            height: { type: "number" },
            width: { type: "number" },
            alternateText: { type: "string" },
          },
        },
        aspectRatio: { type: "number" },
        imageFillType: { type: "string", enum: ["fill", "fit"] },
        width: { type: "number" },
      },
    });
    expect(testRichTextFieldAiSchema).toMatchObject({
      type: "object",
      required: ["field", "constantValueEnabled", "constantValue"],
      properties: {
        constantValueEnabled: { type: "boolean", enum: [true] },
        constantValue: {
          required: ["en", "hasLocalizedValue"],
          properties: {
            en: {
              type: "object",
              required: ["html", "json"],
            },
            hasLocalizedValue: { type: "string", enum: ["true"] },
          },
        },
      },
    });
  });

  it("creates complete defaults from camelCase and hyphenated field names", () => {
    expect(
      yextAiFieldTypes.testEntityField.defaultValue({
        componentName: "TestHero",
        fieldName: "eyebrowText",
      })
    ).toEqual({
      field: "",
      constantValue: "Eyebrow Text",
      constantValueEnabled: true,
    });
    expect(
      yextAiFieldTypes.testRichText.defaultValue({
        componentName: "TestHero",
        fieldName: "supporting-copy",
      })
    ).toEqual({
      field: "",
      constantValue: {
        en: { json: "", html: "<p>Supporting Copy</p>" },
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    });
    expect(
      yextAiFieldTypes.testCTA.defaultValue({
        componentName: "TestHero",
        fieldName: "primary-cta",
      })
    ).toEqual({
      field: "",
      constantValueEnabled: true,
      selectedType: "textAndLink",
      constantValue: {
        ctaType: "textAndLink",
        label: { en: "Primary Cta", hasLocalizedValue: "true" },
        link: "/learn-more",
        linkType: "URL",
      },
    });
    expect(
      yextAiFieldTypes.testImage.defaultValue({
        componentName: "TestHero",
        fieldName: "heroImage2",
      })
    ).toEqual({
      field: "",
      constantValueEnabled: true,
      constantValue: {
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        alternateText: "Hero Image 2",
      },
      aspectRatio: 1.78,
      imageFillType: "fill",
      width: 640,
    });
  });

  it("creates independent nested default values", () => {
    const firstDefault = yextAiFieldTypes.testCTA.defaultValue({
      componentName: "TestHero",
      fieldName: "primaryCta",
    });
    const secondDefault = yextAiFieldTypes.testCTA.defaultValue({
      componentName: "TestHero",
      fieldName: "primaryCta",
    });

    expect(firstDefault).toEqual(secondDefault);
    expect(firstDefault).not.toBe(secondDefault);
    expect(firstDefault.constantValue).not.toBe(secondDefault.constantValue);
    expect(firstDefault.constantValue.label).not.toBe(
      secondDefault.constantValue.label
    );
  });
});
