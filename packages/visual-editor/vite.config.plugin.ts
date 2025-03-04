import { defineConfig } from "vite";
import path from "node:path";

export default defineConfig(() => ({
  define: {
    "process.env.PLUGIN": "true",
  },
  css: {
    postcss: "./postcss.config.cts",
  },
  build: {
    emptyOutDir: false,
    outDir: "dist/plugin",
    lib: {
      entry: {
        plugin: path.resolve(__dirname, "src/vite-plugin/index.ts"),
      },
      name: "visual-editor-vite-plugin",
      formats: ["es", "cjs"] as ["es", "cjs"], // TypeScript fix
    },
    target: "node18",
    tsconfig: path.resolve(__dirname, "tsconfig.plugin.json"),
    rollupOptions: {
      external: ["node:path", "fs-extra"],
    },
  },
}));
