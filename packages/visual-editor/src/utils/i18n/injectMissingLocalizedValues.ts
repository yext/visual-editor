import type { RichText } from "../../types/types.ts";
import { resolveLocalizedComponentDefaultValue } from "./componentDefaultResolver.ts";
import { isJsonObject } from "./jsonUtils.ts";

export type LocalizedObject = {
  hasLocalizedValue: "true";
  [key: string]: unknown;
};

const isLocalizedObject = (value: unknown): value is LocalizedObject => {
  return isJsonObject(value) && value.hasLocalizedValue === "true";
};

/**
 * Recursively traverses a node and injects a missing locale value on
 * `{ hasLocalizedValue: "true" }` objects when a deterministic default exists.
 *
 * This mutates the input object in place.
 */
export const injectMissingLocalizedValuesRecursively = (
  node: unknown,
  locale: string,
  localizedComponentDefaults: Record<string, string>
): void => {
  if (Array.isArray(node)) {
    node.forEach((item) =>
      injectMissingLocalizedValuesRecursively(
        item,
        locale,
        localizedComponentDefaults
      )
    );
    return;
  }

  if (!isJsonObject(node)) {
    return;
  }

  if (isLocalizedObject(node)) {
    if (!(locale in node)) {
      const localizedValue = resolveLocalizedComponentDefaultValue(
        node.en,
        localizedComponentDefaults
      );
      if (localizedValue !== undefined) {
        node[locale] = localizedValue as string | RichText;
      }
    }
    return;
  }

  for (const value of Object.values(node)) {
    injectMissingLocalizedValuesRecursively(
      value,
      locale,
      localizedComponentDefaults
    );
  }
};
