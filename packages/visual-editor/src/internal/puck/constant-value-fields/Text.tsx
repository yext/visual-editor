import { AutoField, CustomField, FieldLabel, TextField } from "@measured/puck";
import React from "react";
import { TranslatableRTF2, TranslatableString } from "../../../types/types.ts";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { getDisplayValue } from "../../../utils/resolveTranslatableString.tsx";
import { usePlatformTranslation } from "@yext/visual-editor";
import { Translation } from "../../types/translation.ts";

export const TEXT_CONSTANT_CONFIG: TextField = {
  type: "text",
  label: "",
};

export const TRANSLATABLE_STRING_CONSTANT_CONFIG: CustomField<TranslatableString> =
  generateTranslatableConstantConfig<TranslatableString>(undefined, "text");

export const TRANSLATABLE_RTF2_CONSTANT_CONFIG: CustomField<TranslatableRTF2> =
  generateTranslatableConstantConfig<TranslatableRTF2>(undefined, "text");

export function generateTranslatableConstantConfig<
  T extends TranslatableRTF2 | undefined,
>(label?: Translation, fieldType?: "text" | "textarea"): CustomField<T> {
  return {
    type: "custom",
    render: ({ onChange, value }) => {
      const document: any = useDocument();
      const locale = document?.locale ?? "en";
      const { t } = usePlatformTranslation();
      const autoField = (
        <AutoField
          field={{ type: fieldType ?? "text" }}
          value={getDisplayValue(value, locale)}
          onChange={(val) =>
            onChange({
              ...(typeof value === "object" && !Array.isArray(value)
                ? value
                : {}),
              [locale]: val,
            } as T)
          }
        />
      );

      if (!label) {
        return autoField;
      }

      return (
        <FieldLabel label={t(label.key, label.options)}>{autoField}</FieldLabel>
      );
    },
  };
}
