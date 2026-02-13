import { FieldAiParams } from "@puckeditor/plugin-ai";
import { TYPE_TO_CONSTANT_CONFIG } from "../../../editor/YextEntityFieldSelector.tsx";
import {
  translatableAssetImageAiSchema,
  translatableRtfAiSchema,
  translatableStringAiSchema,
} from "./baseTypes.ts";
import { translatableCtaAiSchema } from "./cta.ts";

export const entityFieldsAiSchema: Record<
  keyof typeof TYPE_TO_CONSTANT_CONFIG,
  FieldAiParams
> = {
  "type.string": {
    instructions: `Put any data relevant to the business in the constant value for en.
        If you need the business name, use [[name]] to reference it.
        `,
    schema: {
      type: "object",
      properties: {
        constantValueEnabled: { type: "boolean" },
        field: { type: "string" },
        constantValue: translatableStringAiSchema,
      },
    },
  },
  "type.image": {
    schema: {
      type: "object",
      properties: {
        constantValueEnabled: { type: "boolean" },
        field: { type: "string" },
        constantValue: translatableAssetImageAiSchema,
      },
    },
  },
  "type.rich_text_v2": {
    instructions: `Use this decision rule:
        - If the entire rich text should come directly from one entity field, set constantValueEnabled to false and set field.
        - If you need any static text, templating, or mixed content with entity fields, set constantValueEnabled to true and use constantValue.
        - Embedded references like [[fieldName]] must be placed in constantValue and require constantValueEnabled: true.
        Use the TranslatableRichText shape for constantValue:
        { hasLocalizedValue: "true", en: { html: "<p>...</p>", json: "{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"...","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}" } }.
        Example mixed content:
        { constantValueEnabled: true, field: "c_exampleRTF", constantValue: { hasLocalizedValue: "true", en: { html: "<p>Static string [[c_exampleRTF]]</p>", json: "{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Static string [[c_exampleRTF]]","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}" } } }
        `,
    schema: {
      type: "object",
      properties: {
        constantValueEnabled: { type: "boolean" },
        field: { type: "string" },
        constantValue: translatableRtfAiSchema,
      },
    },
  },
  "type.cta": {
    schema: {
      type: "object",
      properties: {
        constantValueEnabled: { type: "boolean" },
        field: { type: "string" },
        constantValue: translatableCtaAiSchema,
      },
    },
  },
  "type.hours": {
    schema: {
      type: "object",
      properties: {
        constantValueEnabled: { type: "boolean", enum: [false] },
        field: { type: "string", enum: ["hours"] },
      },
    },
  },
  "type.address": {
    schema: {
      type: "object",
      properties: {
        constantValueEnabled: { type: "boolean", enum: [false] },
        field: { type: "string", enum: ["address"] },
      },
    },
  },
  "type.phone": {
    schema: {
      type: "object",
      properties: {
        constantValueEnabled: { type: "boolean" },
        field: { type: "string", enum: ["mainPhone"] },
        constantValue: {
          type: "string",
          pattern: "^\\+\\d{10,15}$",
        },
      },
    },
  },
  "type.promo_section": {
    schema: {
      type: "object",
      properties: {
        constantValueEnabled: { type: "boolean" },
        field: { type: "string" },
        constantValue: {
          type: "object",
          properties: {},
        },
      },
    },
  },
};
