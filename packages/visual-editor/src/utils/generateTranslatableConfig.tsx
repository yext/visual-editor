import {
  TranslatableRTF2,
  useDocument,
  usePlatformTranslation,
} from "@yext/visual-editor";
import { Translation } from "../internal/types/translation.ts";
import { AutoField, CustomField, FieldLabel } from "@measured/puck";
import { getDisplayValue } from "./resolveTranslatableString.tsx";
import React from "react";

export function generateTranslatableConfig<
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
