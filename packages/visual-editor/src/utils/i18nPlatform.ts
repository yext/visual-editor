import i18next from "i18next";
import { initReactI18next, useTranslation } from "react-i18next";

const NAMESPACE = "visual-editor";

const i18nPlatformInstance = i18next.createInstance();

const resources: Record<string, any> = {};
const modules = import.meta.glob("../../locales/*/visual-editor.json", {
  eager: true,
});
const translationRegex = new RegExp(`locales/([^/]+)/${NAMESPACE}\\.json$`);

for (const path in modules) {
  const match = path.match(translationRegex);
  if (match) {
    const lang = match[1];
    resources[lang] = {
      [NAMESPACE]: (modules[path] as any).default,
    };
  }
}

i18nPlatformInstance.use(initReactI18next).init({
  fallbackLng: "en",
  ns: [NAMESPACE],
  defaultNS: NAMESPACE,
  interpolation: { escapeValue: false },
  resources,
});

const usePlatformTranslation = () => {
  return useTranslation(NAMESPACE, { i18n: i18nPlatformInstance });
};

/**
 * msg marks strings for translation in config JSON such
 * as Puck fields or the theme config. These strings are
 * dynamically replaced when the config is rendered.
 */
const msg = (s: string) => {
  return s;
};

export { i18nPlatformInstance, usePlatformTranslation, msg };
