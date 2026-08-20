import { type AiFieldTypeRegistry } from "@puckeditor/cloud-client";

export const testEntityFieldAiDescription =
  'A Yext text binding for one complete text prop. Use `constantValueEnabled: false` with `field` set to a Yext document path for mapped content. Use `constantValueEnabled: true` with `constantValue` for fixed copy. Constant values may include embedded Yext fields like `[[name]]`. Mapped example: { "field": "name", "constantValue": "", "constantValueEnabled": false }. Constant example: { "field": "", "constantValue": "Welcome to [[name]]", "constantValueEnabled": true }.';

export const testCTAFieldAiDescription =
  'A Yext CTA binding for one complete CTA prop. Use `constantValueEnabled: false` with `field` set to a CTA-capable Yext field path for mapped CTAs. Use `constantValueEnabled: true` with `constantValue` for fixed CTAs. Include `selectedType` and, for constant CTAs, provide CTA data such as `label`, `link`, `linkType`, and `ctaType` on the same field object. Do not split one CTA across nested sub-properties like `cta.label` and `cta.link`. Do not leave this field as an HTML annotation without a full prop value object. Labels and links may include embedded Yext fields like `[[name]]`. Example: { "field": "", "constantValueEnabled": true, "selectedType": "textAndLink", "constantValue": { "ctaType": "textAndLink", "label": "Book now", "link": "/book", "linkType": "URL" } }.';

export const testImageFieldAiDescription =
  'A Yext image binding for one complete image prop. Use `constantValueEnabled: false` with `field` set to a Yext image field path for mapped images. Use `constantValueEnabled: true` with `constantValue` for fixed image data. Constant image data should include `url` and may include `width`, `height`, `alternateText`, and asset metadata on the same field object. Image presentation may also be authored on the same field object with `aspectRatio`, `imageFillType`, and `width`. Do not split one image across nested sub-properties like `image.src` and `image.alt`. Do not leave this field as an HTML annotation without a full prop value object. Alternate text may include embedded Yext fields like `[[name]]`. Example: { "field": "", "constantValueEnabled": true, "constantValue": { "url": "https://example.com/image.jpg", "alternateText": "Storefront" }, "aspectRatio": 1.78, "imageFillType": "fill", "width": 640 }.';

export const testRichTextFieldAiDescription =
  'A Yext rich text binding for one complete body-copy prop. Use `constantValueEnabled: false` with `field` set to a Yext rich text field path for mapped content. Use `constantValueEnabled: true` with `constantValue` for fixed rich text content, either as a string or as a rich text object with `html` and optional `json`. Constant values may include embedded Yext fields like `[[name]]`. Mapped example: { "field": "c_description", "constantValue": "", "constantValueEnabled": false }. Constant example: { "field": "", "constantValue": "<p>Visit [[name]] today.</p>", "constantValueEnabled": true }.';

export const testEntityFieldAiSchema = {
  type: "object",
  properties: {
    field: { type: "string" },
    constantValueEnabled: { type: "boolean" },
    constantValue: {
      type: "object",
      properties: {},
    },
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
      properties: {},
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
        alternateText: {
          anyOf: [{ type: "string" }, { type: "object", properties: {} }],
        },
        assetImage: { type: "object", properties: {} },
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
      anyOf: [
        { type: "string" },
        {
          type: "object",
          properties: {
            html: { type: "string" },
            json: { type: "string" },
          },
        },
      ],
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
