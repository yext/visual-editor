import { TranslatableRTF2 } from "../types/types.ts";
import { useDocument } from "../hooks/useDocument.tsx";
import { usePlatformTranslation } from "../utils/i18nPlatform.ts";
import { Translation } from "../internal/types/translation.ts";
import { AutoField, CustomField, FieldLabel } from "@measured/puck";
import { getDisplayValue } from "../utils/resolveTranslatableString.tsx";
import React from "react";

/**
 * Generates a translatable RTF2 config
 * @param label optional label. Takes in translation key and TOptions from react-i18next
 * @param fieldType text or textarea display mode
 */
export function TranslatableRichTextField<
  T extends TranslatableRTF2 | undefined = TranslatableRTF2,
>(label?: Translation, fieldType?: "text" | "textarea"): CustomField<T> {
  // TODO - implement RTF2 editor here
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
        return <div className={"ve-pt-3"}>{autoField}</div>;
      }

      return (
        <FieldLabel label={t(label.key, label.options) + ` (${locale})`}>
          {autoField}
        </FieldLabel>
      );
    },
  };
}
