import React from "react";
import { BaseField, type FieldProps } from "@puckeditor/core";
import {
  ConstantValueInput,
  ConstantValueModeToggler,
  EntityFieldInput,
} from "../editor/YextEntityFieldSelector.tsx";
import { type YextEntityField } from "../editor/yextEntityFieldUtils.ts";
import {
  ctaTypeOptions,
  type CTASelectionType,
} from "../internal/utils/ctaFieldUtils.ts";
import { type RenderEntityFieldFilter } from "../internal/utils/getFilteredEntityFields.ts";
import { type EnhancedTranslatableCTA } from "../types/types.ts";
import { pt, type MsgString } from "../utils/i18n/platform.ts";
import { YextAutoField } from "./YextAutoField.tsx";

export type YextCTAField = YextEntityField<EnhancedTranslatableCTA> & {
  selectedType?: CTASelectionType;
};

export type CTASelectorField = BaseField & {
  type: "ctaSelector";
  label?: string | MsgString;
  visible?: boolean;
  disableConstantValueToggle?: boolean;
};

type CTASelectorFieldProps = FieldProps<CTASelectorField>;

const CTA_FIELD_FILTER: RenderEntityFieldFilter<Record<string, any>> = {
  types: ["type.cta"],
};

export const CTASelectorFieldOverride = ({
  field,
  value,
  onChange,
}: CTASelectorFieldProps) => {
  const selectedType: CTASelectionType = value?.selectedType ?? "textAndLink";
  const showEntityFieldSelector = selectedType !== "getDirections";
  const translatedLabel = field.label
    ? pt(field.label)
    : pt("fields.cta", "CTA");

  const typeSelectorField = React.useMemo(
    () => ({
      type: "basicSelector" as const,
      label: pt("fields.ctaType", "CTA Type"),
      options: ctaTypeOptions(),
      translateOptions: false,
    }),
    []
  );

  return (
    <>
      <ConstantValueModeToggler
        fieldTypeFilter={["type.cta"]}
        constantValueEnabled={value?.constantValueEnabled}
        toggleConstantValueEnabled={(constantValueEnabled) =>
          onChange({
            ...value,
            constantValueEnabled,
          })
        }
        disableConstantValue={field.disableConstantValueToggle}
        label={translatedLabel}
      />
      {value?.constantValueEnabled ? (
        <ConstantValueInput
          filter={CTA_FIELD_FILTER}
          onChange={onChange}
          value={value}
        />
      ) : (
        <>
          <div className="ve-pt-3">
            <YextAutoField
              field={typeSelectorField}
              onChange={(nextSelectedType, uiState) =>
                onChange(
                  {
                    ...value,
                    field: "",
                    selectedType: nextSelectedType,
                  },
                  uiState
                )
              }
              value={selectedType}
            />
          </div>
          {showEntityFieldSelector && (
            <EntityFieldInput
              className="ve-pt-3"
              filter={CTA_FIELD_FILTER}
              label={pt("fields.ctaField", "CTA Field")}
              onChange={onChange}
              value={value}
            />
          )}
        </>
      )}
    </>
  );
};
