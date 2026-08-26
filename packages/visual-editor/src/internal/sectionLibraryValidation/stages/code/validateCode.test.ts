import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { Project } from "ts-morph";
import { createTempRoot } from "../../testUtils.ts";
import {
  evaluateDeniedPackages,
  evaluateForNodeBuiltins,
  evaluateUnsupportedPackageImports,
} from "./importRules.ts";
import { extractImportReferences, validateCode } from "./validateCode.ts";

describe("extractImportReferences", () => {
  it("extracts supported import syntax", () => {
    const sourceFile = createSourceFile([
      'import value from "koa";',
      'export { readFile } from "node:fs/promises";',
      'require("express/router");',
      'import("playwright-core/lib");',
    ]);

    expect(
      extractImportReferences(sourceFile, "source.ts").map(
        ({ moduleSpecifier, syntaxKind }) => [moduleSpecifier, syntaxKind]
      )
    ).toEqual([
      ["koa", "import"],
      ["node:fs/promises", "export"],
      ["express/router", "require"],
      ["playwright-core/lib", "dynamic-import"],
    ]);
  });

  it("marks type-only imports and exports as isTypeOnly", () => {
    const sourceFile = createSourceFile([
      'import type { Stats } from "node:fs";',
      'export type { Stats } from "node:fs";',
    ]);

    expect(
      extractImportReferences(sourceFile, "source.ts").map(
        ({ isTypeOnly }) => isTypeOnly
      )
    ).toEqual([true, true]);
  });

  it("marks mixed imports as runtime imports", () => {
    const sourceFile = createSourceFile([
      'import { type PathLike, readFile } from "fs";',
    ]);

    expect(extractImportReferences(sourceFile, "source.ts")[0]).toMatchObject({
      isTypeOnly: false,
      line: 1,
      column: 41,
    });
  });
});

describe("evaluateForNodeBuiltins", () => {
  it("rejects a runtime Node built-in", () => {
    expect(evaluateForNodeBuiltins(reference("node:path"))).toMatchObject([
      { rule: "imports/node-builtin" },
    ]);
  });

  it("allows a type-only Node built-in", () => {
    expect(
      evaluateForNodeBuiltins({ ...reference("node:path"), isTypeOnly: true })
    ).toEqual([]);
  });
});

describe("evaluateDeniedPackages", () => {
  it("rejects a denied package subpath", () => {
    expect(
      evaluateDeniedPackages(reference("@nestjs/core/testing"))
    ).toMatchObject([{ rule: "imports/denied-package" }]);
  });

  it("allows a package with a similar name", () => {
    expect(evaluateDeniedPackages(reference("expressive/subpath"))).toEqual([]);
  });

  it("allows a type-only denied package", () => {
    expect(
      evaluateDeniedPackages({ ...reference("express"), isTypeOnly: true })
    ).toEqual([]);
  });
});

describe("evaluateUnsupportedPackageImports", () => {
  it("rejects a runtime package import alias", () => {
    expect(
      evaluateUnsupportedPackageImports(reference("#server"))
    ).toMatchObject([{ rule: "imports/unsupported-package-import" }]);
  });

  it.each(["./local", "/absolute"])(
    "preserves local classification for %s",
    (moduleSpecifier) => {
      expect(
        evaluateUnsupportedPackageImports(reference(moduleSpecifier))
      ).toEqual([]);
    }
  );
});

describe("validateCode", () => {
  it("returns no issues when the library directory is missing", () => {
    expect(validateCode(createTempRoot())).toEqual([]);
  });

  it("ignores non-source files", () => {
    const rootDir = createTempRoot();
    writeSourceFile(rootDir, "Unsafe.txt", "eval(code);");

    expect(validateCode(rootDir)).toEqual([]);
  });

  it("excludes every .generated directory", () => {
    const rootDir = createTempRoot();
    writeSourceFile(rootDir, ".generated/Unsafe.ts", "eval(code);");
    writeSourceFile(rootDir, "nested/.generated/Unsafe.ts", "eval(code);");

    expect(validateCode(rootDir)).toEqual([]);
  });

  it.each([
    ["innerHTML assignment", "node.innerHTML = html;", "xss/html-assignment"],
    ["outerHTML assignment", "node.outerHTML = html;", "xss/html-assignment"],
    [
      "innerHTML element assignment",
      "node['innerHTML'] = html;",
      "xss/html-assignment",
    ],
    [
      "outerHTML element assignment",
      "node[`outerHTML`] = html;",
      "xss/html-assignment",
    ],
    [
      "insertAdjacentHTML",
      "node.insertAdjacentHTML('beforeend', html);",
      "xss/insert-adjacent-html",
    ],
    ["document.write", "document.write(html);", "xss/document-write"],
    ["eval", "eval(code);", "xss/eval"],
    ["Function constructor", "new Function(code);", "xss/function-constructor"],
    ["Function call", "Function(code);", "xss/function-constructor"],
    ["string timer", "setTimeout('run()', 1);", "xss/string-timer"],
    [
      "dangerouslySetInnerHTML",
      "export const View = () => <div dangerouslySetInnerHTML={{ __html: html }} />;",
      "xss/dangerously-set-inner-html",
    ],
    [
      "javascript URL",
      'export const View = () => <a href="javascript:run()" />;',
      "xss/javascript-url",
    ],
  ])("reports exactly one issue for %s", (_name, source, rule) => {
    const rootDir = createTempRoot();
    writeSourceFile(rootDir, "Unsafe.tsx", source);

    const issues = validateCode(rootDir);

    expect(issues).toHaveLength(1);
    expect(issues[0]).toMatchObject({ rule });
  });

  it("ignores representative safe XSS lookalikes", () => {
    const rootDir = createTempRoot();
    writeSourceFile(
      rootDir,
      "Safe.tsx",
      [
        "const safeInnerHTML = 'ok';",
        "setTimeout(() => run(), 1);",
        'export const View = () => <a href="https://example.com" />;',
      ].join("\n")
    );

    expect(validateCode(rootDir)).toEqual([]);
  });
});

const createSourceFile = (lines: string[]) => {
  const project = new Project({ useInMemoryFileSystem: true });
  return project.createSourceFile("/source.ts", lines.join("\n"));
};

const reference = (moduleSpecifier: string) => ({
  moduleSpecifier,
  syntaxKind: "import" as const,
  isTypeOnly: false,
  filePath: "source.ts",
  line: 1,
  column: 1,
});

const writeSourceFile = (
  rootDir: string,
  relativePath: string,
  source: string
): void => {
  fs.outputFileSync(path.join(rootDir, "src", "library", relativePath), source);
};
