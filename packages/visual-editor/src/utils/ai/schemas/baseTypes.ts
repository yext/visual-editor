import { BaseField } from "@puckeditor/core";

export const translatableStringAiSchema: Exclude<
  Exclude<BaseField["ai"], undefined>["schema"],
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
  Exclude<BaseField["ai"], undefined>["schema"],
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
  Exclude<BaseField["ai"], undefined>["schema"],
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
      },
    },
  },
};
