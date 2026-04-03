import path from "node:path";
import fs from "fs-extra";

export const isPlainObject = (
  value: unknown
): value is Record<string, unknown> => {
  return !!value && typeof value === "object" && !Array.isArray(value);
};

export const readJsonFile = <T>(filePath: string, description: string): T => {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
  } catch (error) {
    throw new Error(
      `Failed to parse ${description} at ${path.relative(process.cwd(), filePath)}: ${toErrorMessage(error)}`
    );
  }
};

export const toErrorMessage = (error: unknown): string => {
  return error instanceof Error ? error.message : String(error);
};
