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
      "A Yext image binding for one complete image prop."
    );
    expect(yextAiFieldTypes.testRichText.description).toBe(
      "A Yext rich text binding for one complete body-copy prop."
    );
  });

  it("uses only the documented object and property schema syntax", () => {
    expect(testEntityFieldAiSchema).toMatchObject({
      type: "object",
      properties: { constantValue: { type: "string" } },
    });
    expect(testCTAFieldAiSchema).toMatchObject({
      type: "object",
      properties: {
        constantValue: {
          properties: {
            ctaType: { type: "string" },
            label: { type: "object" },
          },
        },
      },
    });
    expect(testImageFieldAiSchema).toMatchObject({
      type: "object",
      properties: {
        constantValue: {
          properties: {
            url: { type: "string" },
            alternateText: { type: "string" },
            assetImage: {
              properties: {
                name: { type: "string" },
                transformedImage: { properties: { url: { type: "string" } } },
                originalImage: {
                  properties: { dimension: { type: "object" } },
                },
                childImages: { type: "array" },
                transformations: {
                  properties: {
                    CROP: { properties: { aspectRatio: { type: "object" } } },
                    ROTATION: { properties: { degree: { type: "number" } } },
                  },
                },
                sourceUrl: { type: "string" },
                altText: { type: "string" },
              },
            },
          },
        },
      },
    });
    expect(testRichTextFieldAiSchema).toMatchObject({
      type: "object",
      properties: {
        constantValue: { properties: { en: { type: "object" } } },
      },
    });
  });
});
