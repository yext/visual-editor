import type { CliIo } from "../../../command.ts";
import {
  loadFlatTranslations,
  saveTranslations,
  translationPath,
  type FlatTranslations,
} from "./json.ts";
import { expandKeysForLocale, getPluralBase } from "./plurals.ts";

const pageKeysForLocale = (
  pageEnglish: FlatTranslations,
  pageLocalized: FlatTranslations,
  platformLocalized: FlatTranslations,
  locale: string
): Set<string> => {
  const allowed =
    Object.keys(pageLocalized).length > 0
      ? new Set(Object.keys(pageLocalized))
      : expandKeysForLocale(Object.keys(pageEnglish), locale);
  const pluralFamilies = new Set(
    [...allowed].map(getPluralBase).filter((key): key is string => Boolean(key))
  );
  for (const platformKey of Object.keys(platformLocalized)) {
    const base = getPluralBase(platformKey);
    if (base && pluralFamilies.has(base)) {
      allowed.add(platformKey);
    }
  }
  return allowed;
};

/** Copies platform values into the locale-specific set of page keys. */
export const propagatePlatformToPage = async (
  rootDir: string,
  io: CliIo,
  locales: string[]
): Promise<void> => {
  const pageEnglish = await loadFlatTranslations(
    translationPath(rootDir, "page", "en")
  );
  if (Object.keys(pageEnglish).length === 0) {
    throw new Error("Page extraction produced no translation keys.");
  }

  for (const locale of locales) {
    const platformPath = translationPath(rootDir, "platform", locale);
    const pagePath = translationPath(rootDir, "page", locale);
    const platform = await loadFlatTranslations(platformPath);
    const page = await loadFlatTranslations(pagePath, { allowMissing: true });
    const propagated: FlatTranslations = {};
    for (const key of pageKeysForLocale(pageEnglish, page, platform, locale)) {
      if (platform[key] === undefined) {
        throw new Error(
          `Page key "${key}" for ${locale} is missing from ${platformPath}.`
        );
      }
      propagated[key] = platform[key];
    }
    await saveTranslations(pagePath, propagated);
  }
  io.stdout.write("Propagated platform translations to page resources.\n");
};
