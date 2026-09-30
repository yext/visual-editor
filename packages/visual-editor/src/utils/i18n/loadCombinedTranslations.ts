import type { i18n } from "i18next";
import {
  i18nPageInstance,
  i18nPlatformInstance,
  VISUAL_EDITOR_NAMESPACE,
} from "./i18nInstances.ts";
import {
  loadTranslationDictionary,
  normalizeTranslationLocale,
  type TranslationLoader,
  type TranslationLoaders,
} from "./translationResources.ts";

// Keep the combined-dictionary runtime separate from the VE-only loaders so a
// Section Library bundle contains only its generated translation imports.
const loadedPageLoaders = new WeakSet<TranslationLoader>();
const loadedPlatformLoaders = new WeakSet<TranslationLoader>();

const loadCombinedTranslations = async (
  instance: i18n,
  locale: string,
  loaders: TranslationLoaders,
  loadedLoaders: WeakSet<TranslationLoader>
): Promise<void> => {
  const loader = loaders[normalizeTranslationLocale(locale)];
  if (
    instance.hasResourceBundle(locale, VISUAL_EDITOR_NAMESPACE) &&
    (!loader || loadedLoaders.has(loader))
  ) {
    return;
  }

  const translations = await loadTranslationDictionary(locale, loaders);
  if (Object.keys(translations).length === 0) {
    return;
  }
  instance.addResourceBundle(
    locale,
    VISUAL_EDITOR_NAMESPACE,
    translations,
    true,
    true
  );
  if (loader) {
    loadedLoaders.add(loader);
  }
};

/** Loads the combined visual-editor and repo translations into i18nPageInstance. */
export const loadCombinedPageTranslations = (
  locale: string,
  loaders: TranslationLoaders
): Promise<void> =>
  loadCombinedTranslations(
    i18nPageInstance,
    locale,
    loaders,
    loadedPageLoaders
  );

/** Loads the combined visual-editor and repo translations into i18nPlatformInstance. */
export const loadCombinedPlatformTranslations = (
  locale: string,
  loaders: TranslationLoaders
): Promise<void> =>
  loadCombinedTranslations(
    i18nPlatformInstance,
    locale,
    loaders,
    loadedPlatformLoaders
  );
