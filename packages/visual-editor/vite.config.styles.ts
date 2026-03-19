import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig(() => ({
  build: {
    cssCodeSplit: true,
    emptyOutDir: false,
    outDir: "dist",
    rollupOptions: {
      input: {
        style: path.resolve(__dirname, "src/components/styles.css"),
        editor: path.resolve(__dirname, "src/editor/index.css"),
      },
      output: {
        assetFileNames: "[name][extname]",
      },
    },
  },
}));
