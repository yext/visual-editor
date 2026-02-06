import fs from "fs/promises";
import path from "path";

export type FlatTranslations = Record<string, string>;
export type JsonObject = Record<string, unknown>;

/**
 * Loads JSON from disk. Missing files return {} by default.
 * Invalid JSON throws with file context.
 */
export const loadJsonSafe = async <T extends JsonObject = JsonObject>(
  filePath: string
): Promise<T> => {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      throw new Error(`Top-level JSON value is not an object in ${filePath}`);
    }

    return parsed as T;
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code === "ENOENT") {
      return {} as T;
    }
    throw new Error(`Failed to read/parse JSON at ${filePath}: ${err.message}`);
  }
};

/**
 * Writes JSON with deterministic indentation and trailing newline.
 */
export const saveJson = async (
  filePath: string,
  data: unknown
): Promise<void> => {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
};

/**
 * Flattens nested objects into dot-delimited key/value pairs.
 */
export const flatten = (
  obj: JsonObject,
  prefix = ""
): FlatTranslations => {
  const result: FlatTranslations = {};

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flatten(value as JsonObject, fullKey));
    } else {
      result[fullKey] = String(value ?? "");
    }
  }

  return result;
};

/**
 * Rebuilds nested objects from dot-delimited key/value pairs.
 */
export const unflatten = (flat: FlatTranslations): JsonObject => {
  const result: JsonObject = {};

  for (const key of Object.keys(flat)) {
    const parts = key.split(".");
    let cursor: JsonObject = result;

    for (let i = 0; i < parts.length; i += 1) {
      const part = parts[i];
      if (i === parts.length - 1) {
        cursor[part] = flat[key];
      } else {
        const next = cursor[part];
        if (!next || typeof next !== "object" || Array.isArray(next)) {
          cursor[part] = {};
        }
        cursor = cursor[part] as JsonObject;
      }
    }
  }

  return result;
};

/**
 * Recursively sorts object keys for deterministic output.
 */
export const sortObject = <T>(obj: T): T => {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return obj;
  }

  const sorted = Object.keys(obj as JsonObject)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObject((obj as JsonObject)[key]);
      return acc;
    }, {} as JsonObject);

  return sorted as T;
};

/**
 * Returns sorted child directory names for a folder.
 * Missing folders return [] when suppressMissing is true.
 */
export const getSubdirectoryNames = async (
  baseDir: string,
  options: { suppressMissing?: boolean } = {}
): Promise<string[]> => {
  try {
    const entries = await fs.readdir(baseDir, { withFileTypes: true });
    return entries
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (options.suppressMissing && err.code === "ENOENT") {
      return [];
    }
    throw error;
  }
};
