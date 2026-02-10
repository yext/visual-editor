import { FieldAiParams } from "@puckeditor/plugin-ai";
import { translatableStringAiSchema } from "./baseTypes.ts";
import { TYPE_TO_CONSTANT_CONFIG } from "../../../editor/YextEntityFieldSelector.tsx";

export const entityListFieldsAiSchema: Record<
  keyof typeof TYPE_TO_CONSTANT_CONFIG,
  FieldAiParams
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
