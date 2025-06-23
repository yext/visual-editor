import React from "react";
import { AutoField, CustomField } from "@measured/puck";
import {
  ConstantValueModeToggler,
  EntityFieldInput,
  getConstantConfigFromType,
} from "./YextEntityFieldSelector.tsx";
import { getSubfieldsFromType } from "../internal/puck/Subfields.ts";
import "./index.css";
import { pt } from "../utils/i18nPlatform.ts";
import { useEntityFields } from "../hooks/useEntityFields.tsx";
import { getFilteredEntityFields } from "../internal/utils/getFilteredEntityFields.ts";

type RenderProps = Parameters<CustomField<YextStructEntityField>["render"]>[0];

type EntityFieldTypesFilter = {
  type: StructEntityFieldTypes;
};

// StructEntityFieldTypes contains new struct types that we support overriding individual subfields for
export type StructEntityFieldTypes = "type.hero_section" | "type.promo_section";
export const supportedStructEntityFieldTypes = [
  "type.hero_section",
  "type.promo_section",
];

// YextStructEntityField keeps track of which fields we are allowing individual overriding for using constantValueOverride
export type YextStructEntityField<T extends Record<string, any> = any> = {
  field: string;
  constantValue: T;
  constantValueEnabled?: boolean;
  constantValueOverride: {
    [K in keyof T]: boolean;
  };
};

export type StructSelectorProps = {
  label: string;
  filter: EntityFieldTypesFilter;
  disallowTranslation?: boolean;
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
      const entityFields = useEntityFields();
      const filteredEntityFields = getFilteredEntityFields(
        entityFields,
        filter
      );

      const toggleConstantValueEnabled = (constantValueEnabled: boolean) => {
        // Set all overrides when constantValueEnabled changes.
        const updateOverrides = Object.fromEntries(
          Object.keys(value.constantValueOverride).map((key) => [
            key,
            constantValueEnabled,
          ])
        );

        // Automatically select the first field when constantValue is disabled.
        let newField = value.field;
        if (value.constantValueEnabled && !constantValueEnabled) {
          if (filteredEntityFields.length) {
            newField = filteredEntityFields[0].name;
          }
        }

        onChange({
          field: newField,
          constantValue: value.constantValue,
          constantValueEnabled: constantValueEnabled,
          constantValueOverride: updateOverrides,
        });
      };

      return (
        <div className="ve-flex ve-flex-col ve-gap-3">
          <ConstantValueModeToggler
            fieldTypeFilter={[props.filter.type]}
            constantValueEnabled={!!value.constantValueEnabled}
            toggleConstantValueEnabled={toggleConstantValueEnabled}
            label={pt(props.label)}
          />
          {!value.constantValueEnabled && (
            <EntityFieldInput<U>
              onChange={onChange}
              value={value}
              filter={filter}
              hideSelectAFieldOption={true}
            />
          )}
          <SubfieldsInput
            onChange={onChange}
            value={value}
            filter={props.filter}
            disallowTranslation={props.disallowTranslation ?? false}
          />
        </div>
      );
    },
  };
};

type InputProps = {
  filter: EntityFieldTypesFilter;
  onChange: (value: any, uiState?: any) => void;
  value: any;
  disallowTranslation: boolean;
};

// SubfieldsInput renders the subfields such that users can choose to toggle between the
// inferred entityValue (from field) being used or use a constantValue.
const SubfieldsInput = ({
  filter,
  onChange,
  value,
  disallowTranslation,
}: InputProps) => {
  const subfields = getSubfieldsFromType(filter.type);
  if (!subfields) {
    return;
  }

  if (!value.constantValueOverride) {
    return;
  }

  return (
    <div className="ObjectField">
      <div className="ObjectField-fieldset">
        {subfields.map(({ field, type, label }) => {
          const toggleConstantValueEnabled = (
            constantValueEnabled: boolean
          ) => {
            onChange({
              constantValueOverride: {
                ...value?.constantValueOverride,
                [field]: constantValueEnabled,
              },
              field: value?.field,
              constantValue: value?.constantValue,
            });
          };

          const constantConfig = getConstantConfigFromType(
            type,
            false,
            disallowTranslation
          );
          if (!constantConfig) {
            return;
          }

          return (
            <>
              <div className="ve-mt-3 first:ve-mt-0">
                <ConstantValueModeToggler
                  fieldTypeFilter={[type]}
                  constantValueEnabled={value?.constantValueOverride?.[field]}
                  toggleConstantValueEnabled={toggleConstantValueEnabled}
                  label={label}
                  showLocale={type === "type.string" && !disallowTranslation}
                />
              </div>
              {value?.constantValueOverride?.[field] && (
                <div>
                  <AutoField
                    onChange={(newConstantValue, uiState) =>
                      onChange(
                        {
                          field: value?.field,
                          constantValue: {
                            ...value?.constantValue,
                            [field]: newConstantValue,
                          },
                          constantValueEnabled: value?.constantValueEnabled,
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
          );
        })}
      </div>
    </div>
  );
};
