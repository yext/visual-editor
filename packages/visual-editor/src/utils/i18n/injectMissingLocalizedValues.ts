import type { RichText } from "../../types/types.ts";
import { resolveLocalizedComponentDefaultValue } from "./componentDefaultResolver.ts";

export type LocalizedObject = {
  hasLocalizedValue: "true";
  [key: string]: unknown;
};

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const isLocalizedObject = (value: unknown): value is LocalizedObject => {
  return isPlainObject(value) && value.hasLocalizedValue === "true";
};

/**
 * Recursively traverses a node and injects a missing locale value on
 * `{ hasLocalizedValue: "true" }` objects when a deterministic default exists.
 *
 * This mutates the input object in place.
 */
export const injectMissingLocalizedValuesRecursively = (
  node: unknown,
  locale: string
): void => {
  if (Array.isArray(node)) {
    node.forEach((item) =>
      injectMissingLocalizedValuesRecursively(item, locale)
    );
    return;
  }

  if (!isPlainObject(node)) {
    return;
  }

  if (isLocalizedObject(node)) {
    if (!(locale in node)) {
      const localizedValue = resolveLocalizedComponentDefaultValue(
        locale,
        node.en
      );
      if (localizedValue !== undefined) {
        node[locale] = localizedValue as string | RichText;
      }
    }
    return;
  }

  for (const value of Object.values(node)) {
    injectMissingLocalizedValuesRecursively(value, locale);
  }
};
