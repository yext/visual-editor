import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "tsup";

const packageDirectory = path.dirname(fileURLToPath(import.meta.url));

// Builds the `yextve` CLI to dist/cli/yextve.js. Node builtins and package
// dependencies stay external; other dependencies are bundled into the CLI.
export default defineConfig({
  entry: { "cli/yextve": "src/cli/yextve.ts" },
  format: ["esm"],
  target: "node20",
  // The shebang makes the output directly executable. Some bundled CJS deps
  // (e.g. prompts) `require()` Node builtins at runtime; ESM has no `require`,
  // so we define one via createRequire — esbuild's require shim picks it up.
  banner: {
    js: [
      "#!/usr/bin/env node",
      'import { createRequire as __ve_createRequire } from "node:module";',
      "const require = __ve_createRequire(import.meta.url);",
    ].join("\n"),
  },
  clean: false,
  onSuccess: copyDirectoryLocatorSourceAssets,
});

// bundle the source code for directory and locator so they can be copied into section libraries
async function copyDirectoryLocatorSourceAssets(): Promise<void> {
  const sourceDirectory = path.join(packageDirectory, "src");
  const assetDirectory = path.join(
    packageDirectory,
    "dist",
    "cli",
    "assets",
    "directory-locator-source"
  );
  await fs.rm(assetDirectory, { recursive: true, force: true });
  await Promise.all(
    [
      "components/contentBlocks",
      "components/directory",
      "components/locator",
    ].map(async (relativePath) => {
      const destination = path.join(assetDirectory, relativePath);
      await fs.mkdir(path.dirname(destination), { recursive: true });
      await fs.cp(path.join(sourceDirectory, relativePath), destination, {
        recursive: true,
      });
    })
  );
  await fs.mkdir(path.join(assetDirectory, "components", "pageSections"), {
    recursive: true,
  });
  await Promise.all([
    fs.copyFile(
      path.join(
        sourceDirectory,
        "components",
        "pageSections",
        "Breadcrumbs.tsx"
      ),
      path.join(assetDirectory, "components", "pageSections", "Breadcrumbs.tsx")
    ),
    fs.copyFile(
      path.join(sourceDirectory, "sectionLibrarySupport.ts"),
      path.join(assetDirectory, "sectionLibrarySupport.ts")
    ),
  ]);
}
