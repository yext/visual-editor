import { type createAiPlugin } from "@puckeditor/plugin-ai";
import { getFieldLabel } from "../../fields/getFieldLabel.ts";

export const testEntityFieldAiDescription =
  "A Yext text binding for one complete prop.";

export const testCTAFieldAiDescription =
  "A Yext CTA binding for one complete CTA prop.";

export const testImageFieldAiDescription =
  "Renders one complete Yext image component. Attach it to an empty non-void HTML element such as a div. Use only the direct image URL, dimensions, and alternate text allowed by the schema; do not add assetImage metadata. Never attach it to an img element or add hard-coded src, alt, width, or height attributes.";

export const testRichTextFieldAiDescription =
  "A Yext rich text binding for one complete body-copy prop.";

export const testEntityFieldAiSchema = {
  type: "object",
  required: ["field", "constantValueEnabled", "constantValue"],
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean", enum: [true] },
    constantValue: { type: "string" },
  },
};

export const testCTAFieldAiSchema = {
  type: "object",
  required: ["field", "constantValueEnabled", "selectedType", "constantValue"],
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean", enum: [true] },
    selectedType: { type: "string", enum: ["textAndLink"] },
    constantValue: {
      type: "object",
      required: ["ctaType", "label", "link", "linkType"],
      properties: {
        ctaType: { type: "string", enum: ["textAndLink"] },
        label: {
          type: "object",
          required: ["en", "hasLocalizedValue"],
          properties: {
            en: { type: "string" },
            hasLocalizedValue: { type: "string", enum: ["true"] },
          },
        },
        link: { type: "string" },
        linkType: { type: "string", enum: ["URL"] },
      },
    },
  },
};

export const testImageFieldAiSchema = {
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
};

export const testRichTextFieldAiSchema = {
  type: "object",
  required: ["field", "constantValueEnabled", "constantValue"],
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean", enum: [true] },
    constantValue: {
      type: "object",
      required: ["en", "hasLocalizedValue"],
      properties: {
        en: {
          type: "object",
          required: ["html", "json"],
          properties: {
            html: { type: "string" },
            json: { type: "string" },
          },
        },
        hasLocalizedValue: { type: "string", enum: ["true"] },
      },
    },
  },
};

/** Custom AI field types registered with Puck for Yext transform-backed fields. */
export const yextAiFieldTypes = {
  testEntityField: {
    schema: testEntityFieldAiSchema,
    description: testEntityFieldAiDescription,
    defaultValue: ({ fieldName }) => ({
      field: "",
      constantValue: getFieldLabel(fieldName),
      constantValueEnabled: true,
    }),
  },
  testCTA: {
    schema: testCTAFieldAiSchema,
    description: testCTAFieldAiDescription,
    defaultValue: ({ fieldName }) => ({
      field: "",
      constantValueEnabled: true,
      selectedType: "textAndLink",
      constantValue: {
        ctaType: "textAndLink",
        label: {
          en: getFieldLabel(fieldName),
          hasLocalizedValue: "true",
        },
        link: "/learn-more",
        linkType: "URL",
      },
    }),
  },
  testImage: {
    schema: testImageFieldAiSchema,
    description: testImageFieldAiDescription,
    defaultValue: ({ fieldName }) => ({
      field: "",
      constantValueEnabled: true,
      constantValue: {
        url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
        alternateText: getFieldLabel(fieldName),
      },
      aspectRatio: 1.78,
      imageFillType: "fill",
      width: 640,
    }),
  },
  testRichText: {
    schema: testRichTextFieldAiSchema,
    description: testRichTextFieldAiDescription,
    defaultValue: ({ fieldName }) => ({
      field: "",
      constantValue: {
        en: {
          json: "",
          html: `<p>${getFieldLabel(fieldName)}</p>`,
        },
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    }),
  },
} satisfies NonNullable<Parameters<typeof createAiPlugin>[0]>["fieldTypes"];
