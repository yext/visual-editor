import i18next from "i18next";
import { initReactI18next } from "react-i18next";

export const VISUAL_EDITOR_NAMESPACE = "visual-editor";

// Keep the shared instances in this dependency-free module so Section Library
// bundles can use them without importing the built-in translation loaders.

export const i18nPageInstance = i18next.createInstance();

i18nPageInstance.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  ns: [VISUAL_EDITOR_NAMESPACE],
  defaultNS: VISUAL_EDITOR_NAMESPACE,
  interpolation: { escapeValue: false },
  partialBundledLanguages: true,
  resources: {},
});

export const i18nPlatformInstance = i18next.createInstance();

i18nPlatformInstance.use(initReactI18next).init({
  lng: "en",
  fallbackLng: "en",
  ns: [VISUAL_EDITOR_NAMESPACE],
  defaultNS: VISUAL_EDITOR_NAMESPACE,
  interpolation: { escapeValue: false },
  nsSeparator: false,
  resources: {},
});
