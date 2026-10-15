/**
 * Holds the file and data validation helpers shared across the conversion
 * stages, including JSON parsing and default layout checks.
 */
import fs from "node:fs";
import type { JsonRecord } from "./types.ts";

export const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
export const ID_REQUIREMENTS =
  "must start with a letter or number and contain only letters, numbers, underscores, and hyphens";
export const REQUIRED_BASE_SECTIONS = new Set(["Directory", "Locator"]);

/** Checks the root, zones, and content fields required by a default layout. */
export function validateDefaultLayout(
  defaultLayout: unknown,
  sourcePath: string,
  description: string
): asserts defaultLayout is JsonRecord {
  const issues: string[] = [];
  if (!isRecord(defaultLayout)) {
    issues.push("default layout must be a JSON object.");
  } else {
    for (const field of ["root", "zones"] as const) {
      if (!isRecord(defaultLayout[field])) {
        issues.push(
          `${field} must be a JSON object; received ${JSON.stringify(defaultLayout[field])}.`
        );
      }
    }
    if (!Array.isArray(defaultLayout.content)) {
      issues.push(
        `content must be an array; received ${JSON.stringify(defaultLayout.content)}.`
      );
    }
  }
  if (issues.length > 0) {
    throw new Error(
      `${description} default layout is not valid: ${sourcePath}\n${issues.map((issue) => `  - ${issue}`).join("\n")}`
    );
  }
}

/** Reads a JSON file and includes its path and purpose in parse errors. */
export const readJson = (filePath: string, description: string): unknown => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `Could not read ${description} at ${filePath}: ${getErrorMessage(error)}`
    );
  }
};

/** Formats generated JSON with a trailing newline. */
export const formatJson = (value: unknown): string =>
  `${JSON.stringify(value, null, 2)}\n`;

/** Narrows an unknown value to a non-array object. */
export const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

/** Turns an unknown thrown value into diagnostic text. */
const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
