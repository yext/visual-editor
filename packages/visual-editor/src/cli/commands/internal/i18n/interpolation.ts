import fs from "node:fs/promises";
import path from "node:path";
import type { CliIo } from "../../../command.ts";
import type { TranslationKind } from "./config.ts";
import {
  loadFlatTranslations,
  saveTranslations,
  translationPath,
} from "./json.ts";
import { findSourceValue } from "./plurals.ts";

const interpolationPattern = /\{\{\s*([^{}]+?)\s*\}\}/g;

const expressions = (value: string): string[] =>
  Array.from(value.matchAll(interpolationPattern), (match) => match[1].trim());

const variableName = (expression: string): string =>
  (expression.split(",")[0] ?? "").trim();

const counts = (values: string[]): Map<string, number> => {
  const result = new Map<string, number>();
  for (const value of values) {
    result.set(value, (result.get(value) ?? 0) + 1);
  }
  return result;
};

const differences = (expected: string[], actual: string[]) => {
  const expectedCounts = counts(expected);
  const actualCounts = counts(actual);
  const missing: string[] = [];
  const unexpected: string[] = [];
  for (const [name, count] of expectedCounts) {
    for (let index = actualCounts.get(name) ?? 0; index < count; index += 1) {
      missing.push(name);
    }
  }
  for (const [name, count] of actualCounts) {
    for (let index = expectedCounts.get(name) ?? 0; index < count; index += 1) {
      unexpected.push(name);
    }
  }
  return { missing, unexpected };
};

/** Repairs exactly one unambiguous variable-name substitution. */
export const repairInterpolationValue = (
  source: string,
  localized: string
): string | undefined => {
  const actualExpressions = expressions(localized);
  const expectedVariables = expressions(source).map(variableName);
  const actualVariables = actualExpressions.map(variableName);
  if (actualVariables.length !== expectedVariables.length) {
    return undefined;
  }
  const { missing, unexpected } = differences(
    expectedVariables,
    actualVariables
  );
  if (missing.length !== 1 || unexpected.length !== 1) {
    return undefined;
  }

  const remainingExpected = counts(expectedVariables);
  const unexpectedIndexes: number[] = [];
  for (const [index, variable] of actualVariables.entries()) {
    const remaining = remainingExpected.get(variable) ?? 0;
    if (remaining > 0) {
      remainingExpected.set(variable, remaining - 1);
    } else {
      unexpectedIndexes.push(index);
    }
  }
  if (unexpectedIndexes.length !== 1) {
    return undefined;
  }

  const targetIndex = unexpectedIndexes[0];
  const comma = actualExpressions[targetIndex].indexOf(",");
  const replacement = `${missing[0]}${comma === -1 ? "" : actualExpressions[targetIndex].slice(comma)}`;
  let interpolationIndex = 0;
  return localized.replace(interpolationPattern, (match) =>
    interpolationIndex++ === targetIndex ? `{{${replacement}}}` : match
  );
};

type InterpolationIssue = {
  kind: TranslationKind;
  locale: string;
  key: string;
  expected: string[];
  actual: string[];
  filePath: string;
  line: number;
};

const lineForKey = (source: string, key: string): number => {
  const leaf = key.split(".").at(-1) ?? key;
  const escaped = leaf.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = new RegExp(`"${escaped}"\\s*:`).exec(source);
  return match ? source.slice(0, match.index).split("\n").length : 1;
};

/** Applies safe repairs and returns mismatches which need manual review. */
export const repairInterpolations = async (
  rootDir: string,
  io: CliIo,
  locales: string[]
): Promise<void> => {
  const issues: InterpolationIssue[] = [];
  let fixedCount = 0;
  for (const kind of ["platform", "page"] as const) {
    const english = await loadFlatTranslations(
      translationPath(rootDir, kind, "en")
    );
    for (const locale of locales) {
      if (locale === "en") {
        continue;
      }
      const filePath = translationPath(rootDir, kind, locale);
      const raw = await fs.readFile(filePath, "utf8");
      const localized = await loadFlatTranslations(filePath);
      let changed = false;
      for (const [key, value] of Object.entries(localized)) {
        if (!value) {
          continue;
        }
        const source = findSourceValue(key, english);
        if (source === undefined) {
          continue;
        }
        const expected = expressions(source).map(variableName);
        const actual = expressions(value).map(variableName);
        const mismatch = differences(expected, actual);
        if (mismatch.missing.length === 0 && mismatch.unexpected.length === 0) {
          continue;
        }
        const repaired = repairInterpolationValue(source, value);
        if (repaired !== undefined && repaired !== value) {
          localized[key] = repaired;
          changed = true;
          fixedCount += 1;
        } else {
          issues.push({
            kind,
            locale,
            key,
            expected,
            actual,
            filePath,
            line: lineForKey(raw, key),
          });
        }
      }
      if (changed) {
        await saveTranslations(filePath, localized);
      }
    }
  }

  if (fixedCount > 0) {
    io.stdout.write(`Repaired ${fixedCount} interpolation mismatch(es).\n`);
  }
  if (issues.length > 0) {
    for (const issue of issues) {
      io.stderr.write(
        `${path.relative(rootDir, issue.filePath)}:${issue.line}: interpolation mismatch for ${issue.key}; expected [${issue.expected.join(", ")}], found [${issue.actual.join(", ")}]\n`
      );
    }
    throw new Error(
      `${issues.length} interpolation mismatch(es) require manual review.`
    );
  }
};
