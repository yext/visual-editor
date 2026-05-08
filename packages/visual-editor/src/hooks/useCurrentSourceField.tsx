import { createUsePuck } from "@puckeditor/core";
import { isPlainObject } from "../internal/utils/isPlainObject.ts";

const usePuck = createUsePuck();

/**
 * Reads a dotted path from an unknown value tree.
 */
const getValueAtPath = (value: unknown, path: string): unknown => {
  if (!isPlainObject(value) || !path) {
    return undefined;
  }

  return path.split(".").reduce<unknown>((currentValue, key) => {
    if (!isPlainObject(currentValue)) {
      return undefined;
    }

    return currentValue[key];
  }, value);
};

/**
 * Reads the currently selected linked source field from the active Puck item.
 *
 * This is used by editor-only controls, such as embedded field pickers, that
 * need to scope their available fields relative to a parent repeated or
 * single-value `entityField` while the user is editing that item.
 *
 * Returns an empty string when:
 * - no source field path was provided
 * - there is no active item selector in Puck state
 * - the source field is in manual/constant mode
 * - the stored value does not contain a linked field path
 */
export const useCurrentSourceField = (sourceFieldPath?: string): string => {
  return usePuck((state) => {
    if (!sourceFieldPath) {
      return "";
    }

    const itemSelector = state.appState.ui.itemSelector;
    if (!itemSelector) {
      return "";
    }

    const sourceFieldValue = getValueAtPath(
      state.getItemBySelector(itemSelector)?.props,
      sourceFieldPath
    );

    if (typeof sourceFieldValue === "string") {
      return sourceFieldValue;
    }

    if (isPlainObject(sourceFieldValue)) {
      const sourceField = sourceFieldValue.field;
      const constantValueEnabled = sourceFieldValue.constantValueEnabled;

      return !constantValueEnabled && typeof sourceField === "string"
        ? sourceField
        : "";
    }

    return "";
  });
};
