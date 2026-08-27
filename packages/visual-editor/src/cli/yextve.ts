#!/usr/bin/env node
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import packageJson from "../../package.json" with { type: "json" };
import { runValidateCommand } from "./commands/validate.ts";

const usage = `Usage:
  yextve validate [--skip-api-check] [--skip-repo-structure-check] [--skip-code-check]
  yextve --help
  yextve --version

Validate the Section Library in the current working directory.

Options:
  --skip-api-check                 Skip library.json metadata validation.
  --skip-repo-structure-check      Skip repository structure validation.
  --skip-code-check                Skip import and code-safety validation.
  --help                           Show this help.
  --version                        Show the package version.

Examples:
  npx --package=@yext/visual-editor@latest yextve validate
`;

type CliIo = {
  stdout: Pick<NodeJS.WriteStream, "write" | "isTTY">;
  stderr: Pick<NodeJS.WriteStream, "write">;
};

export const runCli = (
  args: string[],
  io: CliIo = { stdout: process.stdout, stderr: process.stderr },
  rootDir: string = process.cwd()
): number => {
  try {
    // handle help
    if (args.length === 1 && args[0] === "--help") {
      io.stdout.write(usage);
      return 0;
    }

    // handle invalid help calls
    if (args.slice(1).includes("--help")) {
      if (args.length === 2) {
        io.stdout.write(usage);
        return 0;
      }
      io.stderr.write(usage);
      return 2;
    }

    // handle version
    if (args.length === 1 && args[0] === "--version") {
      io.stdout.write(`${packageJson.version}\n`);
      return 0;
    }

    // handle invalid args
    if (args[0] !== "validate") {
      io.stderr.write(usage);
      return 2;
    }

    // run command
    return runValidateCommand(args.slice(1), io, rootDir);
  } catch (error) {
    if (
      error instanceof TypeError &&
      (error as TypeError & { code?: string }).code?.startsWith(
        "ERR_PARSE_ARGS"
      )
    ) {
      io.stderr.write(`${error.message}\n\n${usage}`);
      return 2;
    }

    io.stderr.write(
      `Validation could not be completed: ${error instanceof Error ? error.message : String(error)}\n`
    );
    return 2;
  }
};

if (
  process.argv[1] &&
  fs.realpathSync(process.argv[1]) ===
    fs.realpathSync(fileURLToPath(import.meta.url))
) {
  process.exitCode = runCli(process.argv.slice(2));
}
