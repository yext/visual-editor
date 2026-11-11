import React from "react";
import {
  type BaseField,
  type FieldProps,
  type NumberField,
} from "@puckeditor/core";
import { useTranslation } from "react-i18next";
import { getPreferredDistanceUnit } from "../utils/i18n/distance.ts";
import { msg, pt, type MsgString } from "../utils/i18n/platform.ts";
import { YextAutoField } from "./YextAutoField.tsx";

/** Authored distance in its selected unit; undefined uses the consumer's automatic behavior. */
export type OptionalDistanceValue =
  | {
      value?: number;
      unit: "mile" | "kilometer";
    }
  | undefined;

export type OptionalDistanceField = BaseField &
  Pick<NumberField, "min" | "max" | "step"> & {
    type: "optionalDistance";
    label?: string | MsgString;
    /** Initial Custom distance. The initial unit follows the page locale. */
    defaultCustomValue: number;
  };

export const OptionalDistanceFieldOverride = ({
  field,
  value,
  onChange,
  readOnly,
}: FieldProps<OptionalDistanceField, OptionalDistanceValue>) => {
  const { i18n } = useTranslation();
  const [lastCustomDistance, setLastCustomDistance] = React.useState(value);

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
              label: msg("fields.options.automatic", "Automatic"),
              value: "automatic",
            },
            { label: msg("custom", "Custom"), value: "custom" },
          ],
        }}
        value={value ? "custom" : "automatic"}
        onChange={(mode) => {
          if (mode === "custom") {
            onChange(
              value ??
                lastCustomDistance ?? {
                  value: field.defaultCustomValue,
                  unit: getPreferredDistanceUnit(i18n.language),
                }
            );
          } else {
            if (value) setLastCustomDistance(value);
            onChange(undefined);
          }
        }}
      />
      {value && (
        <>
          <YextAutoField
            field={{
              type: "number",
              label: msg("fields.radius", "Radius"),
              min: field.min,
              max: field.max,
              step: field.step,
            }}
            readOnly={readOnly}
            value={value.value}
            onChange={(distance) => onChange({ ...value, value: distance })}
          />
          <YextAutoField
            field={{
              type: "basicSelector",
              label: msg("fields.distanceUnit", "Distance Unit"),
              options: [
                { label: pt("mile", { count: 2 }), value: "mile" },
                { label: pt("kilometer", { count: 2 }), value: "kilometer" },
              ],
            }}
            value={value.unit}
            onChange={(unit) => onChange({ ...value, unit })}
          />
        </>
      )}
    </fieldset>
  );
};
