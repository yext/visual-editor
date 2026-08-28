import fs from "node:fs";
import path from "node:path";
import { parse, stringify } from "yaml";

// Reads and writes the `.yextrc` credentials file (YAML) shared with the
// @yext/pages CLI. Unknown keys are preserved on write so we never clobber
// values another tool relies on.

export interface Yextrc {
  accountId?: string;
  universe?: string;
  apiKey?: string;
  origin?: string;
}

const YEXTRC_FILENAME = ".yextrc";

export function yextrcPath(rootDir: string): string {
  return path.join(rootDir, YEXTRC_FILENAME);
}

function readRaw(filePath: string): Record<string, unknown> {
  if (!fs.existsSync(filePath)) {
    return {};
  }
  const parsed = parse(fs.readFileSync(filePath, "utf8"));
  return parsed && typeof parsed === "object"
    ? (parsed as Record<string, unknown>)
    : {};
}

/** Read the deploy configuration fields from `.yextrc`. Missing file -> {}. */
export function readYextrc(rootDir: string): Yextrc {
  const raw = readRaw(yextrcPath(rootDir));
  const asString = (value: unknown): string | undefined =>
    typeof value === "string" ? value : undefined;
  return {
    accountId: asString(raw.accountId),
    universe: asString(raw.universe),
    apiKey: asString(raw.apiKey),
    origin: asString(raw.origin),
  };
}

/**
 * Merge the given fields into `.yextrc`, preserving any existing keys.
 * Undefined values are ignored so callers can pass only what changed.
 */
export function updateYextrc(rootDir: string, updates: Yextrc): void {
  const filePath = yextrcPath(rootDir);
  const merged = readRaw(filePath);
  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      merged[key] = value;
    }
  }
  fs.writeFileSync(filePath, stringify(merged), "utf8");
}
