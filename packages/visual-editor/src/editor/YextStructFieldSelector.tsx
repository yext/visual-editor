import React from "react";
import { AutoField, CustomField, FieldLabel } from "@measured/puck";
import {
  ConstantValueModeToggler,
  EntityFieldInput,
  getConstantConfigFromType,
} from "./YextEntityFieldSelector.tsx";
import { getSubfieldsFromType } from "../internal/puck/Subfields.ts";
import "./index.css";
import { usePlatformTranslation } from "../utils/i18nPlatform.ts";

type RenderProps = Parameters<CustomField<any>["render"]>[0];

type EntityFieldTypesFilter = {
  type: StructEntityFieldTypes;
};

// StructEntityFieldTypes contains new struct types that we support overriding individual subfields for
export type StructEntityFieldTypes = "type.hero_section" | "type.promo_section";

// YextStructEntityField keeps track of which fields we are allowing individual overriding for using constantValueOverride
export type YextStructEntityField<T extends Record<string, any> = any> = {
  field: string;
  constantValue: T;
  constantValueOverride: {
    [K in keyof T]: boolean;
  };
};

export type StructSelectorProps = {
  label: string;
  filter: EntityFieldTypesFilter;
};

// YextStructFieldSelector will be used for new built-in struct and list field types.
export const YextStructFieldSelector = <U extends Record<string, any>>(
  props: StructSelectorProps
): CustomField<YextStructEntityField<U>> => {
  const filter = {
    types: [props.filter.type],
  };

  return {
    type: "custom",
    label: props.label,
    render: ({ value, onChange }: RenderProps) => {
      return (
        <FieldLabel label={props.label} className="ve-inline-block ve-w-full">
          <EntityFieldInput<U>
            onChange={onChange}
            value={value}
            filter={filter}
          />
          <SubfieldsInput
            onChange={onChange}
            value={value}
            filter={props.filter}
          />
        </FieldLabel>
      );
    },
  };
};

type InputProps = {
  filter: EntityFieldTypesFilter;
  onChange: (value: any, uiState?: any) => void;
  value: any;
};

// SubfieldsInput renders the subfields such that users can choose to toggle between the
// inferred entityValue (from field) being used or use a constantValue.
const SubfieldsInput = ({ filter, onChange, value }: InputProps) => {
  const { t } = usePlatformTranslation();

  const subfields = getSubfieldsFromType(filter.type);
  if (!subfields) {
    return;
  }

  if (!value.constantValueOverride) {
    return;
  }

  return (
    <FieldLabel
      label={t("contentOverrides", "Content Overrides")}
      className="ve-inline-block ve-w-full ve-pt-4"
    >
      {subfields.map(({ field, type, label }, idx: number) => {
        const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
          onChange({
            constantValueOverride: {
              ...value?.constantValueOverride,
              [field]: constantValueEnabled,
            },
            field: value?.field,
            constantValue: value?.constantValue,
          });
        };

        const constantConfig = getConstantConfigFromType(type);
        if (!constantConfig) {
          return;
        }

        return (
          <div key={idx} className="ObjectField">
            <div className="ObjectField-fieldset">
              <>
                <ConstantValueModeToggler
                  fieldTypeFilter={[type]}
                  constantValueEnabled={value?.constantValueOverride?.[field]}
                  toggleConstantValueEnabled={toggleConstantValueEnabled}
                  label={label}
                />
                {value?.constantValueOverride?.[field] && (
                  <div
                    className={
                      constantConfig.type !== "custom" ? "ve-pt-4" : ""
                    }
                  >
                    <AutoField
                      onChange={(newConstantValue, uiState) =>
                        onChange(
                          {
                            field: value?.field,
                            constantValue: {
                              ...value?.constantValue,
                              [field]: newConstantValue,
                            },
                            constantValueOverride: {
                              ...value?.constantValueOverride,
                              [field]: true,
                            },
                          },
                          uiState
                        )
                      }
                      value={value.constantValue?.[field]}
                      field={constantConfig}
                    />
                  </div>
                )}
              </>
            </div>
          </div>
        );
      })}
    </FieldLabel>
  );
};
