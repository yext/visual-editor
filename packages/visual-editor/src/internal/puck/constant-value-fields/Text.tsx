import { CustomField, TextField } from "@measured/puck";
import {
  TranslatableRichText,
  TranslatableString,
} from "../../../types/types.ts";
import { TranslatableStringField } from "../../../editor/TranslatableStringField.tsx";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";

export const TEXT_CONSTANT_CONFIG: TextField = {
  type: "text",
  label: "",
};

export const TRANSLATABLE_STRING_CONSTANT_CONFIG: CustomField<TranslatableString> =
  TranslatableStringField(undefined, "text");

export const TRANSLATABLE_RICH_TEXT_CONSTANT_CONFIG: CustomField<TranslatableRichText> =
  TranslatableRichTextField(undefined, "text");
