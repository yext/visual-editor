import fs from "node:fs";
import path from "node:path";
import type { JsonRecord } from "./types.ts";

/** Requires exactly one supported lockfile and a matching packageManager declaration when present. */
export const detectPackageManager = (
  rootDirectory: string,
  targetPackage: JsonRecord
): "npm" | "pnpm" => {
  for (const unsupported of [
    "yarn.lock",
    "bun.lock",
    "bun.lockb",
    "npm-shrinkwrap.json",
  ]) {
    if (fs.existsSync(path.join(rootDirectory, unsupported))) {
      throw new Error(
        `Unsupported or ambiguous package manager lockfile: ${path.join(rootDirectory, unsupported)}`
      );
    }
  }
  const npm = fs.existsSync(path.join(rootDirectory, "package-lock.json"));
  const pnpm = fs.existsSync(path.join(rootDirectory, "pnpm-lock.yaml"));
  if (npm === pnpm) {
    throw new Error(
      `Expected exactly one npm or pnpm lockfile in ${rootDirectory}`
    );
  }
  const manager = npm ? "npm" : "pnpm";
  if (
    targetPackage.packageManager !== undefined &&
    (typeof targetPackage.packageManager !== "string" ||
      !targetPackage.packageManager.startsWith(`${manager}@`))
  ) {
    throw new Error(
      `packageManager conflicts with ${manager} lockfile in ${rootDirectory}`
    );
  }
  return manager;
};
