/**
 * Plans and installs the package.json dependency changes required by a
 * converted library. Puck follows the installed Visual Editor, while
 * react-i18next is upgraded when the target allows an older version.
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import semver from "semver";
import { detectPackageManager } from "./packageManager.ts";
import { formatJson, isRecord, readJson } from "./shared.ts";
import type { JsonRecord } from "./types.ts";

type PackageUpgrade = {
  name: string;
  bucket: JsonRecord;
  previous?: string;
  next: string;
};

/**
 * Reads project package files and plans the dependency upgrade.
 *
 * 1. Check that the target uses a supported package manager and has Visual Editor installed.
 * 2. Match Puck to the installed Visual Editor package.
 * 3. Upgrade older react-i18next ranges to the required peer range.
 */
export const planPackageUpgrades = (
  rootDirectory: string
): {
  manager: "npm" | "pnpm";
  lockPath: string;
  packagePath: string;
  targetPackage: JsonRecord;
  upgrades: PackageUpgrade[];
} => {
  const packagePath = path.join(rootDirectory, "package.json");
  const targetPackage = readJson(packagePath, "target package manifest");
  if (!isRecord(targetPackage)) {
    throw new Error(
      `Target package manifest must be a JSON object: ${packagePath}`
    );
  }
  const manager = detectPackageManager(rootDirectory, targetPackage);
  const lockPath = path.join(
    rootDirectory,
    manager === "npm" ? "package-lock.json" : "pnpm-lock.yaml"
  );
  const installedVisualEditorPath = path.join(
    rootDirectory,
    "node_modules",
    "@yext",
    "visual-editor",
    "package.json"
  );
  if (!fs.existsSync(installedVisualEditorPath)) {
    throw new Error(
      `Install target dependencies before converting: missing ${installedVisualEditorPath}`
    );
  }
  const installedVisualEditor = readJson(
    installedVisualEditorPath,
    "installed Visual Editor package"
  );
  if (!isRecord(installedVisualEditor)) {
    throw new Error(
      `Installed Visual Editor package must be a JSON object: ${installedVisualEditorPath}`
    );
  }
  /** Finds exactly one dependency declaration and records its original version. */
  const dependency = (
    name: string,
    required = true
  ): { bucket: JsonRecord; previous: string } | undefined => {
    const matches = [targetPackage.dependencies, targetPackage.devDependencies]
      .filter(isRecord)
      .filter((bucket) => Object.hasOwn(bucket, name));
    if (
      matches.length > 1 ||
      (matches.length === 1 && typeof matches[0][name] !== "string") ||
      (required && matches.length === 0)
    ) {
      throw new Error(
        `${packagePath} must declare ${name} exactly once in dependencies or devDependencies`
      );
    }
    return matches.length === 1
      ? { bucket: matches[0], previous: matches[0][name] }
      : undefined;
  };

  dependency("@yext/visual-editor");
  const puck = dependency("@puckeditor/core")!;
  if (
    !isRecord(installedVisualEditor.dependencies) ||
    typeof installedVisualEditor.dependencies["@puckeditor/core"] !==
      "string" ||
    !installedVisualEditor.dependencies["@puckeditor/core"].trim()
  ) {
    throw new Error(
      `Installed Visual Editor must declare @puckeditor/core in dependencies: ${installedVisualEditorPath}`
    );
  }
  const upgrades: PackageUpgrade[] = [
    {
      name: "@puckeditor/core",
      bucket: puck.bucket,
      previous: puck.previous,
      next: installedVisualEditor.dependencies["@puckeditor/core"] as string,
    },
  ];

  const reactI18next = dependency("react-i18next", false);
  const requiredReactI18next = "^17.0.13";
  if (reactI18next) {
    const minimum = semver.minVersion(reactI18next.previous);
    if (!minimum) {
      throw new Error(
        `Cannot determine the react-i18next version in ${packagePath}: ${reactI18next.previous}`
      );
    }
    if (semver.lt(minimum, "17.0.13")) {
      upgrades.push({
        name: "react-i18next",
        bucket: reactI18next.bucket,
        previous: reactI18next.previous,
        next: requiredReactI18next,
      });
    } else if (
      !semver.intersects(reactI18next.previous, requiredReactI18next)
    ) {
      throw new Error(
        `${packagePath} declares react-i18next ${reactI18next.previous}, which is incompatible with ${requiredReactI18next}`
      );
    }
  } else {
    if (!isRecord(targetPackage.dependencies)) targetPackage.dependencies = {};
    upgrades.push({
      name: "react-i18next",
      bucket: targetPackage.dependencies,
      previous: undefined,
      next: requiredReactI18next,
    });
  }
  return { manager, lockPath, packagePath, targetPackage, upgrades };
};

/** Installs planned upgrades and returns a way to restore package files if library writing fails. */
export const installPackageUpgrades = (
  rootDirectory: string,
  plan: ReturnType<typeof planPackageUpgrades>,
  installDependencies?: (manager: "npm" | "pnpm", directory: string) => void
): (() => void) => {
  const originalPackage = fs.readFileSync(plan.packagePath, "utf8");
  const originalLock = fs.readFileSync(plan.lockPath);
  const restorePackageFiles = (): void => {
    fs.writeFileSync(plan.packagePath, originalPackage);
    fs.writeFileSync(plan.lockPath, originalLock);
  };
  for (const { name, bucket, next } of plan.upgrades) bucket[name] = next;
  fs.writeFileSync(plan.packagePath, formatJson(plan.targetPackage));
  try {
    if (installDependencies) {
      installDependencies(plan.manager, rootDirectory);
    } else {
      const result = spawnSync(plan.manager, ["install", "--ignore-scripts"], {
        cwd: rootDirectory,
        stdio: "inherit",
      });
      if (result.error || result.status !== 0) {
        throw new Error(
          `${plan.manager} install failed: ${result.error?.message ?? `exit status ${result.status}`}`
        );
      }
    }
  } catch (error) {
    restorePackageFiles();
    throw error;
  }
  return restorePackageFiles;
};
