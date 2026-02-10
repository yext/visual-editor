import { FieldAiParams } from "@puckeditor/plugin-ai";
import { translatableStringAiSchema } from "./baseTypes.ts";

export const translatableCtaAiSchema: Exclude<
  FieldAiParams["schema"],
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
