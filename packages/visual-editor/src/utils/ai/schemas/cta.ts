import { BaseField } from "@puckeditor/core";
import { translatableStringAiSchema } from "./baseTypes.ts";

export const translatableCtaAiSchema: Exclude<
  Exclude<BaseField["ai"], undefined>["schema"],
  undefined
> = {
  type: "object",
  properties: {
    ctaType: {
      type: "string",
      enum: ["textAndLink", "getDirections", "presetImage"],
    },
    label: translatableStringAiSchema,
    link: translatableStringAiSchema,
    openInNewTab: { type: "boolean" },
  },
};
