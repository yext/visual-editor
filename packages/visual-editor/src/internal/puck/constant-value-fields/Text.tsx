import { CustomField, TextField } from "@measured/puck";
import { TranslatableRTF2, TranslatableString } from "../../../types/types.ts";
import { generateTranslatableConfig } from "../../../utils/generateTranslatableConfig.tsx";

export const TEXT_CONSTANT_CONFIG: TextField = {
  type: "text",
  label: "",
};

export const TRANSLATABLE_STRING_CONSTANT_CONFIG: CustomField<TranslatableString> =
  generateTranslatableConfig<TranslatableString>(undefined, "text");

export const TRANSLATABLE_RTF2_CONSTANT_CONFIG: CustomField<TranslatableRTF2> =
  generateTranslatableConfig<TranslatableRTF2>(undefined, "text");
