import React from "react";
import {
  BaseField,
  FieldLabel,
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

/**
 * Shared value shape for repeated item sources that can either resolve from a
 * linked list field or fall back to manually authored items.
 */
export type ItemSource<TItem extends Record<string, unknown>> = {
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
  sourcePath?: string;
  mappingsPath?: string;
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

/**
 * Renders the repeated-item source editor.
 *
 * 1. Lets the user switch between linked-list mode and manual-item mode.
 * 2. Shows either the linked source selector or the inline manual item editor.
 * 3. Clears stale linked mapping selections when the user switches between
 *    linked parent sources while preserving any authored constant values.
 */
export const ItemSourceFieldOverride = ({
  field,
  value,
  onChange,
}: ItemSourceFieldProps) => {
  const getPuck = useGetPuck();
  const translatedLabel = field.label ? pt(field.label) : "";
  const constantValueEnabled = !!value?.constantValueEnabled;
  const baseValue = value ?? {
    field: "",
    constantValueEnabled: true,
    constantValue: [],
  };
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

  /**
   * Applies one linked-source change to the selected component.
   *
   * When the parent linked field changes, any nested `itemMappings.*.field`
   * selections become stale because they are scoped relative to that parent
   * source. In that case we replace the selected component in Puck with the
   * new item source and a cleared mapping tree, while preserving existing
   * constant fallback values.
   */
  const updateItemSource = React.useCallback(
    (nextValue: ItemSource<Record<string, unknown>>) => {
      const { appState, dispatch, getItemBySelector } = getPuck();
      const itemSelector = appState.ui.itemSelector;
      const selectedComponent =
        itemSelector?.zone !== undefined && itemSelector.index !== undefined
          ? getItemBySelector(itemSelector)
          : undefined;
      const previousSourceValue = field.sourcePath
        ? getPathValue(selectedComponent?.props, field.sourcePath)
        : undefined;
      const previousField =
        previousSourceValue &&
        typeof previousSourceValue === "object" &&
        !Array.isArray(previousSourceValue) &&
        !(previousSourceValue as { constantValueEnabled?: boolean })
          .constantValueEnabled &&
        typeof (previousSourceValue as { field?: unknown }).field === "string"
          ? ((previousSourceValue as { field: string }).field ?? "")
          : "";
      const nextField =
        !nextValue.constantValueEnabled && typeof nextValue.field === "string"
          ? nextValue.field
          : "";

      if (
        !field.sourcePath ||
        !field.mappingsPath ||
        !previousField ||
        !nextField ||
        previousField === nextField ||
        !itemSelector?.zone ||
        itemSelector.index === undefined
      ) {
        onChange(nextValue);
        return;
      }

      const itemMappings = getPathValue(
        selectedComponent?.props,
        field.mappingsPath
      );

      if (!selectedComponent || !hasEntityFieldBindings(itemMappings)) {
        onChange(nextValue);
        return;
      }

      let updatedComponent = setDeep(
        selectedComponent,
        `props.${field.sourcePath}`,
        nextValue
      );
      updatedComponent = setDeep(
        updatedComponent,
        `props.${field.mappingsPath}`,
        clearEntityFieldBindings(itemMappings)
      );

      dispatch({
        type: "replace",
        destinationZone: itemSelector.zone,
        destinationIndex: itemSelector.index,
        data: updatedComponent,
      });
    },
    [field.mappingsPath, field.sourcePath, getPuck, onChange]
  );

  return (
    <>
      <ConstantValueModeToggler
        fieldTypeFilter={["type.string"]}
        constantValueEnabled={constantValueEnabled}
        toggleConstantValueEnabled={(nextConstantValueEnabled) =>
          onChange({
            ...baseValue,
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
                ...baseValue,
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
                "itemSourceFieldHint",
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
