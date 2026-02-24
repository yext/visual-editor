import { Config } from "@puckeditor/core";
import {
  getComponentDefaultsFromTranslations,
  normalizeComponentDefaultLocale,
} from "./componentDefaultResolver.ts";
import { injectMissingLocalizedValuesRecursively } from "./injectMissingLocalizedValues.ts";

/**
 * Injects localized default values into config for one locale.
 *
 * This mutates `config` in place. Only `defaultProps` and field definitions
 * (`fields`) are localized. Existing locale values are preserved.
 */
export const localizeConfigDefaultsForLocale = (
  config: Config,
  locale: unknown,
  targetTranslations: unknown
): Config => {
  const normalizedLocale = normalizeComponentDefaultLocale(locale);
  if (!normalizedLocale) {
    return config;
  }

  const localizedComponentDefaults =
    getComponentDefaultsFromTranslations(targetTranslations);
  if (Object.keys(localizedComponentDefaults).length === 0) {
    return config;
  }

  for (const component of Object.values(config.components)) {
    if (component.defaultProps) {
      injectMissingLocalizedValuesRecursively(
        component.defaultProps,
        normalizedLocale,
        localizedComponentDefaults
      );
    }
    if (component.fields) {
      injectMissingLocalizedValuesRecursively(
        component.fields,
        normalizedLocale,
        localizedComponentDefaults
      );
    }
  }

  if (config.root?.defaultProps) {
    injectMissingLocalizedValuesRecursively(
      config.root.defaultProps,
      normalizedLocale,
      localizedComponentDefaults
    );
  }
  if (config.root?.fields) {
    injectMissingLocalizedValuesRecursively(
      config.root.fields,
      normalizedLocale,
      localizedComponentDefaults
    );
  }

  return config;
};
