import { TranslatableString } from "../types/types.ts";
import { MsgString, pt } from "../utils/i18nPlatform.ts";
import { AutoField, CustomField, FieldLabel } from "@measured/puck";
import { getDisplayValue } from "../utils/resolveTranslatableString.tsx";
import React from "react";
import { useTranslation } from "react-i18next";

/**
 * Generates a translatable string config
 * @param label optional label. Takes in a value from msg.
 * @param fieldType text or textarea display mode
 */
export function TranslatableStringField<
  T extends TranslatableString | undefined = TranslatableString,
>(label?: MsgString, fieldType?: "text" | "textarea"): CustomField<T> {
  return {
    type: "custom",
    render: ({ onChange, value }) => {
      const { i18n } = useTranslation();
      const locale = i18n.language;
      const resolvedValue = getDisplayValue(value, locale);

      // Ensure resolvedValue is a string for AutoField
      const displayValue =
        typeof resolvedValue === "string" ? resolvedValue : "";

      const autoField = (
        <AutoField
          field={{ type: fieldType ?? "text" }}
          value={displayValue}
          onChange={(val) => {
            return onChange({
              ...(typeof value === "object" && !Array.isArray(value)
                ? value
                : {}),
              [locale]: val,
              hasLocalizedValue: "true",
            } as Record<string, string> as T);
          }}
        />
      );

      if (!label) {
        return <div className={"ve-pt-3"}>{autoField}</div>;
      }

      const fieldLabel = pt(label) + ` (${locale})`;
      // Ensure fieldLabel is a string
      const safeFieldLabel = typeof fieldLabel === "string" ? fieldLabel : "";

      return <FieldLabel label={safeFieldLabel}>{autoField}</FieldLabel>;
    },
  };
}
