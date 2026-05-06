import React from "react";
import {
  BaseField,
  FieldLabel,
  createUsePuck,
  setDeep,
  type FieldProps,
  useGetPuck,
} from "@puckeditor/core";
import { pt, type MsgString } from "../utils/i18n/platform.ts";
import {
  ConstantValueModeToggler,
  EntityFieldInput,
} from "./EntityFieldSelectorField.tsx";
import { YextAutoField } from "./YextAutoField.tsx";
import { type MappedSourceFieldFilter } from "../utils/cardSlots/mappedSource.ts";
import { type YextFieldDefinition, type YextFieldMap } from "./fields.ts";

const usePuck = createUsePuck();

/**
 * Shared value shape for repeated item sources that can either resolve from a
 * linked list field or fall back to manually authored items.
 */
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
  itemSourcePath?: string;
  itemMappingsPath?: string;
};

type ItemSourceFieldProps = FieldProps<ItemSourceField<any, any>>;

/**
 * Reads a dotted path from an unknown value tree.
 */
const getPathValue = (value: unknown, path: string): unknown => {
  if (!value || typeof value !== "object" || !path) {
    return undefined;
  }

  return path.split(".").reduce<unknown>((currentValue, segment) => {
    if (!currentValue || typeof currentValue !== "object") {
      return undefined;
    }

    return (currentValue as Record<string, unknown>)[segment];
  }, value);
};

/**
 * Clears linked field bindings from an authored mapping tree while preserving
 * any constant values the editor already entered.
 */
const clearEntityFieldBindings = (value: unknown): unknown => {
  if (
    value &&
    typeof value === "object" &&
    "field" in value &&
    "constantValue" in value
  ) {
    return {
      ...value,
      field: "",
    };
  }

  if (Array.isArray(value)) {
    return value.map(clearEntityFieldBindings);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        clearEntityFieldBindings(nestedValue),
      ])
    );
  }

  return value;
};

/**
 * Returns whether an authored mapping tree still contains any linked field
 * selections that need clearing after the parent linked source changes.
 */
const hasEntityFieldBindings = (value: unknown): boolean => {
  if (
    value &&
    typeof value === "object" &&
    "field" in value &&
    "constantValue" in value
  ) {
    return !!(value as { field?: string }).field;
  }

  if (Array.isArray(value)) {
    return value.some(hasEntityFieldBindings);
  }

  if (value && typeof value === "object") {
    return Object.values(value).some(hasEntityFieldBindings);
  }

  return false;
};

export const ItemSourceFieldOverride = ({
  field,
  value,
  onChange,
}: ItemSourceFieldProps) => {
  const getPuck = useGetPuck();
  const itemSelector = usePuck((state) => state.appState.ui.itemSelector);
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
  const updateItemSource = React.useCallback(
    (nextValue: ItemSourceValue<Record<string, unknown>>) => {
      const previousField =
        !value?.constantValueEnabled && typeof value?.field === "string"
          ? value.field
          : "";
      const nextField =
        !nextValue.constantValueEnabled && typeof nextValue.field === "string"
          ? nextValue.field
          : "";

      if (
        !field.itemSourcePath ||
        !field.itemMappingsPath ||
        !previousField ||
        !nextField ||
        previousField === nextField ||
        !itemSelector?.zone ||
        itemSelector.index === undefined
      ) {
        onChange(nextValue);
        return;
      }

      const { dispatch, getItemBySelector } = getPuck();
      const selectedComponent = getItemBySelector(itemSelector);
      const itemMappings = getPathValue(
        selectedComponent?.props,
        field.itemMappingsPath
      );

      if (!selectedComponent || !hasEntityFieldBindings(itemMappings)) {
        onChange(nextValue);
        return;
      }

      let updatedComponent = setDeep(
        selectedComponent,
        `props.${field.itemSourcePath}`,
        nextValue
      );
      updatedComponent = setDeep(
        updatedComponent,
        `props.${field.itemMappingsPath}`,
        clearEntityFieldBindings(itemMappings)
      );

      dispatch({
        type: "replace",
        destinationZone: itemSelector.zone,
        destinationIndex: itemSelector.index,
        data: updatedComponent,
      });
    },
    [
      field.itemMappingsPath,
      field.itemSourcePath,
      getPuck,
      itemSelector,
      onChange,
      value?.constantValueEnabled,
      value?.field,
    ]
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
            onChange={updateItemSource}
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
