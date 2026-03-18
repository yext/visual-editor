import path from "path";
import {
  flatten,
  getSubdirectoryNames,
  loadJsonSafe,
  saveJson,
  sortObject,
  type FlatTranslations,
  unflatten,
} from "../src/utils/i18n/jsonUtils.ts";

/**
 * Synchronizes components locale files from platform locale files.
 *
 * Rules:
 * - components key membership is authoritative per locale (fallback: components/en).
 * - For each locale, matching keys are copied from platform/<locale>.
 * - Locale-specific plural variants in platform are included when their plural
 *   family is already shared in components (e.g. *_few, *_many).
 * - Extra keys are dropped from components locales.
 * - Output is sorted and written deterministically.
 */
const NAMESPACE = "visual-editor.json";
const ROOT = path.resolve(process.cwd(), "locales");
const PLATFORM_DIR = path.join(ROOT, "platform");
const COMPONENTS_DIR = path.join(ROOT, "components");
const COMPONENTS_EN_PATH = path.join(COMPONENTS_DIR, "en", NAMESPACE);
const PLURAL_FORMS = new Set(["zero", "one", "two", "few", "many", "other"]);

const getPluralBase = (key: string): string | null => {
  const separatorIndex = key.lastIndexOf("_");
  if (separatorIndex === -1) {
    return null;
  }

  const maybeForm = key.slice(separatorIndex + 1);
  if (!PLURAL_FORMS.has(maybeForm)) {
    return null;
  }

  return key.slice(0, separatorIndex);
};

/**
 * Builds the allowed keyset for a locale.
 * Includes locale keys plus english fallback keys, and extends plural families
 * with platform locale-specific forms.
 */
const buildAllowedKeys = (
  componentsEnFlat: FlatTranslations,
  componentsLocaleFlat: FlatTranslations,
  platformFlat: FlatTranslations
): Set<string> => {
  const allowed = new Set<string>([
    ...Object.keys(componentsEnFlat),
    ...Object.keys(componentsLocaleFlat),
  ]);

  const sharedPluralFamilies = new Set<string>();
  for (const key of allowed) {
    const base = getPluralBase(key);
    if (base) {
      sharedPluralFamilies.add(base);
    }
  }

  for (const platformKey of Object.keys(platformFlat)) {
    const base = getPluralBase(platformKey);
    if (!base) {
      continue;
    }

    if (sharedPluralFamilies.has(base) || allowed.has(base)) {
      allowed.add(platformKey);
    }
  }

  return allowed;
};

/**
 * Syncs a single components locale file from the corresponding platform locale.
 */
const propagateLocale = async (
  locale: string,
  componentsEnFlat: FlatTranslations
): Promise<void> => {
  const platformPath = path.join(PLATFORM_DIR, locale, NAMESPACE);
  const componentsPath = path.join(COMPONENTS_DIR, locale, NAMESPACE);

  const platformFlat = flatten(await loadJsonSafe(platformPath));
  const existingComponentsFlat = flatten(await loadJsonSafe(componentsPath));
  const allowedKeys = buildAllowedKeys(
    componentsEnFlat,
    existingComponentsFlat,
    platformFlat
  );
  const nextComponentsFlat: FlatTranslations = {};

  for (const key of allowedKeys) {
    if (platformFlat[key] !== undefined) {
      nextComponentsFlat[key] = platformFlat[key];
    } else {
      nextComponentsFlat[key] = existingComponentsFlat[key] ?? "";
      console.warn(
        `[${locale}] Missing key "${key}" in platform. Preserving existing components value.`
      );
    }
  }

  const sorted = sortObject(unflatten(nextComponentsFlat));
  await saveJson(componentsPath, sorted);
  console.log(`Synced components locale from platform: ${locale}`);
};

/**
 * Script entrypoint:
 * - loads components/en keys
 * - propagates each platform locale into components
 */
const run = async (): Promise<void> => {
  const componentsEn = flatten(await loadJsonSafe(COMPONENTS_EN_PATH));
  if (Object.keys(componentsEn).length === 0) {
    throw new Error(
      `No keys found in ${COMPONENTS_EN_PATH}. Run extraction before propagation.`
    );
  }

  const locales = await getSubdirectoryNames(PLATFORM_DIR);
  for (const locale of locales) {
    await propagateLocale(locale, componentsEn);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
