import { type AiFieldTypeRegistry } from "@puckeditor/cloud-client";

export const testEntityFieldAiDescription =
  "A Yext text binding for one complete prop.";

export const testCTAFieldAiDescription =
  "A Yext CTA binding for one complete CTA prop.";

export const testImageFieldAiDescription =
  "A Yext image binding for one complete image prop.";

export const testRichTextFieldAiDescription =
  "A Yext rich text binding for one complete body-copy prop.";

const imageDataAiSchema = {
  type: "object",
  properties: {
    url: { type: "string" },
    dimension: {
      type: "object",
      properties: {
        width: { type: "number" },
        height: { type: "number" },
      },
    },
    exifMetadata: {
      type: "object",
      properties: {
        rotate: { type: "number" },
      },
    },
  },
};

const imageContentDataAiSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    transformedImage: imageDataAiSchema,
    originalImage: imageDataAiSchema,
    childImages: {
      type: "array",
      items: imageDataAiSchema,
    },
    transformations: {
      type: "object",
      properties: {
        CROP: {
          type: "object",
          properties: {
            left: { type: "number" },
            top: { type: "number" },
            height: { type: "number" },
            width: { type: "number" },
            aspectRatio: {
              type: "object",
              properties: {
                horizontalFactor: { type: "number" },
                verticalFactor: { type: "number" },
              },
            },
          },
        },
        ROTATION: {
          type: "object",
          properties: {
            degree: { type: "number" },
          },
        },
      },
    },
    sourceUrl: { type: "string" },
    altText: { type: "string" },
  },
};

export const testEntityFieldAiSchema = {
  type: "object",
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean" },
    constantValue: { type: "string" },
  },
};

export const testCTAFieldAiSchema = {
  type: "object",
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean" },
    selectedType: { type: "string" },
    constantValue: {
      type: "object",
      properties: {
        ctaType: { type: "string" },
        label: {
          type: "object",
          properties: {
            en: { type: "string" },
            hasLocalizedValue: { type: "string" },
          },
        },
        link: { type: "string" },
        linkType: { type: "string" },
      },
    },
  },
};

export const testImageFieldAiSchema = {
  type: "object",
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean" },
    constantValue: {
      type: "object",
      properties: {
        url: { type: "string" },
        height: { type: "number" },
        width: { type: "number" },
        alternateText: { type: "string" },
        assetImage: imageContentDataAiSchema,
      },
    },
    aspectRatio: { type: "number" },
    imageFillType: { type: "string" },
    width: { type: "number" },
  },
};

export const testRichTextFieldAiSchema = {
  type: "object",
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean" },
    constantValue: {
      type: "object",
      properties: {
        en: {
          type: "object",
          properties: {
            html: { type: "string" },
            json: { type: "string" },
          },
        },
        hasLocalizedValue: { type: "string" },
      },
    },
  },
};

/** Custom AI field types registered with Puck for Yext transform-backed fields. */
export const yextAiFieldTypes = {
  testEntityField: {
    schema: testEntityFieldAiSchema,
    description: testEntityFieldAiDescription,
  },
  testCTA: {
    schema: testCTAFieldAiSchema,
    description: testCTAFieldAiDescription,
  },
  testImage: {
    schema: testImageFieldAiSchema,
    description: testImageFieldAiDescription,
  },
  testRichText: {
    schema: testRichTextFieldAiSchema,
    description: testRichTextFieldAiDescription,
  },
} satisfies AiFieldTypeRegistry;
