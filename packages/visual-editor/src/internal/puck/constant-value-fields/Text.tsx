import { CustomField, TextField } from "@puckeditor/core";
import { type TranslatableStringField } from "../../../fields/TranslatableStringField.tsx";
import { TranslatableRichText } from "../../../types/types.ts";
import { TranslatableRichTextField } from "../../../editor/TranslatableRichTextField.tsx";

export const TEXT_CONSTANT_CONFIG: TextField = {
  type: "text",
  label: "",
};

export const TRANSLATABLE_STRING_CONSTANT_CONFIG: TranslatableStringField = {
  type: "translatableString",
  filter: { types: ["type.string"] },
};

export const TRANSLATABLE_RICH_TEXT_CONSTANT_CONFIG: CustomField<TranslatableRichText> =
  TranslatableRichTextField();
