import { BaseField } from "@puckeditor/core";
import { TYPE_TO_CONSTANT_CONFIG } from "../../../editor/YextEntityFieldSelector.tsx";
import {
  translatableAssetImageAiSchema,
  translatableRtfAiSchema,
  translatableStringAiSchema,
} from "./baseTypes.ts";
import { translatableCtaAiSchema } from "./cta.ts";

export const entityFieldsAiSchema: Record<
  keyof typeof TYPE_TO_CONSTANT_CONFIG,
  BaseField["ai"]
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
    instructions:
      "Put any data relevant to the business in the constant value for en.",
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
