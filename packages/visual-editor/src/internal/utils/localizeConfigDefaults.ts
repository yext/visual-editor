import { Config } from "@puckeditor/core";
import { normalizeComponentDefaultLocale } from "../../utils/i18n/componentDefaultResolver.ts";
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

const cloneAndInjectLocaleDefaults = <T>(value: T, locale: string): T => {
  const cloned = cloneValue(value);
  injectMissingLocalizedValuesRecursively(cloned, locale);
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
  locale: unknown
): Config => {
  const normalizedLocale = normalizeComponentDefaultLocale(locale);
  if (!normalizedLocale) {
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
              normalizedLocale
            ),
          }
        : {}),
      ...(component.fields
        ? {
            fields: cloneAndInjectLocaleDefaults(
              component.fields,
              normalizedLocale
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
                normalizedLocale
              ),
            }
          : {}),
        ...(config.root.fields
          ? {
              fields: cloneAndInjectLocaleDefaults(
                config.root.fields,
                normalizedLocale
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
