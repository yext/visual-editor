import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { resources } from "../locales/index.ts";

export const i18nInit = () => {
  // Initialize i18next
  i18n
    .use(LanguageDetector) // Add language detector
    .use(initReactI18next) // Bind react-i18next
    // TODO: Uncomment this when we switch to "moduleResolution": "nodenext" and
    // "module": "NodeNext" in tsconfig.json
    //   resourcesToBackend(
    //     (language: string, namespace: string) =>
    //       import(`./locales/${language}/${namespace}.json`)
    //   )
    .init({
      // TODO: Remove resources when we swap to resourcesToBackend
      resources, // Pass the static resources object
      fallbackLng: "en", // Fallback language
      ns: ["translation"], // Default namespace
      defaultNS: "translation",
      detection: {
        // This is necessary for the browser language detector to work. Unclear about all of the options.
        order: [
          "navigator",
          "localStorage",
          "cookie",
          "querystring",
          "htmlTag",
        ], // Detection sources
        lookupLocalStorage: "i18nextLng", // Key for localStorage
        lookupCookie: "i18next", // Key for cookie
        caches: ["localStorage", "cookie"], // Cache detected language
      },
      interpolation: {
        escapeValue: false, // React handles XSS by default
      },
      react: {
        useSuspense: true, // Enable suspense for lazy loading
      },
    })
    // TODO: Remove this when ready
    .then(() => {
      console.log("i18n initialized", {
        language: i18n.language,
        resources: resources,
      });
    });
};
