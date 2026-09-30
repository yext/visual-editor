import { getTranslations } from "./getTranslations.ts";
import {
  i18nPlatformInstance,
  VISUAL_EDITOR_NAMESPACE,
} from "./i18nInstances.ts";

// Keep this loader separate from platform.ts. Section Library components import
// pt/msg from that module and must not also pull in this built-in import map.

/** Loads Visual Editor platform translations. */
export const loadVEPlatformTranslations = async (locale: string) => {
  if (i18nPlatformInstance.hasResourceBundle(locale, VISUAL_EDITOR_NAMESPACE)) {
    return;
  }

  const translationsToInject = await getTranslations(locale, "platform");
  if (translationsToInject && Object.keys(translationsToInject).length > 0) {
    i18nPlatformInstance.addResourceBundle(
      locale,
      VISUAL_EDITOR_NAMESPACE,
      translationsToInject,
      true,
      true
    );
  }
};
