import React from "react";
import { BaseField, FieldLabel, type FieldProps } from "@puckeditor/core";
import { type YextFieldDefinition } from "../editor/YextField.tsx";
import { pt, type MsgString } from "../utils/i18n/platform.ts";
import {
  ConstantValueModeToggler,
  EntityFieldInput,
} from "./EntityFieldSelectorField.tsx";
import { YextAutoField } from "./YextAutoField.tsx";
import { type MappedSourceFieldFilter } from "../utils/cardSlots/mappedSource.ts";
import { type YextFieldMap } from "./fields.ts";

export type ItemSourceValue<TItem extends Record<string, unknown>> = {
  field: string;
  constantValueEnabled?: boolean;
  constantValue: TItem[];
};

export type ItemSourceField<
  T extends Record<string, any> = Record<string, any>,
  TItem extends Record<string, unknown> = Record<string, unknown>,
> = BaseField & {
  type: "itemSource";
  label?: string | MsgString;
  visible?: boolean;
  filter: MappedSourceFieldFilter<T>;
  itemFields: YextFieldMap<TItem>;
  defaultItemValue: TItem;
};

type ItemSourceFieldProps = FieldProps<ItemSourceField<any, any>>;

export const ItemSourceFieldOverride = ({
  field,
  value,
  onChange,
}: ItemSourceFieldProps) => {
  const translatedLabel = field.label ? pt(field.label) : "";
  const constantValueEnabled = !!value?.constantValueEnabled;
  const itemListField = React.useMemo<YextFieldDefinition<any[]>>(
    () => ({
      type: "array",
      label: "",
      arrayFields: field.itemFields,
      defaultItemProps: field.defaultItemValue,
      getItemSummary: (_, index) =>
        pt("item", "Item") + " " + String((index ?? 0) + 1),
    }),
    [field.defaultItemValue, field.itemFields]
  );

  return (
    <>
      <ConstantValueModeToggler
        fieldTypeFilter={["type.string"]}
        constantValueEnabled={constantValueEnabled}
        toggleConstantValueEnabled={(nextConstantValueEnabled) =>
          onChange({
            ...(value as ItemSourceValue<Record<string, unknown>>),
            constantValueEnabled: nextConstantValueEnabled,
          })
        }
        label={translatedLabel}
      />
      {constantValueEnabled ? (
        <div className="ve-pt-3">
          <YextAutoField
            field={itemListField}
            onChange={(constantValue) =>
              onChange({
                ...(value as ItemSourceValue<Record<string, unknown>>),
                constantValue,
              })
            }
            value={value?.constantValue ?? []}
          />
        </div>
      ) : (
        <>
          <EntityFieldInput
            className="ve-pt-3"
            onChange={onChange}
            value={value}
            filter={field.filter}
          />
          {!value?.field && (
            <FieldLabel
              label={pt(
                "itemSourceFieldHelper",
                "Select a linked list field or switch to manual items."
              )}
              className="ve-pt-2"
            />
          )}
        </>
      )}
    </>
  );
};
