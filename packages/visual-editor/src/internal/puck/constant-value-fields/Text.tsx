import { CustomField, TextField } from "@measured/puck";
import { TranslatableRTF2, TranslatableString } from "../../../types/types.ts";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRTF2Field } from "../../../editor/TranslatableRTF2Field.tsx";

export const TEXT_CONSTANT_CONFIG: TextField = {
  type: "text",
  label: "",
};

export const TRANSLATABLE_STRING_CONSTANT_CONFIG: CustomField<TranslatableString> =
  TranslatableStringField(undefined, "text");

export const TRANSLATABLE_RTF2_CONSTANT_CONFIG: CustomField<TranslatableRTF2> =
  TranslatableRTF2Field(undefined, "text");
