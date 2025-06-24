module.exports = {
  input: [
    "src/components/**/*.{ts,tsx}",
    "src/editor/**/*.{ts,tsx}",
    "src/internal/**/*.{ts,tsx}",
    "!**/__screenshots__/**",
    "src/utils/*.ts",
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
      list: ["t", "i18next.t", "i18n", "pt", "msg"],
      extensions: [".ts", ".tsx"],
    },
    lngs: [
      "cs",
      "da",
      "de",
      "en-GB",
      "en",
      "es",
      "et",
      "fi",
      "fr",
      "hr",
      "hu",
      "it",
      "ja",
      "lt",
      "lv",
      "nb",
      "nl",
      "pl",
      "pt",
      "ro",
      "sk",
      "sv",
      "tr",
      "zh-CN",
      "zh-TW",
    ],
    defaultLng: "en",
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
    contextSeparator: "_",
  },
};
