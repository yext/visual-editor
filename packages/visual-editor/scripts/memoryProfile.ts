import { register } from "node:module";

register("./ignoreCssLoader.mjs", import.meta.url);

const { runMemoryProfileCli } = await import(
  "../src/utils/diagnostics/memoryProfileCli.ts"
);
const exitCode = await runMemoryProfileCli();
process.exit(exitCode);
