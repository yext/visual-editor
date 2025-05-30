import i18next from "i18next";
import { useTranslation } from "react-i18next";

const NAMESPACE = "visual-editor";

let hasInitialized = false;

const fallbackT = (key: string) => key;

/**
 * i18n is a helper function that uses i18next if it is initialized,
 * but just returns the original string otherwise.
 *
 * It uses the 'visual-editor' namespace and supports loose options.
 *
 * @param key Translation key (without namespace)
 * @param options Optional translation options (e.g., context, interpolation)
 */
export const i18n = (key: string, options?: Record<string, any>): string => {
  try {
    if (!i18next.isInitialized) {
      return options?.defaultValue ?? fallbackT(key);
    }

    return (
      (i18next.t as (key: string, options?: Record<string, any>) => string)(
        `${NAMESPACE}:${key}`,
        options
      ) ??
      options?.defaultValue ??
      fallbackT(key)
    );
  } catch {
    return options?.defaultValue ?? fallbackT(key);
  }
};

/**
 * React hook that returns a translation function using 'visual-editor' namespace.
 * Falls back to `i18n` if there's any issue.
 *
 * @returns (key: string, options?: Record<string, any>) => translated string
 */
export const useI18n = () => {
  const { t } = useTranslation(NAMESPACE);
  const safeT = t as (key: string, options?: Record<string, any>) => string;

  return (key: string, options?: Record<string, any>): string => {
    try {
      return safeT(key, options) ?? options?.defaultValue ?? key;
    } catch {
      return i18n(key, options);
    }
  };
};

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
