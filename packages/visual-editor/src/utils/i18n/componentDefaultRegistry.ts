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

const flattenStringLeafNodes = (
  value: unknown,
  prefix = "",
  out: Record<string, string> = {}
): Record<string, string> => {
  if (typeof value === "string") {
    if (prefix) {
      out[prefix] = value;
    }
    return out;
  }

  if (!isPlainObject(value)) {
    return out;
  }

  for (const [key, child] of Object.entries(value)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    flattenStringLeafNodes(child, nextPrefix, out);
  }

  return out;
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
  registry[locale] = flattenStringLeafNodes(
    namespaceValue,
    COMPONENT_DEFAULTS_NAMESPACE
  );
  return registry;
}, {});
