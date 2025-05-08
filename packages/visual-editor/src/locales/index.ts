import enTranslation from "./en/translation.json";
import esTranslation from "./es/translation.json";

// We need to do this instead of dynamic imports in utils/i18n.ts because we're
// using "moduleResolution": "node", in the tsconfig.json. When we switch to
// "moduleResolution": "nodenext" and "module": "NodeNext", then we can remove
// this file and dynamically import the JSON files in utils/i18n.ts.
// We are using node because of we need commonjs for postcss. See this revert:
// https://github.com/yext/visual-editor/pull/392
export const resources = {
  en: {
    translation: enTranslation,
  },
  es: {
    translation: esTranslation,
  },
} as const;
