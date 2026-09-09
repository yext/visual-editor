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
 * Synchronizes page locale files from platform locale files.
 *
 * Rules:
 * - page key membership is authoritative per locale (fallback: page/en).
 * - For each locale, matching keys are copied from platform/<locale>.
 * - Locale-specific plural variants in platform are included when their plural
 *   family is already shared in page (e.g. *_few, *_many).
 * - Extra keys are dropped from page locales.
 * - Output is sorted and written deterministically.
 */
const NAMESPACE = "visual-editor.json";
const ROOT = path.resolve(process.cwd(), "locales");
const PLATFORM_DIR = path.join(ROOT, "platform");
const PAGE_DIR = path.join(ROOT, "page");
const PAGE_EN_PATH = path.join(PAGE_DIR, "en", NAMESPACE);
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
  pageEnFlat: FlatTranslations,
  pageLocaleFlat: FlatTranslations,
  platformFlat: FlatTranslations
): Set<string> => {
  const allowed = new Set<string>([
    ...Object.keys(pageEnFlat),
    ...Object.keys(pageLocaleFlat),
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
 * Syncs a single page locale file from the corresponding platform locale.
 */
const propagateLocale = async (
  locale: string,
  pageEnFlat: FlatTranslations
): Promise<void> => {
  const platformPath = path.join(PLATFORM_DIR, locale, NAMESPACE);
  const pagePath = path.join(PAGE_DIR, locale, NAMESPACE);

  const platformFlat = flatten(await loadJsonSafe(platformPath));
  const existingPageFlat = flatten(await loadJsonSafe(pagePath));
  const allowedKeys = buildAllowedKeys(
    pageEnFlat,
    existingPageFlat,
    platformFlat
  );
  const nextPageFlat: FlatTranslations = {};

  for (const key of allowedKeys) {
    if (platformFlat[key] !== undefined) {
      nextPageFlat[key] = platformFlat[key];
    } else {
      nextPageFlat[key] = existingPageFlat[key] ?? "";
      console.warn(
        `[${locale}] Missing key "${key}" in platform. Preserving existing page value.`
      );
    }
  }

  const sorted = sortObject(unflatten(nextPageFlat));
  await saveJson(pagePath, sorted);
  console.log(`Synced page locale from platform: ${locale}`);
};

/**
 * Script entrypoint:
 * - loads page/en keys
 * - propagates each platform locale into page
 */
const run = async (): Promise<void> => {
  const pageEn = flatten(await loadJsonSafe(PAGE_EN_PATH));
  if (Object.keys(pageEn).length === 0) {
    throw new Error(
      `No keys found in ${PAGE_EN_PATH}. Run extraction before propagation.`
    );
  }

  const locales = await getSubdirectoryNames(PLATFORM_DIR);
  for (const locale of locales) {
    await propagateLocale(locale, pageEn);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
