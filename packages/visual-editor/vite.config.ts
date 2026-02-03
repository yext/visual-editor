import react from "@vitejs/plugin-react";
import { LibraryFormats, defineConfig } from "vite";
import path from "node:path";
import type { Plugin } from "vite";
import { exec } from "node:child_process";
import { compareScreenshot } from "./src/components/testing/compareScreenshot.ts";

export default defineConfig(() => ({
  define: {
    __VISUAL_EDITOR_TEST__: JSON.stringify(!!process.env.VITEST),
  },
  plugins: [react(), ...(process.env.VITEST ? [cssStubPlugin] : [dts()])],
  resolve: {
    alias: {
      "@yext/visual-editor": path.resolve(__dirname, "src"),
    },
  },
  build: {
    cssCodeSplit: true,
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "visual-editor",
      formats: ["es"] as LibraryFormats[], // typescript is unhappy without this forced type definition
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@puckeditor/core",
        "@puckeditor/plugin-ai",
        "@puckeditor/cloud-client",
        "uuid",
        "@yext/pages-components",
        "mapbox-gl",
        "@yext/search-headless-react",
        "@yext/search-ui-react",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
      input: {
        editor: path.resolve(__dirname, "src/index.ts"),
        style: path.resolve(__dirname, "src/components/styles.css"),
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    env: {
      COMPONENT_TESTS_VISUAL_EDITOR_APP_API_KEY:
        process.env.COMPONENT_TESTS_VISUAL_EDITOR_APP_API_KEY,
      COMPONENT_TESTS_MAPBOX_API_KEY: "dummy",
      COMPONENT_TESTS_SEARCH_API_KEY:
        process.env.COMPONENT_TESTS_SEARCH_API_KEY,
      COMPONENT_TESTS_MAPBOX_STATIC_MAP_KEY:
        process.env.COMPONENT_TESTS_MAPBOX_STATIC_MAP_KEY,
    },
    setupFiles: ["./src/editor/editorTests.setup.ts"],
    css: true,
    browser: {
      enabled: true,
      instances: [{ browser: "chromium" }],
      provider: "playwright",
      headless: true,
      screenshotFailures: false,
      commands: {
        compareScreenshot,
      },
    },
  },
}));

/** A custom plugin to generate TS types using tsup */
const dts = (): Plugin => ({
  name: "dts",
  buildEnd: (error) => {
    if (error) {
      return;
    }

    exec("tsup src/index.ts --format esm --dts-only", (err) => {
      if (err) {
        throw new Error("Failed to generate declaration files");
      }
    });
  },
});

/**
 * A custom plugin to stub out CSS/SCSS imports during Vitest runs,
 * except for componentTests.css and style.css. This ensures that
 * the css applied during tests is the same css applied the page templates.
 */
const cssStubPlugin: Plugin = {
  name: "css-stub",
  enforce: "pre",
  resolveId(id: string) {
    if (
      (id.endsWith(".css") || id.endsWith(".scss")) &&
      !id.endsWith("componentTests.css") &&
      !id.endsWith("style.css")
    ) {
      return id;
    }
  },
  load(id: string) {
    if (
      (id.endsWith(".css") || id.endsWith(".scss")) &&
      !id.endsWith("componentTests.css") &&
      !id.endsWith("style.css")
    ) {
      return "export default {}";
    }
  },
};
