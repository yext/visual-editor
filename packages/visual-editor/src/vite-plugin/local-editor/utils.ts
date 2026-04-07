import path from "node:path";
import fs from "fs-extra";

/**
 * Returns whether a value is a non-array object.
 */
export const isPlainObject = (
  value: unknown
): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

/**
 * Reads and parses JSON, rethrowing parse failures with a path-aware message.
 */
export const readJsonFile = <T>(filePath: string, description: string): T => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse ${description} at ${path.relative(process.cwd(), filePath)}: ${toErrorMessage(error)}`
    );
  }
};

/**
 * Normalizes unknown thrown values into a printable error message.
 */
export const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};

/**
 * Writes a file only when its contents have changed.
 */
export const writeFileIfChanged = (
  filePath: string,
  contents: string
): void => {
  if (
    fs.existsSync(filePath) &&
    fs.readFileSync(filePath, "utf8") === contents
  ) {
    return;
  }

  fs.writeFileSync(filePath, contents);
};
