import react from "@vitejs/plugin-react";
import { LibraryFormats, defineConfig } from "vite";
import path from "node:path";
import type { Plugin } from "vite";
import { exec } from "node:child_process";

export default defineConfig(() => ({
  plugins: [react(), dts()],
  build: {
    lib: {
      entry: path.resolve(__dirname, "src/index.ts"),
      name: "visual-editor",
      formats: ["es", "cjs"] as LibraryFormats[], // typescript is unhappy without this forced type definition
    },
    rollupOptions: {
      external: [
        "react",
        "react-dom",
        "@measured/puck",
        "uuid",
        "@yext/pages-components",
      ],
      output: {
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
  },
}));

/** A custom plugin to generate TS types using tsup */
const dts = (): Plugin => ({
  name: "dts",
  buildEnd: (error) => {
    if (error) {
      return;
    }

    exec("tsup src/index.ts --format esm,cjs --dts-only", (err) => {
      if (err) {
        throw new Error("Failed to generate declaration files");
      }
    });
  },
});
