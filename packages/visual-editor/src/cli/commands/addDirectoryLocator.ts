import { exportDirectoryLocatorSectionLibrary } from "./internal/exportDirectoryLocatorSectionLibrary.ts";
import { defineYextveCommand } from "../command.ts";

const usage = `Usage:
  yextve add-directory-locator [--overwrite]

Add editable Directory and Locator sections and layouts to this Section Library.
If library.json exists, its ID prefixes the generated layout IDs. Otherwise,
the generated layout IDs are directory and locator.

Options:
  --overwrite                      Replace existing shared, Directory, and Locator source.
  -h, --help                       Show this help.
`;

export const addDirectoryLocatorCmd = defineYextveCommand({
  usage,
  parseArgsConfig: {
    strict: true,
    allowPositionals: false,
    options: {
      help: { type: "boolean", short: "h" },
      overwrite: { type: "boolean" },
    },
  },
  run: (values, _positionals, io, rootDir) => {
    try {
      exportDirectoryLocatorSectionLibrary({
        targetDirectory: rootDir,
        overwrite: values.overwrite ?? false,
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
