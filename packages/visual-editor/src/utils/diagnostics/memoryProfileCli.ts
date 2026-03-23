import { parseArgs } from "node:util";
import {
  compareTemplateMemory,
  formatComparisonReport,
  formatProfileReport,
  getMemoryProfileHelpText,
  profileTemplateMemoryForRef,
} from "./templateMemoryProfiler.ts";

type CliIo = {
  stdout: {
    write: (chunk: string) => void;
  };
  stderr: {
    write: (chunk: string) => void;
  };
};

export type MemoryProfileCliOptions = {
  argv?: string[];
  io?: CliIo;
  cwd?: string;
};

const getSingleValue = (value: string | string[] | undefined): string | undefined =>
  Array.isArray(value) ? value[value.length - 1] : value;

export const runMemoryProfileCli = async ({
  argv = process.argv.slice(2),
  io = {
    stdout: process.stdout,
    stderr: process.stderr,
  },
  cwd = process.cwd(),
}: MemoryProfileCliOptions = {}): Promise<number> => {
  try {
    const normalizedArgv = argv.filter((arg) => arg !== "--");
    const command =
      normalizedArgv[0] === "compare" || normalizedArgv[0] === "profile"
        ? normalizedArgv[0]
        : "profile";
    const args =
      normalizedArgv[0] === "compare" || normalizedArgv[0] === "profile"
        ? normalizedArgv.slice(1)
        : normalizedArgv;

    const {
      values: {
        base = "main",
        document,
        format = "text",
        head,
        help = false,
        layout,
        preset,
        ref,
      },
    } = parseArgs({
      args,
      allowPositionals: false,
      strict: true,
      options: {
        base: { type: "string", multiple: false },
        document: { type: "string", multiple: false },
        format: { type: "string", multiple: false },
        head: { type: "string", multiple: false },
        help: { type: "boolean", multiple: false },
        layout: { type: "string", multiple: false },
        preset: { type: "string", multiple: false },
        ref: { type: "string", multiple: false },
      },
    });

    if (help) {
      io.stdout.write(getMemoryProfileHelpText());
      return 0;
    }

    const normalizedFormat = getSingleValue(format);
    if (normalizedFormat !== "text" && normalizedFormat !== "json") {
      throw new Error('--format must be either "text" or "json".');
    }

    if (command === "compare") {
      const report = await compareTemplateMemory({
        baseRef: getSingleValue(base) ?? "main",
        headRef: getSingleValue(head),
        preset: getSingleValue(preset),
        documentPath: getSingleValue(document),
        layoutPath: getSingleValue(layout),
        cwd,
      });
      io.stdout.write(`${formatComparisonReport(report, normalizedFormat)}\n`);
      return 0;
    }

    const report = await profileTemplateMemoryForRef({
      ref: getSingleValue(ref),
      preset: getSingleValue(preset),
      documentPath: getSingleValue(document),
      layoutPath: getSingleValue(layout),
      cwd,
    });

    io.stdout.write(`${formatProfileReport(report, normalizedFormat)}\n`);
    return 0;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    io.stderr.write(`${message}\n`);
    return 1;
  }
};
