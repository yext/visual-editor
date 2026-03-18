import { defineConfig, LibraryFormats } from "vite";
import path from "node:path";

export default defineConfig(() => ({
  build: {
    emptyOutDir: true,
    outDir: "dist/plugin",
    lib: {
      entry: {
        plugin: path.resolve(__dirname, "src/vite-plugin/index.ts"),
      },
      name: "visual-editor-vite-plugin",
      formats: ["es"] as LibraryFormats[], // typescript is unhappy without this forced type definition
    },
    target: "node18",
    tsconfig: path.resolve(__dirname, "tsconfig.plugin.json"),
    rollupOptions: {
      external: ["node:path", "fs-extra"],
    },
  },
}));
