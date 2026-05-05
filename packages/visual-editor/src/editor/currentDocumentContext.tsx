import { createUsePuck } from "@puckeditor/core";
import { resolveField } from "../utils/resolveYextEntityField.ts";
import { type StreamDocument } from "../utils/types/StreamDocument.ts";

const usePuck = createUsePuck();

/**
 * Reads a dotted path from an unknown value tree.
 */
export const getValueAtPath = (value: unknown, path: string): unknown => {
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
export const useResolvedSourceField = (sourceFieldPath?: string): string => {
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

/**
 * Resolves the object scope that embedded linked-field previews should read
 * from.
 *
 * Without a source field this returns the full stream document. With a source
 * field it resolves that path and returns the selected object, or the first
 * item when the source resolves to a list of objects.
 */
export const getSubDocument = (
  streamDocument: StreamDocument | Record<string, unknown> | undefined,
  sourceField?: string
): Record<string, unknown> | undefined => {
  if (!streamDocument || !sourceField) {
    return streamDocument as Record<string, unknown> | undefined;
  }

  const resolvedValue = resolveField<unknown>(
    streamDocument as StreamDocument,
    sourceField
  ).value;

  if (Array.isArray(resolvedValue)) {
    const firstItem = resolvedValue[0];
    return firstItem && typeof firstItem === "object"
      ? (firstItem as Record<string, unknown>)
      : undefined;
  }

  return resolvedValue && typeof resolvedValue === "object"
    ? (resolvedValue as Record<string, unknown>)
    : undefined;
};
