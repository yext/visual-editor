import { validateLibraryMetadata } from "../../internal/sectionLibraryValidation/stages/metadata/libraryMetadata.ts";
import { exportDirectoryLocatorSectionLibrary } from "./internal/exportDirectoryLocatorSectionLibrary.ts";
import { defineYextveCommand } from "../command.ts";

const usage = `Usage:
  yextve add-directory-locator [--overwrite]

Add editable Directory and Locator sections and layouts to this Section Library.
Layout IDs are prefixed with the id from src/library/library.json.

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
      const metadataResult = validateLibraryMetadata(rootDir);
      if (!metadataResult.metadata) {
        const details = metadataResult.issues
          .map((issue) => `${issue.filePath}: ${issue.message}`)
          .join("\n");
        throw new Error(`Invalid library metadata:\n${details}`);
      }

      exportDirectoryLocatorSectionLibrary({
        targetDirectory: rootDir,
        libraryId: metadataResult.metadata.id,
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
