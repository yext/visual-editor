const COMPONENT_DEFAULTS_LOCALE_PATH_REGEX =
  /\/components\/([^/]+)\/visual-editor\.json$/;
const COMPONENT_DEFAULTS_NAMESPACE = "componentDefaults";

const componentDefaultsLocaleModules = import.meta.glob(
  "../../../locales/components/*/visual-editor.json",
  {
    eager: true,
  }
) as Record<string, { default?: Record<string, unknown> }>;

export const isPlainObject = (
  value: unknown
): value is Record<string, unknown> => {
  return typeof value === "object" && value !== null && !Array.isArray(value);
};

// Flattens nested objects into dot-delimited keys, including only string leaf values.
// Based on packages/visual-editor/src/utils/i18n/jsonUtils.ts flatten function.
const flattenStringLeafNodes = (
  obj: Record<string, unknown>,
  prefix = ""
): Record<string, string> => {
  const result: Record<string, string> = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (isPlainObject(value)) {
      Object.assign(result, flattenStringLeafNodes(value, fullKey));
      continue;
    }

    if (typeof value === "string") {
      result[fullKey] = value;
    }
  }

  return result;
};

const getLocaleFromModulePath = (path: string): string | undefined => {
  const match = path.match(COMPONENT_DEFAULTS_LOCALE_PATH_REGEX);
  return match?.[1];
};

/**
 * Flattened map of component default content values by locale.
 *
 * Source files are loaded from:
 * `locales/components/<locale>/visual-editor.json` at `componentDefaults`.
 */
export const componentDefaultRegistry = Object.entries(
  componentDefaultsLocaleModules
).reduce<Record<string, Record<string, string>>>((registry, [path, mod]) => {
  const locale = getLocaleFromModulePath(path);
  if (!locale) {
    return registry;
  }

  const namespaceValue = mod.default?.[COMPONENT_DEFAULTS_NAMESPACE];
  registry[locale] = isPlainObject(namespaceValue)
    ? flattenStringLeafNodes(namespaceValue, COMPONENT_DEFAULTS_NAMESPACE)
    : {};
  return registry;
}, {});
