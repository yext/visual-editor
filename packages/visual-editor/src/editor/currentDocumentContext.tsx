import React from "react";
import { createUsePuck, useGetPuck } from "@puckeditor/core";
import { resolveField } from "../utils/resolveYextEntityField.ts";
import { type StreamDocument } from "../utils/types/StreamDocument.ts";

const usePuck = createUsePuck();

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

export const useResolvedSourceField = (sourceFieldPath?: string): string => {
  let getPuck: ReturnType<typeof useGetPuck> | undefined;
  let itemSelector: any;

  try {
    getPuck = useGetPuck();
    itemSelector = usePuck((state) => state.appState.ui.itemSelector);
  } catch {
    getPuck = undefined;
    itemSelector = undefined;
  }

  return React.useMemo(() => {
    if (!sourceFieldPath || !getPuck || !itemSelector) {
      return "";
    }

    const selectedComponent = getPuck().getItemBySelector(itemSelector);
    const sourceFieldValue = getValueAtPath(
      selectedComponent?.props,
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
      const constantValueEnabled = (sourceFieldValue as Record<string, unknown>)
        .constantValueEnabled;

      return !constantValueEnabled && typeof sourceField === "string"
        ? sourceField
        : "";
    }

    return "";
  }, [getPuck, itemSelector, sourceFieldPath]);
};

export const getCurrentDocumentContext = (
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
