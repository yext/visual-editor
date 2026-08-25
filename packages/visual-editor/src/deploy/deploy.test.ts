import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import prompts from "prompts";
import { deploy } from "./deploy.ts";
import type { DeployConfig } from "./config.ts";

vi.mock("prompts");

const config: DeployConfig = {
  accountId: "123",
  universe: "sandbox",
  apiKey: "api-key",
  origin: "origin",
  partition: "US",
  apiHost: "https://sbx-api.yextapis.com",
};
const successfulResponse = JSON.stringify({
  meta: { errors: [] },
  response: {},
});

let rootDir: string;
let sourceCommitHash: string;

beforeEach(() => {
  rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "deploy-templates-test-"));
  execFileSync("git", ["init", "--quiet", rootDir]);
  execFileSync("git", [
    "-C",
    rootDir,
    "remote",
    "add",
    "origin",
    "git@github.com:yext/visual-editor.git",
  ]);
  execFileSync("git", [
    "-C",
    rootDir,
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.com",
    "commit",
    "--allow-empty",
    "--quiet",
    "-m",
    "test",
  ]);
  sourceCommitHash = execFileSync("git", ["-C", rootDir, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  fs.mkdirSync(path.join(rootDir, "src", "registry"), { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, "src", "registry", "library.json"),
    JSON.stringify({
      id: "library/123",
      displayName: "Library",
      description: "Test",
    })
  );
  vi.spyOn(process, "cwd").mockReturnValue(rootDir);
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(rootDir, { recursive: true, force: true });
});

describe("deploy", () => {
  it("creates a section library revision with Git source metadata", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(successfulResponse, { status: 200 }))
      .mockResolvedValueOnce(new Response(successfulResponse, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await deploy(config);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      new URL(
        "https://sbx-api.yextapis.com/v2/accounts/me/sectionLibraries/library%2F123?v=20260819&api_key=api-key"
      ),
      expect.any(Request)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL(
        "https://sbx-api.yextapis.com/v2/accounts/me/sectionLibraries/library%2F123/revisions?v=20260819&api_key=api-key"
      ),
      expect.any(Request)
    );
    const request = fetchMock.mock.calls[1][1] as Request;
    expect(request.method).toBe("POST");
    expect(request.headers.get("content-type")).toBe("application/json");
    expect(await request.text()).toBe(
      JSON.stringify({
        sourceGitOrigin: "git@github.com:yext/visual-editor.git",
        sourceCommitHash,
      })
    );
  });

  it("fails when library.json has no ID", async () => {
    fs.writeFileSync(
      path.join(rootDir, "src", "registry", "library.json"),
      "{}"
    );

    await expect(deploy(config)).rejects.toThrow(/string "id"/);
  });

  it("does not print the API response body without verbose mode", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(successfulResponse, { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              meta: {
                errors: [
                  {
                    code: 100000,
                    type: "BAD_REQUEST",
                    message: "Invalid request",
                    name: "invalidRequest",
                  },
                ],
              },
            }),
            { status: 400 }
          )
        )
    );

    await expect(deploy(config)).rejects.toThrow("Invalid request");
    expect(error).not.toHaveBeenCalled();
  });

  it("explains how to resolve missing section library write permissions", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(successfulResponse, { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(
            JSON.stringify({
              meta: {
                errors: [
                  {
                    code: 104030,
                    type: "FORBIDDEN",
                    message: "Missing permission",
                    name: "permissionDenied",
                  },
                ],
              },
            }),
            { status: 403 }
          )
        )
    );

    await expect(deploy(config)).rejects.toThrow(
      /Yext API key does not have required permissions\. Add Section Library API write access permissions to your App in Developer Console\./
    );
  });

  it("explains missing section library write permissions during lookup", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            meta: {
              errors: [
                {
                  code: 104030,
                  type: "FORBIDDEN",
                  message: "Missing permission",
                  name: "permissionDenied",
                },
              ],
            },
          }),
          { status: 403 }
        )
      )
    );

    await expect(deploy(config)).rejects.toThrow(
      /Yext API key does not have required permissions\./
    );
  });

  it("uses the API message for error code 104001", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValueOnce(
        new Response(
          JSON.stringify({
            meta: {
              errors: [
                {
                  code: 104001,
                  type: "BAD_REQUEST",
                  message: "The exact API error message.",
                  name: "invalidRequest",
                },
              ],
            },
          }),
          { status: 400 }
        )
      )
    );

    await expect(deploy(config)).rejects.toThrow(
      "The exact API error message."
    );
  });

  it("prints parsed API errors in verbose mode", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const responseBody = JSON.stringify({
      meta: {
        errors: [
          {
            code: 100000,
            type: "BAD_REQUEST",
            message: "Invalid request",
            name: "invalidRequest",
          },
        ],
      },
    });
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(successfulResponse, { status: 200 })
        )
        .mockResolvedValueOnce(new Response(responseBody, { status: 400 }))
    );

    await expect(deploy(config, true)).rejects.toThrow("Invalid request");
    expect(error).toHaveBeenCalledWith(
      '[debug] API Errors: [{"code":100000,"type":"BAD_REQUEST","message":"Invalid request","name":"invalidRequest"}]'
    );
  });

  it("creates a missing section library after confirmation", async () => {
    vi.mocked(prompts).mockResolvedValueOnce({ value: true });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(successfulResponse, { status: 404 }))
      .mockResolvedValueOnce(new Response(successfulResponse, { status: 201 }))
      .mockResolvedValueOnce(new Response(successfulResponse, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await deploy(config);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL(
        "https://sbx-api.yextapis.com/v2/accounts/me/sectionLibraries?sectionLibraryId=library%2F123&v=20260819&api_key=api-key"
      ),
      expect.any(Request)
    );
    const request = fetchMock.mock.calls[1][1] as Request;
    expect(request.method).toBe("POST");
    expect(await request.text()).toBe(
      JSON.stringify({ displayName: "Library", description: "Test" })
    );
  });
});
