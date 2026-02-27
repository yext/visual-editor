import { defineConfig } from "i18next-cli";
import { locales } from "./src/utils/i18n/locales.ts";

export default defineConfig({
  locales,
  extract: {
    input: [
      "src/components/**/*.{ts,tsx}",
      "src/editor/**/*.{ts,tsx}",
      "src/internal/**/*.{ts,tsx}",
      "src/utils/*.ts",
    ],
    ignore: ["**/__screenshots__/**"],
    output: "locales/components/{{language}}/{{namespace}}.json",
    defaultNS: "visual-editor",
    contextSeparator: "_",
    pluralSeparator: "_",
    interpolationPrefix: "{{",
    interpolationSuffix: "}}",
    functions: ["t", "*.t", "i18next.t", "defaultText", "defaultRichText"],
    primaryLanguage: "en",
    defaultValue: "",
    sort: true,
    indentation: 2,
    removeUnusedKeys: true,
  },
  lint: {
    ignore: [
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
      "src/components/base/buttons/*.tsx",
      "src/components/contentBlocks/MapboxStaticMap.tsx",
      "src/internal/puck/components/LayoutHeader.tsx",
      "src/internal/components/modals/LayoutApprovalModal.tsx",
    ],
  },
});
