import { createUsePuck } from "@puckeditor/core";

const usePuck = createUsePuck();

/**
 * Reads a dotted path from an unknown value tree.
 */
const getValueAtPath = (value: unknown, path: string): unknown => {
  if (!value || typeof value !== "object" || !path) {
    return undefined;
  }

  return path.split(".").reduce<unknown>((currentValue, key) => {
    if (!currentValue || typeof currentValue !== "object") {
      return undefined;
    }

    return (currentValue as Record<string, unknown>)[key];
  }, value);
};

/**
 * Reads the currently selected linked source field from the active Puck item.
 *
 * This is used by editor-only controls, such as embedded field pickers, that
 * need to scope their available fields relative to a parent `itemSource` or
 * `entityField` value while the user is editing that item.
 *
 * Returns an empty string when:
 * - no source field path was provided
 * - there is no active item selector in Puck state
 * - the source field is in manual/constant mode
 * - the stored value does not contain a linked field path
 */
export const useCurrentSourceField = (sourceFieldPath?: string): string => {
  try {
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

      if (
        sourceFieldValue &&
        typeof sourceFieldValue === "object" &&
        !Array.isArray(sourceFieldValue)
      ) {
        const sourceField = (sourceFieldValue as Record<string, unknown>).field;
        const constantValueEnabled = (
          sourceFieldValue as Record<string, unknown>
        ).constantValueEnabled;

        return !constantValueEnabled && typeof sourceField === "string"
          ? sourceField
          : "";
      }

      return "";
    });
  } catch {
    return "";
  }
};
