import React from "react";
import type { BaseField, FieldProps } from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import { msg, type MsgString } from "../utils/i18n/platform.ts";
import type { YextFieldDefinition } from "./fields.ts";
import { YextAutoField } from "./YextAutoField.tsx";

type CustomValue =
  string | number | boolean | null | Record<string, unknown> | unknown[];

export type OptionalFieldContext = { locale: string };

/** Wraps a field without changing its value shape. Undefined selects Automatic. */
export interface OptionalField<Value = CustomValue> extends BaseField {
  type: "optional";
  label?: string | MsgString;
  automaticLabel?: string | MsgString;
  customLabel?: string | MsgString;
  field: YextFieldDefinition;
  /** Evaluated only when Custom is first selected without a remembered value. */
  defaultCustomValue: Value | ((context: OptionalFieldContext) => Value);
}

export const OptionalFieldOverride = ({
  field,
  value,
  onChange,
  readOnly,
}: FieldProps<OptionalField, CustomValue | undefined>) => {
  const { i18n } = useTranslation();
  const [lastCustomValue, setLastCustomValue] = React.useState(() => value);
  const handleModeChange = (mode: "automatic" | "custom") => {
    if (readOnly) return;
    if (mode === "custom") {
      onChange(
        value !== undefined
          ? value
          : lastCustomValue !== undefined
            ? lastCustomValue
            : typeof field.defaultCustomValue === "function"
              ? field.defaultCustomValue({ locale: i18n.language })
              : field.defaultCustomValue
      );
    } else {
      if (value !== undefined) setLastCustomValue(() => value);
      onChange(undefined);
    }
  };
  return (
    <fieldset
      disabled={readOnly}
      className="ve-flex ve-min-w-0 ve-flex-col ve-gap-3"
    >
      <YextAutoField
        field={{
          type: "basicSelector",
          label: field.label,
          options: [
            {
              label:
                field.automaticLabel ??
                msg("fields.options.automatic", "Automatic"),
              value: "automatic",
            },
            {
              label: field.customLabel ?? msg("custom", "Custom"),
              value: "custom",
            },
          ],
        }}
        value={value !== undefined ? "custom" : "automatic"}
        onChange={handleModeChange}
        readOnly={readOnly}
      />
      {value !== undefined && (
        <YextAutoField
          field={field.field}
          value={value}
          onChange={onChange}
          readOnly={readOnly}
        />
      )}
    </fieldset>
  );
};
