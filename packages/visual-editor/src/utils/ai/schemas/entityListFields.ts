import { BaseField } from "@puckeditor/core";
import { translatableStringAiSchema } from "./baseTypes.ts";
import { TYPE_TO_CONSTANT_CONFIG } from "../../../editor/YextEntityFieldSelector.tsx";

export const entityListFieldsAiSchema: Record<
  keyof typeof TYPE_TO_CONSTANT_CONFIG,
  BaseField["ai"]
> = {
  "type.string": {
    schema: {
      type: "object",
      properties: {
        constantValueEnabled: { type: "boolean" },
        field: { type: "string" },
        constantValue: {
          type: "array",
          items: translatableStringAiSchema,
        },
      },
    },
  },
};
