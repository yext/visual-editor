import { Config } from "@puckeditor/core";
import {
  getComponentDefaultsFromTranslations,
  normalizeComponentDefaultLocale,
} from "../../utils/i18n/componentDefaultResolver.ts";
import { injectMissingLocalizedValuesRecursively } from "../../utils/i18n/injectMissingLocalizedValues.ts";

const isPlainObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

const cloneValue = <T>(value: T): T => {
  if (Array.isArray(value)) {
    return value.map((entry) => cloneValue(entry)) as T;
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const clone: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    clone[key] = cloneValue(entry);
  }
  return clone as T;
};

const cloneAndInjectLocaleDefaults = <T>(
  value: T,
  locale: string,
  localizedComponentDefaults: Record<string, string>
): T => {
  const cloned = cloneValue(value);
  injectMissingLocalizedValuesRecursively(
    cloned,
    locale,
    localizedComponentDefaults
  );
  return cloned;
};

/**
 * Returns a config copy with localized default values injected for one locale.
 *
 * Only `defaultProps` and field definitions (`fields`) are localized. Existing
 * locale values are preserved.
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

  const localizedComponents: Config["components"] = {};
  for (const [componentName, component] of Object.entries(config.components)) {
    localizedComponents[componentName] = {
      ...component,
      ...(component.defaultProps
        ? {
            defaultProps: cloneAndInjectLocaleDefaults(
              component.defaultProps,
              normalizedLocale,
              localizedComponentDefaults
            ),
          }
        : {}),
      ...(component.fields
        ? {
            fields: cloneAndInjectLocaleDefaults(
              component.fields,
              normalizedLocale,
              localizedComponentDefaults
            ),
          }
        : {}),
    };
  }

  const localizedRoot = config.root
    ? {
        ...config.root,
        ...(config.root.defaultProps
          ? {
              defaultProps: cloneAndInjectLocaleDefaults(
                config.root.defaultProps,
                normalizedLocale,
                localizedComponentDefaults
              ),
            }
          : {}),
        ...(config.root.fields
          ? {
              fields: cloneAndInjectLocaleDefaults(
                config.root.fields,
                normalizedLocale,
                localizedComponentDefaults
              ),
            }
          : {}),
      }
    : config.root;

  return {
    ...config,
    components: localizedComponents,
    root: localizedRoot,
  };
};
