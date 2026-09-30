import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { createTempRoot } from "./testUtils.ts";
import {
  createValidationContext,
  sortValidationIssues,
  validateSectionLibrary,
} from "./validateSectionLibrary.ts";

describe("validateSectionLibrary", () => {
  it("combines issues from every stage", () => {
    const rootDir = createTempRoot();
    fs.outputFileSync(
      path.join(rootDir, "src", "library", "Unsafe.ts"),
      "eval(code);"
    );

    const result = validateSectionLibrary(createValidationContext(rootDir));

    expect(new Set(result.issues.map((issue) => issue.category))).toEqual(
      new Set(["api", "structure", "code"])
    );
  });

  it("does not run explicitly skipped stages", () => {
    const context = createValidationContext(createTempRoot(), {
      skippedStages: ["api", "structure", "code"],
    });

    expect(validateSectionLibrary(context)).toMatchObject({
      issues: [],
      metadata: undefined,
      structure: undefined,
    });
  });

  it("skips API validation in Yext CI", () => {
    const rootDir = createTempRoot();
    fs.outputFileSync(
      path.join(
        rootDir,
        "src",
        "library",
        "layouts",
        "entity-layout",
        "preview.jpg"
      ),
      "image"
    );
    fs.outputFileSync(
      path.join(
        rootDir,
        "src",
        "library",
        "layouts",
        "entity-layout",
        "preview.png"
      ),
      "image"
    );
    const context = createValidationContext(rootDir, {
      yextCI: true,
      skippedStages: ["structure", "code"],
    });

    expect(validateSectionLibrary(context).issues).toEqual([]);
  });
});

describe("sortValidationIssues", () => {
  it("sorts findings by stage", () => {
    const issue = createIssue();

    expect(
      sortValidationIssues([
        { ...issue, category: "code" },
        { ...issue, category: "structure" },
        { ...issue, category: "api" },
      ]).map((value) => value.category)
    ).toEqual(["api", "structure", "code"]);
  });

  it("sorts findings by file path", () => {
    const issue = createIssue();

    expect(
      sortValidationIssues([
        { ...issue, filePath: "b.ts" },
        { ...issue, filePath: "a.ts" },
      ]).map((value) => value.filePath)
    ).toEqual(["a.ts", "b.ts"]);
  });

  it("sorts findings by source position", () => {
    const issue = createIssue();

    expect(
      sortValidationIssues([
        { ...issue, line: 2, column: 1 },
        { ...issue, line: 1, column: 2 },
        { ...issue, line: 1, column: 1 },
      ]).map(({ line, column }) => [line, column])
    ).toEqual([
      [1, 1],
      [1, 2],
      [2, 1],
    ]);
  });

  it("sorts equivalent findings by rule", () => {
    const issue = createIssue();

    expect(
      sortValidationIssues([
        { ...issue, rule: "rule/b" },
        { ...issue, rule: "rule/a" },
      ]).map((value) => value.rule)
    ).toEqual(["rule/a", "rule/b"]);
  });

  it("does not mutate the input", () => {
    const issue = createIssue();
    const issues = [
      { ...issue, filePath: "b.ts" },
      { ...issue, filePath: "a.ts" },
    ];

    sortValidationIssues(issues);

    expect(issues.map((value) => value.filePath)).toEqual(["b.ts", "a.ts"]);
  });
});

describe("createValidationContext", () => {
  it("uses default options", () => {
    const rootDir = createTempRoot();

    expect(createValidationContext(rootDir)).toEqual({
      rootDir,
      yextCI: false,
      skippedStages: new Set(),
    });
  });

  it("preserves explicitly skipped stages", () => {
    const context = createValidationContext(createTempRoot(), {
      skippedStages: ["structure", "code"],
    });

    expect([...context.skippedStages]).toEqual(["structure", "code"]);
  });

  it("adds API validation to skipped stages in Yext CI", () => {
    const context = createValidationContext(createTempRoot(), {
      yextCI: true,
      skippedStages: ["structure"],
    });

    expect([...context.skippedStages]).toEqual(["structure", "api"]);
  });
});

const createIssue = () => ({
  category: "structure" as const,
  filePath: "source.ts",
  line: 1,
  column: 1,
  message: "message",
  rule: "rule",
});
