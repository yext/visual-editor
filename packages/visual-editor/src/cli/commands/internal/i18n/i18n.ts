import path from "node:path";
import type { Logger } from "i18next-cli";
import type { CliIo } from "../../../command.ts";
import {
  createI18nConfig,
  loadLibraryLocales,
  type TranslationKind,
} from "./config.ts";
import {
  assertPlatformTranslationsComplete,
  findMissingPlatformTranslations,
  renderMissingPlatformTranslations,
} from "./completeness.ts";
import { repairInterpolations } from "./interpolation.ts";
import { propagatePlatformToPage } from "./propagate.ts";

// i18next-cli does not export an I/O adapter, and using console would bypass
// yextve's injectable streams. Use this logger to capture output.
const createI18nextLogger = (io: CliIo): Logger => ({
  info: (message) => io.stdout.write(`${String(message)}\n`),
  warn: (message) => io.stderr.write(`${String(message)}\n`),
  error: (message) => io.stderr.write(`${String(message)}\n`),
});

const loadI18nextCli = async (): Promise<typeof import("i18next-cli")> => {
  // i18next-cli's dependency graph uses the ES2025 Set.union method, while
  // yextve still supports Node 20. Keep the compatibility shim scoped to the
  // lazy i18n path so every other CLI command remains dependency-free.
  const setPrototype = Set.prototype as Set<unknown> & {
    union?: (other: Set<unknown>) => Set<unknown>;
  };
  if (!setPrototype.union) {
    Object.defineProperty(Set.prototype, "union", {
      configurable: true,
      value(this: Set<unknown>, other: Set<unknown>) {
        return new Set([...this, ...other]);
      },
      writable: true,
    });
  }
  return import("i18next-cli");
};

/** Runs the i18next cli to extract translation keys and default values. */
const extractResource = async (
  rootDir: string,
  kind: TranslationKind,
  io: CliIo,
  locales: string[]
): Promise<void> => {
  const { runExtractor } = await loadI18nextCli();
  const result = await runExtractor(createI18nConfig(rootDir, kind, locales), {
    quiet: true,
    logger: createI18nextLogger(io),
  });
  if (result.hasErrors) {
    throw new Error(`${kind} translation extraction failed.`);
  }
  io.stdout.write(`Extracted ${kind} translations.\n`);
};

/** Lints translation files */
const lintResource = async (
  rootDir: string,
  kind: TranslationKind,
  io: CliIo,
  locales: string[]
): Promise<void> => {
  const { runLinter } = await loadI18nextCli();
  const result = await runLinter(createI18nConfig(rootDir, kind, locales));
  const entries = Object.entries(result.files);
  for (const [filePath, issues] of entries) {
    for (const issue of issues) {
      const label = issue.severity === "warning" ? "warning" : "error";
      io[issue.severity === "warning" ? "stdout" : "stderr"].write(
        `${path.relative(rootDir, filePath)}:${issue.line}: ${label}: ${issue.text}\n`
      );
    }
  }
  const errorCount = entries
    .flatMap(([, issues]) => issues)
    .filter((issue) => issue.severity !== "warning").length;
  if (errorCount > 0) {
    throw new Error(
      `${kind} translation lint failed with ${errorCount} error(s).`
    );
  }
  io.stdout.write(
    `${kind[0].toUpperCase()}${kind.slice(1)} translation lint passed.\n`
  );
};

/**
 * Extracts both resource sets before translation work begins so authored values
 * are retained and every missing platform value is presented in one report.
 */
export const prepareI18n = async (
  rootDir: string,
  io: CliIo
): Promise<void> => {
  const locales = await loadLibraryLocales(rootDir);
  await extractResource(rootDir, "platform", io, locales);
  await extractResource(rootDir, "page", io, locales);
  renderMissingPlatformTranslations(
    rootDir,
    await findMissingPlatformTranslations(rootDir, locales),
    io
  );
};

/**
 * Gates completed translations and makes them safe for runtime use by repairing
 * placeholders, propagating page values, and linting both extraction scopes.
 */
export const finalizeI18n = async (
  rootDir: string,
  io: CliIo
): Promise<void> => {
  const locales = await loadLibraryLocales(rootDir);
  await assertPlatformTranslationsComplete(rootDir, io, locales);
  await repairInterpolations(rootDir, io, locales);
  await propagatePlatformToPage(rootDir, io, locales);
  await lintResource(rootDir, "platform", io, locales);
  await lintResource(rootDir, "page", io, locales);
};
