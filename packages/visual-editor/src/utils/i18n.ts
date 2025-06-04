import i18next from "i18next";

const NAMESPACE = "visual-editor";

let hasInitialized = false;

export const initI18n = (): Promise<typeof i18next> => {
  if (i18next.isInitialized || hasInitialized) {
    return Promise.resolve(i18next);
  }

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

  return new Promise((resolve, reject) => {
    i18next.init(
      {
        fallbackLng: "en",
        ns: [NAMESPACE],
        defaultNS: NAMESPACE,
        interpolation: { escapeValue: false },
        resources,
      },
      (err) => {
        if (err) {
          console.error("i18next initialization failed:", err);
          reject(err);
        } else {
          hasInitialized = true;
          resolve(i18next);
        }
      }
    );
  });
};
