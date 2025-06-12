import { CustomField, TextField } from "@measured/puck";
import { TranslatableRTF2, TranslatableString } from "../../../types/types.ts";
import { translatableStringConfig } from "../../../puck/config/translatableStringConfig.tsx";
import { translatableRTF2Config } from "../../../puck/config/translatableRTF2Config.tsx";

export const TEXT_CONSTANT_CONFIG: TextField = {
  type: "text",
  label: "",
};

export const TRANSLATABLE_STRING_CONSTANT_CONFIG: CustomField<TranslatableString> =
  translatableStringConfig(undefined, "text");

export const TRANSLATABLE_RTF2_CONSTANT_CONFIG: CustomField<TranslatableRTF2> =
  translatableRTF2Config(undefined, "text");
