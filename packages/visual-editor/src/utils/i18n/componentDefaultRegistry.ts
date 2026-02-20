type JsonValue =
  | string
  | number
  | boolean
  | null
  | JsonValue[]
  | { [key: string]: JsonValue };

type LocaleModule = {
  default: JsonValue;
};

type ComponentsLocaleRoot = {
  componentDefaults?: JsonValue;
};

const COMPONENT_DEFAULTS_LOCALE_PATH_REGEX =
  /\/components\/([^/]+)\/visual-editor\.json$/;
const COMPONENT_DEFAULTS_NAMESPACE = "componentDefaults";

const componentDefaultsLocaleModules = import.meta.glob(
  "../../../locales/components/*/visual-editor.json",
  {
    eager: true,
  }
) as Record<string, LocaleModule>;

const flattenStringLeafNodes = (
  value: JsonValue | undefined,
  prefix = "",
  out: Record<string, string> = {}
): Record<string, string> => {
  if (
    value === null ||
    value === undefined ||
    typeof value !== "object" ||
    Array.isArray(value)
  ) {
    if (typeof value === "string" && prefix) {
      out[prefix] = value;
    }
    return out;
  }

  for (const [key, child] of Object.entries(value)) {
    const nextPrefix = prefix ? `${prefix}.${key}` : key;
    flattenStringLeafNodes(child as JsonValue, nextPrefix, out);
  }

  return out;
};

const getLocaleFromModulePath = (
  path: string,
  regex: RegExp
): string | undefined => {
  const match = path.match(regex);
  return match?.[1];
};

const buildRegistry = (): Record<string, Record<string, string>> => {
  const registry: Record<string, Record<string, string>> = {};

  // Source: componentDefaults key in locales/components/<locale>/visual-editor.json
  for (const [path, mod] of Object.entries(componentDefaultsLocaleModules)) {
    const locale = getLocaleFromModulePath(
      path,
      COMPONENT_DEFAULTS_LOCALE_PATH_REGEX
    );
    if (!locale) {
      continue;
    }

    const localeRoot = (mod.default as ComponentsLocaleRoot) ?? {};
    registry[locale] = flattenStringLeafNodes(
      localeRoot.componentDefaults as JsonValue,
      COMPONENT_DEFAULTS_NAMESPACE
    );
  }

  return registry;
};

/**
 * Flattened map of component default content values by locale.
 *
 * Source files are loaded from:
 * `locales/components/<locale>/visual-editor.json` at `componentDefaults`.
 */
export const componentDefaultRegistry = buildRegistry();
