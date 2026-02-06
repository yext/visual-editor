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
 * - components/en key membership is authoritative.
 * - For each locale, matching keys are copied from platform/<locale>.
 * - Extra keys are dropped from components locales.
 * - Output is sorted and written deterministically.
 */
const NAMESPACE = "visual-editor.json";
const ROOT = path.resolve(process.cwd(), "locales");
const PLATFORM_DIR = path.join(ROOT, "platform");
const COMPONENTS_DIR = path.join(ROOT, "components");
const COMPONENTS_EN_PATH = path.join(COMPONENTS_DIR, "en", NAMESPACE);

/**
 * Syncs a single components locale file from the corresponding platform locale.
 */
const propagateLocale = async (
  locale: string,
  allowedKeys: string[]
): Promise<void> => {
  const platformPath = path.join(PLATFORM_DIR, locale, NAMESPACE);
  const componentsPath = path.join(COMPONENTS_DIR, locale, NAMESPACE);

  const platformFlat = flatten(await loadJsonSafe(platformPath));
  const existingComponentsFlat = flatten(await loadJsonSafe(componentsPath));
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
  const allowedKeys = Object.keys(componentsEn);

  if (allowedKeys.length === 0) {
    throw new Error(
      `No keys found in ${COMPONENTS_EN_PATH}. Run extraction before propagation.`
    );
  }

  const locales = await getSubdirectoryNames(PLATFORM_DIR);
  for (const locale of locales) {
    await propagateLocale(locale, allowedKeys);
  }
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
