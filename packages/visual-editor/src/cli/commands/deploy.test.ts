import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import prompts from "prompts";
import { runCli } from "../yextve.ts";

vi.mock("prompts");

let rootDir: string;

function response(response: object, status = 200): Response {
  return new Response(JSON.stringify({ meta: { errors: [] }, response }), {
    status,
  });
}

async function invokeDeploy(): Promise<{ exitCode: number; output: string }> {
  let output = "";
  const write = (value: string) => {
    output += value;
    return true;
  };
  const exitCode = await runCli(
    ["deploy"],
    {
      stdout: { isTTY: false, write },
      stderr: { isTTY: false, write },
    },
    rootDir
  );
  return { exitCode, output };
}

beforeEach(() => {
  rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "deploy-command-test-"));
  for (const name of [
    "YEXT_ACCOUNT_ID",
    "YEXT_UNIVERSE",
    "YEXT_API_KEY",
    "YEXT_ORIGIN",
  ]) {
    vi.stubEnv(name, undefined);
  }
  vi.spyOn(process, "cwd").mockReturnValue(rootDir);
  vi.mocked(prompts).mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  fs.rmSync(rootDir, { recursive: true, force: true });
});

describe("yextve deploy without terminal input", () => {
  it.each(["environment", ".yextrc"])(
    "creates a revision and waits for a successful build using %s configuration",
    async (source) => {
      execFileSync("git", ["init", "--quiet", rootDir]);
      execFileSync("git", [
        "-C",
        rootDir,
        "remote",
        "add",
        "origin",
        "https://example.com/library.git",
      ]);
      fs.mkdirSync(path.join(rootDir, "src", "library"), { recursive: true });
      fs.writeFileSync(
        path.join(rootDir, "src", "library", "library.json"),
        JSON.stringify({
          id: "library/123",
          displayName: "Library",
          description: "Test",
        })
      );
      if (source === "environment") {
        vi.stubEnv("YEXT_ACCOUNT_ID", "123");
        vi.stubEnv("YEXT_UNIVERSE", "sandbox");
        vi.stubEnv("YEXT_API_KEY", "secret-key");
        vi.stubEnv("YEXT_ORIGIN", "origin");
      } else {
        fs.writeFileSync(
          path.join(rootDir, ".yextrc"),
          "accountId: '123'\nuniverse: sandbox\napiKey: secret-key\norigin: origin\n"
        );
      }
      execFileSync("git", ["-C", rootDir, "add", "."]);
      execFileSync("git", [
        "-C",
        rootDir,
        "-c",
        "user.name=Test",
        "-c",
        "user.email=test@example.com",
        "commit",
        "--quiet",
        "-m",
        "test",
      ]);
      const yextrcPath = path.join(rootDir, ".yextrc");
      const savedConfig = fs.existsSync(yextrcPath)
        ? fs.readFileSync(yextrcPath, "utf8")
        : undefined;
      const revisionName =
        "accounts/123/sectionLibraries/library-123/revisions/one";
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce(
          response({ displayName: "Library", description: "Test" })
        )
        .mockResolvedValueOnce(response({ sectionLibraryRevisions: [] }))
        .mockResolvedValueOnce(
          response(
            { name: revisionName, status: "STATUS_BUILD_PROCESSING" },
            201
          )
        )
        .mockResolvedValueOnce(
          response({ name: revisionName, status: "STATUS_BUILD_SUCCEEDED" })
        );
      vi.stubGlobal("fetch", fetchMock);

      const result = await invokeDeploy();

      expect(result.exitCode).toBe(0);
      expect(result.output).not.toContain("secret-key");
      expect(prompts).not.toHaveBeenCalled();
      expect(fetchMock).toHaveBeenCalledTimes(4);
      expect(fs.existsSync(yextrcPath)).toBe(source === ".yextrc");
      if (savedConfig !== undefined) {
        expect(fs.readFileSync(yextrcPath, "utf8")).toBe(savedConfig);
      }
    }
  );

  it("fails on incomplete configuration before repository or API work", async () => {
    vi.stubEnv("YEXT_ACCOUNT_ID", "123");
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const result = await invokeDeploy();

    expect(result.exitCode).toBe(1);
    expect(result.output).toContain("Universe is required");
    expect(prompts).not.toHaveBeenCalled();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(fs.existsSync(path.join(rootDir, ".yextrc"))).toBe(false);
  });
});
