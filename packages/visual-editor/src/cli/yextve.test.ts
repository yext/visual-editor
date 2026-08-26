import path from "node:path";
import fs from "fs-extra";
import { describe, expect, it } from "vitest";
import { createTempRoot } from "../internal/sectionLibraryValidation/testUtils.ts";
import { runCli } from "./yextve.ts";
import packageJson from "../../package.json" with { type: "json" };

describe("yextve", () => {
  it("prints help and version", () => {
    const help = invoke(["--help"]);
    expect(help.exitCode).toBe(0);
    expect(help.stdout).toContain(
      "npx --package=@yext/visual-editor@latest yextve validate"
    );
    expect(help.stdout).not.toContain("scripts");
  });

  it("prints version", () => {
    const version = invoke(["--version"]);
    expect(version).toEqual({
      exitCode: 0,
      stdout: `${packageJson.version}\n`,
      stderr: "",
    });
  });

  it.each([
    { args: [] },
    { args: ["unknown"] },
    { args: ["validate", "project-path"] },
    { args: ["validate", "--unknown"] },
  ])("returns usage exit 2 for invalid arguments: $args", ({ args }) => {
    const result = invoke(args);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Usage:");
  });

  it("renders all skipped stages and succeeds", () => {
    const result = invoke([
      "validate",
      "--skip-api-check",
      "--skip-repo-structure-check",
      "--skip-code-check",
    ]);

    expect(result.exitCode).toBe(0);
    expect(result.stdout.match(/skipped/g)).toHaveLength(3);
    expect(result.stdout).toContain("Validation passed. 0 errors.");
    expect(result.stdout).not.toContain("\u001b[");
  });

  it("skips only API validation in Yext CI", () => {
    const rootDir = createTempRoot();
    fs.outputFileSync(
      path.join(rootDir, "src", "library", "Unsafe.ts"),
      "eval(code);"
    );

    const result = invoke(["validate", "--yextCI"], rootDir);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("Library metadata: skipped");
    expect(result.stdout).toContain("Repository structure: failed");
    expect(result.stdout).toContain("Code checks: failed");
  });
});

// invoke calls the cli and records stdout and stderr
const invoke = (args: string[], rootDir: string = createTempRoot()) => {
  let stdout = "";
  let stderr = "";
  const exitCode = runCli(
    args,
    {
      stdout: {
        isTTY: false,
        write: (value) => {
          stdout += value;
          return true;
        },
      },
      stderr: {
        write: (value) => {
          stderr += value;
          return true;
        },
      },
    },
    rootDir
  );
  return { exitCode, stdout, stderr };
};
