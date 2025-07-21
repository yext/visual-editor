import i18next from "i18next";
import { initReactI18next } from "react-i18next";
import { applyI18nFallbacks, defaultI18nFallbacks } from "./i18nFallbacks.ts";

const NAMESPACE = "visual-editor";

const i18nComponentsInstance = i18next.createInstance();

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

applyI18nFallbacks(resources, defaultI18nFallbacks);

i18nComponentsInstance.use(initReactI18next).init({
  fallbackLng: "en",
  ns: [NAMESPACE],
  defaultNS: NAMESPACE,
  interpolation: { escapeValue: false },
  resources,
});

export { i18nComponentsInstance };
