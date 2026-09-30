import { defineYextVECommand } from "../command.ts";
import { finalizeI18n, prepareI18n } from "./internal/i18n/i18n.ts";

export const i18nUsage = `Usage:
  yextve i18n prepare
  yextve i18n finalize

Prepare or finalize translations for the Section Library in the current directory.

Commands:
  prepare                          Extract platform/page keys and report missing platform translations.
  finalize                         Validate, repair, propagate, and lint translations.

Options:
  -h, --help                       Show this help.
`;

export const i18nCmd = defineYextVECommand({
  usage: i18nUsage,
  parseArgsConfig: {
    strict: true,
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
    },
  },
  run: async (_values, positionals, io, rootDir) => {
    if (
      positionals.length !== 1 ||
      !["prepare", "finalize"].includes(positionals[0])
    ) {
      io.stderr.write(i18nUsage);
      return 2;
    }

    try {
      if (positionals[0] === "prepare") {
        await prepareI18n(rootDir, io);
      } else {
        await finalizeI18n(rootDir, io);
      }
      return 0;
    } catch (error) {
      io.stderr.write(
        `error: ${error instanceof Error ? error.message : String(error)}\n`
      );
      return 1;
    }
  },
});
