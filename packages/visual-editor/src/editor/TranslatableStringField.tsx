import { TranslatableString } from "../types/types.ts";
import { MsgString, pt } from "../utils/i18n/platform.ts";
import { CustomField, FieldLabel } from "@measured/puck";
import { resolveComponentData } from "../utils/resolveComponentData.tsx";
import React from "react";
import { useTranslation } from "react-i18next";
import { RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import { EmbeddedFieldStringInput } from "./EmbeddedFieldStringInput.tsx";
import { Button } from "../internal/puck/ui/button.tsx";

/**
 * Generates a translatable string config
 * @param label optional label. Takes in a value from msg.
 * @param filter optional filter for the entity fields that can be embedded.
 * @param allowApplyAll optional enables the "Apply to All" button
 */
export function TranslatableStringField<
  T extends TranslatableString | undefined = TranslatableString,
>(
  label?: MsgString,
  filter?: RenderEntityFieldFilter<any>,
  allowApplyAll?: boolean
): CustomField<T> {
  return {
    type: "custom",
    render: ({ onChange, value }) => {
      const { t, i18n } = useTranslation();
      const locale = i18n.language;
      const resolvedValue = value && resolveComponentData(value, locale);

      const fieldEditor = (
        <EmbeddedFieldStringInput
          value={resolvedValue}
          onChange={(val) => {
            return onChange({
              ...(typeof value === "object" && !Array.isArray(value)
                ? value
                : {}),
              [locale]: val,
              hasLocalizedValue: "true",
            } as Record<string, string> as T);
          }}
          filter={filter ?? { types: ["type.string"] }}
        />
      );

      const applyAllButton = allowApplyAll ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            onChange(resolvedValue as T);
          }}
        >
          {t("applyAll", "Apply to all")}
        </Button>
      ) : null;

      return (
        <div className="ve-pt-3">
          <div className="flex items-baseline justify-between mb-1">
            {label && <FieldLabel label={`${pt(label)} (${locale})`} />}
            {applyAllButton}
          </div>
          {fieldEditor}
        </div>
      );
    },
  };
}
