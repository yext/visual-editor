import { defineConfig, LibraryFormats } from "vite";
import { builtinModules } from "node:module";
import path from "node:path";

const nodeBuiltins = new Set(
  builtinModules.flatMap((moduleName) => {
    return moduleName.startsWith("node:")
      ? [moduleName, moduleName.slice(5)]
      : [moduleName, `node:${moduleName}`];
  })
);

export default defineConfig(() => ({
  build: {
    emptyOutDir: false,
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
          nodeBuiltins.has(source) ||
          ["fs-extra", "ts-morph", "typescript"].some(
            (packageName) =>
              source === packageName || source.startsWith(`${packageName}/`)
          )
        );
      },
    },
  },
}));
