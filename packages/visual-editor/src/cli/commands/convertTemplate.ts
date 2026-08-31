import { defineYextveCommand } from "../command.ts";
import { convertTemplatesToSectionLibrary } from "./internal/convertTemplatesToSectionLibrary.ts";

const usage = `Usage:
  yextve convert-template [--apply] [--delete-source]

Convert every legacy template in src/registry into layouts in one Section Library.

Options:
  --apply                          Write the converted Section Library.
  --delete-source                  Remove converted legacy templates; requires --apply.
  -h, --help                       Show this help.
`;

export const convertTemplateCmd = defineYextveCommand({
  usage,
  parseArgsConfig: {
    strict: true,
    allowPositionals: false,
    options: {
      help: { type: "boolean", short: "h" },
      apply: { type: "boolean" },
      "delete-source": { type: "boolean" },
    },
  },
  run: (values, _positionals, io, rootDir) => {
    try {
      convertTemplatesToSectionLibrary({
        apply: values.apply ?? false,
        deleteSource: values["delete-source"] ?? false,
        targetDirectory: rootDir,
        write: (message) => io.stdout.write(`${message}\n`),
      });
      return 0;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      const label = io.stderr.isTTY ? "\x1b[1;31merror:\x1b[0m" : "error:";
      io.stderr.write(`${label} ${message}\n`);
      return 1;
    }
  },
});
