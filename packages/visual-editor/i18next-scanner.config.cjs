module.exports = {
  input: [
    "src/**/*.{ts,tsx}",
    "!**/__screenshots__/**", // exclude this folder and all files inside it
  ],

  output: "",

  options: {
    debug: true,
    defaultValue: (lng, ns, key) => key,
    func: {
      list: ["t", "i18next.t", "i18n"],
      extensions: [".ts", ".tsx"],
    },
    lngs: ["en"],
    defaultLng: "en",
    defaultNs: "translation",
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
