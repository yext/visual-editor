import { defineConfig, LibraryFormats } from "vite";
import { builtinModules } from "node:module";
import path from "node:path";

const nodeBuiltins = new Set(
  builtinModules.flatMap((moduleName) => {
    return moduleName.startsWith("node:")
      ? [moduleName, moduleName.replace(/^node:/, "")]
      : [moduleName, `node:${moduleName}`];
  })
);

const pluginRuntimeExternalPackages = new Set([
  "fs-extra",
  "ts-morph",
  "tsx",
  "tsx/esm/api",
]);

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
      external: (source) => {
        return (
          nodeBuiltins.has(source) || pluginRuntimeExternalPackages.has(source)
        );
      },
    },
  },
}));
