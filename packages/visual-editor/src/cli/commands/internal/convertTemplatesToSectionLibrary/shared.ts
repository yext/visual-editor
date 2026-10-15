import fs from "node:fs";
import type { JsonRecord } from "./types.ts";

export const SAFE_ID = /^[A-Za-z0-9][A-Za-z0-9_-]*$/;
export const ID_REQUIREMENTS =
  "must start with a letter or number and contain only letters, numbers, underscores, and hyphens";
export const REQUIRED_BASE_SECTIONS = new Set(["Directory", "Locator"]);

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

export const readJson = (filePath: string, description: string): unknown => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    throw new Error(
      `Could not read ${description} at ${filePath}: ${getErrorMessage(error)}`
    );
  }
};

export const formatJson = (value: unknown): string =>
  `${JSON.stringify(value, null, 2)}\n`;

export const isRecord = (value: unknown): value is JsonRecord =>
  Boolean(value) && typeof value === "object" && !Array.isArray(value);

const getErrorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);
