import { defineConfig } from "tsup";

// Builds the `yextve` CLI to dist/bin/cli.js. Node builtins stay external and
// everything else is bundled, so the CLI's dependencies (prompts, yaml, etc.)
// can remain devDependencies rather than runtime deps of the published package.
export default defineConfig({
  entry: { "bin/cli": "src/bin/cli.ts" },
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
});
