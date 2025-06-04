module.exports = {
  input: [
    "src/components/**/*.{ts,tsx}",
    "src/editor/**/*.{ts,tsx}",
    "!**/__screenshots__/**",
  ],

  output: "",

  options: {
    debug: true,
    defaultValue: (lng, ns, key, options) => {
      if (lng.toLowerCase().startsWith("en")) {
        return options.defaultValue || key;
      }
      return "";
    },
    func: {
      list: ["t", "i18next.t", "i18n"],
      extensions: [".ts", ".tsx"],
    },
    lngs: [
      "cs-CZ",
      "da-DK",
      "de-DE",
      "en-GB",
      "en-US",
      "es-ES",
      "et-EE",
      "fi-FI",
      "fr-FR",
      "hr-HR",
      "hu-HU",
      "it-IT",
      "ja-JP",
      "lt-LT",
      "lv-LV",
      "nb-NO",
      "nl",
      "pl-PL",
      "pt-PT",
      "ro-RO",
      "sk-SK",
      "sv-SE",
      "tr-TR",
      "zh-CN",
      "zh-TW",
    ],
    defaultLng: "en-US",
    fallbackLng: {
      // English variants
      "en-GB": ["en-US"],
      "en-US": ["en-GB"],

      // Chinese variants
      "zh-CN": ["zh-TW"],
      "zh-TW": ["zh-CN"],

      // Nordic / Scandinavian
      "da-DK": ["nb-NO", "sv-SE"],
      "nb-NO": ["sv-SE", "da-DK"],
      "sv-SE": ["nb-NO", "da-DK"],

      // Slavic close pair
      "cs-CZ": ["sk-SK"],
      "sk-SK": ["cs-CZ"],

      // Baltic close pair
      "lt-LT": ["lv-LV"],
      "lv-LV": ["lt-LT"],
    },
    ns: ["visual-editor"],
    defaultNs: "visual-editor",
    resource: {
      loadPath: "locales/{{lng}}/{{ns}}.json",
      savePath: "locales/{{lng}}/{{ns}}.json",
      jsonIndent: 2,
    },
    interpolation: {
      prefix: "{{",
      suffix: "}}",
    },
  },
};
