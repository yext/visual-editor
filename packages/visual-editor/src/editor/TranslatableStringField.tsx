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
        return <div className={"ve-pt-3"}>{autoField}</div>;
      }

      return (
        <FieldLabel label={pt(label) + ` (${locale})`}>{autoField}</FieldLabel>
      );
    },
  };
}
