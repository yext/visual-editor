import { FieldAiParams } from "@puckeditor/plugin-ai";

export const translatableStringAiSchema: Exclude<
  FieldAiParams["schema"],
  undefined
> = {
  type: "object",
  properties: {
    hasLocalizedValue: { type: "string", enum: ["true"] },
    en: {
      type: "string",
    },
  },
};

export const translatableRtfAiSchema: Exclude<
  FieldAiParams["schema"],
  undefined
> = {
  type: "object",
  properties: {
    hasLocalizedValue: { type: "string", enum: ["true"] },
    en: {
      type: "object",
      properties: {
        json: { type: "string" },
        html: { type: "string" },
      },
    },
  },
};

export const translatableAssetImageAiSchema: Exclude<
  FieldAiParams["schema"],
  undefined
> = {
  type: "object",
  properties: {
    hasLocalizedValue: { type: "string", enum: ["true"] },
    en: {
      type: "object",
      properties: {
        url: { type: "string" },
        altText: { type: "string" },
        link: { type: "string" },
        height: { type: "number" },
        width: { type: "number" },
      },
    },
  },
};
