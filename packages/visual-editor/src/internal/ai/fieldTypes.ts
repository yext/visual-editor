import { type AiFieldTypeRegistry } from "@puckeditor/cloud-client";

export const testEntityFieldAiDescription =
  'A Yext text binding for one complete prop. Use it only as a direct empty HTML annotation: data-puck-field-title=\'{ "type": "testEntityField" }\'. Put its label, filter, and output in the component fields object. Put its authored value in defaultProps. Mapped example: { "field": "name", "constantValue": "", "constantValueEnabled": false }. Constant example: { "field": "", "constantValue": "Welcome to [[name]]", "constantValueEnabled": true }.';

export const testCTAFieldAiDescription =
  'A Yext CTA binding for one complete CTA prop. Use it only as a direct empty HTML annotation: data-puck-field-primarycta=\'{ "type": "testCTA" }\'. Put its label in fields and its complete authored value in defaultProps. Do not split a CTA into nested label/link props. Constant example: { "field": "", "constantValueEnabled": true, "selectedType": "textAndLink", "constantValue": { "ctaType": "textAndLink", "label": { "en": "Book Now", "hasLocalizedValue": "true" }, "link": "/book", "linkType": "URL" } }.';

export const testImageFieldAiDescription =
  'A Yext image binding for one complete image prop. Use it only as a direct empty HTML annotation: data-puck-field-image=\'{ "type": "testImage" }\'. Put its label and filter in fields and its complete image value in defaultProps. Do not split an image into nested src/alt props. Constant example: { "field": "", "constantValueEnabled": true, "constantValue": { "url": "https://example.com/image.jpg", "alternateText": "Storefront" }, "aspectRatio": 1.78, "imageFillType": "fill", "width": 640 }.';

export const testRichTextFieldAiDescription =
  'A Yext rich text binding for one complete body-copy prop. Use it only as a direct empty HTML annotation: data-puck-field-description=\'{ "type": "testRichText" }\'. Put its label and filter in fields and its authored value in defaultProps. Mapped example: { "field": "c_description", "constantValue": "", "constantValueEnabled": false }. Localized constant example: { "field": "", "constantValue": { "en": { "json": "", "html": "<p>Visit <b>[[name]]</b> today.</p>" }, "hasLocalizedValue": "true" }, "constantValueEnabled": true }.';

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
