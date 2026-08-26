import { builtinModules } from "node:module";
import type { ValidationIssue } from "../../types.ts";

// TODO: Review this deny list
const deniedPackages = new Set([
  "child-process-promise",
  "cross-spawn",
  "execa",
  "shelljs",
  "@hapi/hapi",
  "@nestjs/core",
  "express",
  "fastify",
  "koa",
  "electron",
  "playwright",
  "playwright-core",
  "puppeteer",
  "puppeteer-core",
  "selenium-webdriver",
  "chokidar",
  "fs-extra",
  "glob",
  "rimraf",
  "better-sqlite3",
  "ioredis",
  "mongoose",
  "mysql2",
  "pg",
  "redis",
  "sqlite3",
]);

export type ImportSyntaxKind =
  | "import"
  | "export"
  | "require"
  | "dynamic-import";

export type ImportReference = {
  moduleSpecifier: string;
  syntaxKind: ImportSyntaxKind;
  isTypeOnly: boolean;
  filePath: string;
  line: number;
  column: number;
};

type ClassifiedImport =
  | { kind: "local" }
  | { kind: "unsupported-package-import" }
  | { kind: "node"; moduleName: string }
  | { kind: "package"; packageName: string };

const nodeBuiltins = new Set(
  builtinModules.map((name) =>
    name.startsWith("node:") ? name.slice(5) : name
  )
);

const classifyImport = (moduleSpecifier: string): ClassifiedImport => {
  if (moduleSpecifier.startsWith(".") || moduleSpecifier.startsWith("/")) {
    return { kind: "local" };
  }
  if (moduleSpecifier.startsWith("#")) {
    return { kind: "unsupported-package-import" };
  }
  const withoutNodePrefix = moduleSpecifier.startsWith("node:")
    ? moduleSpecifier.slice(5)
    : moduleSpecifier;
  const nodeRoot = [...nodeBuiltins].find(
    (name) =>
      withoutNodePrefix === name || withoutNodePrefix.startsWith(`${name}/`)
  );
  if (nodeRoot) {
    return { kind: "node", moduleName: withoutNodePrefix };
  }
  const parts = moduleSpecifier.split("/");
  return {
    kind: "package",
    packageName: moduleSpecifier.startsWith("@")
      ? parts.slice(0, 2).join("/")
      : parts[0],
  };
};

const createIssue = (
  reference: ImportReference,
  rule: string,
  message: string
): ValidationIssue => ({
  category: "code",
  filePath: reference.filePath,
  line: reference.line,
  column: reference.column,
  message,
  rule,
});

export const evaluateForNodeBuiltins = (
  reference: ImportReference
): ValidationIssue[] => {
  if (reference.isTypeOnly) {
    return [];
  }
  const classifiedImport = classifyImport(reference.moduleSpecifier);
  return classifiedImport.kind === "node"
    ? [
        createIssue(
          reference,
          "imports/node-builtin",
          `Node built-in module '${reference.moduleSpecifier}' cannot run in Section Library browser code.`
        ),
      ]
    : [];
};

export const evaluateUnsupportedPackageImports = (
  reference: ImportReference
): ValidationIssue[] => {
  if (
    reference.isTypeOnly ||
    classifyImport(reference.moduleSpecifier).kind !==
      "unsupported-package-import"
  ) {
    return [];
  }

  return [
    createIssue(
      reference,
      "imports/unsupported-package-import",
      `Package import alias '${reference.moduleSpecifier}' cannot be resolved by Section Library validation.`
    ),
  ];
};

export const evaluateDeniedPackages = (
  reference: ImportReference
): ValidationIssue[] => {
  if (reference.isTypeOnly) {
    return [];
  }

  const classifiedImport = classifyImport(reference.moduleSpecifier);

  if (
    classifiedImport.kind !== "package" ||
    !deniedPackages.has(classifiedImport.packageName)
  ) {
    return [];
  }

  return [
    createIssue(
      reference,
      "imports/denied-package",
      `Package '${classifiedImport.packageName}' is not permitted in Section Library code.`
    ),
  ];
};
