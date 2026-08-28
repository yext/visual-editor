import path from "node:path";
import fs from "fs-extra";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTempRoot } from "../internal/sectionLibraryValidation/testUtils.ts";
import { runCli } from "./yextve.ts";
import packageJson from "../../package.json" with { type: "json" };

const { resolveConfig, deploy, pollRevision } = vi.hoisted(() => ({
  resolveConfig: vi.fn(),
  deploy: vi.fn(),
  pollRevision: vi.fn(),
}));

vi.mock("../internal/deploy/config.ts", () => ({ resolveConfig }));
vi.mock("../internal/deploy/deploy.ts", () => ({ deploy }));
vi.mock("../internal/deploy/pollRevision.ts", () => ({ pollRevision }));

describe("yextve", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    resolveConfig.mockResolvedValue({});
    deploy.mockResolvedValue(undefined);
  });

  it("prints help", async () => {
    const help = await invoke(["--help"]);
    expect(help.exitCode).toBe(0);
    expect(help.stdout).toContain("deploy");
    expect(help.stdout).toContain("validate");
    expect(help.stdout).toContain("--version");
    expect(help.stdout).not.toContain("--verbose");
    expect(help.stdout).not.toContain("--skip-api-check");
  });

  it("prints command-specific help", async () => {
    const deployHelp = await invoke(["deploy", "--help"]);
    expect(deployHelp.exitCode).toBe(0);
    expect(deployHelp.stdout).toContain("yextve deploy [--verbose]");
    expect(deployHelp.stdout).toContain("YEXT_ACCOUNT_ID / accountId");
    expect(deployHelp.stdout).not.toContain("--skip-api-check");

    const validateHelp = await invoke(["validate", "--help"]);
    expect(validateHelp.exitCode).toBe(0);
    expect(validateHelp.stdout).toContain("yextve validate [--skip-api-check]");
    expect(validateHelp.stdout).toContain("--skip-repo-structure-check");
    expect(validateHelp.stdout).not.toContain("YEXT_ACCOUNT_ID");
  });

  it("prints version", async () => {
    const version = await invoke(["--version"]);
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
  ])("returns usage exit 2 for invalid arguments: $args", async ({ args }) => {
    const result = await invoke(args);
    expect(result.exitCode).toBe(2);
    expect(result.stderr).toContain("Usage:");
  });

  it("runs deploy with verbose output when requested", async () => {
    const config = {};
    resolveConfig.mockResolvedValue(config);
    deploy.mockResolvedValue({ name: "revision/1" });

    expect((await invoke(["deploy"])).exitCode).toBe(0);
    expect((await invoke(["deploy", "--verbose"])).exitCode).toBe(0);
    expect((await invoke(["deploy", "-v"])).exitCode).toBe(0);
    expect(deploy.mock.calls.map(([, verbose]) => verbose)).toEqual([
      false,
      true,
      true,
    ]);
    expect(pollRevision.mock.calls).toEqual([
      [config, "revision/1", false],
      [config, "revision/1", true],
      [config, "revision/1", true],
    ]);
  });

  it("reports deploy errors", async () => {
    resolveConfig.mockRejectedValueOnce(new Error("deploy failed"));
    const result = await invoke(["deploy"]);

    expect(result).toEqual({
      exitCode: 1,
      stdout: "",
      stderr: "error: deploy failed\n",
    });
  });

  it("renders all skipped stages and succeeds", async () => {
    const result = await invoke([
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

  it("skips only API validation in Yext CI", async () => {
    const rootDir = createTempRoot();
    fs.outputFileSync(
      path.join(rootDir, "src", "library", "Unsafe.ts"),
      "eval(code);"
    );

    const result = await invoke(["validate", "--yextCI"], rootDir);

    expect(result.exitCode).toBe(1);
    expect(result.stdout).toContain("Library metadata: skipped");
    expect(result.stdout).toContain("Repository structure: failed");
    expect(result.stdout).toContain("Code checks: failed");
  });
});

// invoke calls the cli and records stdout and stderr
const invoke = async (args: string[], rootDir: string = createTempRoot()) => {
  let stdout = "";
  let stderr = "";
  const exitCode = await runCli(
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
        isTTY: false,
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
