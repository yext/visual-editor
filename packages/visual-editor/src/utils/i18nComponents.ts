import i18next from "i18next";
import { initReactI18next } from "react-i18next";

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

i18nComponentsInstance.use(initReactI18next).init({
  // TODO: replace these fallbacks once we remove the dialects
  // from the stored translations
  fallbackLng: {
    cs: ["cs_CZ"],
    da: ["da_DK"],
    de: ["de_DE"],
    es: ["es_ES"],
    et: ["et_EE"],
    fi: ["fi_FI"],
    fr: ["fr_FR"],
    hr: ["hr_HR"],
    hu: ["hu_HU"],
    it: ["it_IT"],
    ja: ["ja_JP"],
    lt: ["lt_LT"],
    lv: ["lv_LV"],
    nb: ["nb_NO"],
    pl: ["pl_PL"],
    pt: ["pt_PT"],
    ro: ["ro_RO"],
    sk: ["sk_SK"],
    sv: ["sv_SE"],
    tr: ["tr_TR"],
    zh: ["zh_CN"],
    default: ["en"],
  },
  ns: [NAMESPACE],
  defaultNS: NAMESPACE,
  interpolation: { escapeValue: false },
  resources,
});

export { i18nComponentsInstance };
