import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import prompts from "prompts";
import { deploy } from "./deploy.ts";
import type { DeployConfig } from "./config.ts";

vi.mock("node:child_process", () => ({ execFileSync: vi.fn() }));
vi.mock("prompts");

const config: DeployConfig = {
  accountId: "123",
  universe: "sandbox",
  apiKey: "api-key",
  origin: "origin",
  partition: "US",
  apiHost: "https://sbx-api.yextapis.com",
};

let rootDir: string;

beforeEach(() => {
  rootDir = fs.mkdtempSync(path.join(os.tmpdir(), "deploy-templates-test-"));
  fs.mkdirSync(path.join(rootDir, "src", "registry"), { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, "src", "registry", "library.json"),
    JSON.stringify({
      id: "library/123",
      displayName: "Library",
      description: "Test",
    })
  );
  vi.mocked(execFileSync)
    .mockReturnValueOnce("git@github.com:yext/visual-editor.git\n")
    .mockReturnValueOnce("0123456789abcdef\n");
  vi.spyOn(process, "cwd").mockReturnValue(rootDir);
});

afterEach(() => {
  vi.restoreAllMocks();
  fs.rmSync(rootDir, { recursive: true, force: true });
});

describe("createRevision", () => {
  it("creates a section library revision with Git source metadata", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 200 }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await deploy(config);

    expect(execFileSync).toHaveBeenNthCalledWith(
      1,
      "git",
      ["remote", "get-url", "origin"],
      { encoding: "utf8" }
    );
    expect(execFileSync).toHaveBeenNthCalledWith(
      2,
      "git",
      ["rev-parse", "HEAD"],
      { encoding: "utf8" }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      new URL(
        "https://sbx-api.yextapis.com/v2/accounts/me/sectionLibraries/library%2F123?v=20260819&api_key=api-key"
      ),
      { method: "GET" }
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL(
        "https://sbx-api.yextapis.com/v2/accounts/me/sectionLibraries/library%2F123/revisions?v=20260819&api_key=api-key"
      ),
      {
        method: "POST",
        headers: expect.any(Headers),
        body: JSON.stringify({
          sourceGitOrigin: "git@github.com:yext/visual-editor.git",
          sourceCommitHash: "0123456789abcdef",
        }),
      }
    );
    const request = fetchMock.mock.calls[1][1] as RequestInit;
    expect(new Headers(request.headers).get("content-type")).toBe(
      "application/json"
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
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
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

    await expect(deploy(config)).rejects.toThrow(
      /Failed to upload current commit as a Section Library Revision/
    );
    expect(error).not.toHaveBeenCalled();
  });

  it("explains how to resolve missing section library write permissions", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
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

  it("prints the API response body in verbose mode", async () => {
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
        .mockResolvedValueOnce(new Response(null, { status: 200 }))
        .mockResolvedValueOnce(new Response(responseBody, { status: 400 }))
    );

    await expect(deploy(config, true)).rejects.toThrow(
      /Failed to upload current commit as a Section Library Revision/
    );
    expect(error).toHaveBeenCalledWith(`[debug] ${responseBody}`);
  });

  it("creates a missing section library after confirmation", async () => {
    vi.mocked(prompts).mockResolvedValueOnce({ value: true });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(new Response(null, { status: 404 }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }));
    vi.stubGlobal("fetch", fetchMock);

    await deploy(config);

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      new URL(
        "https://sbx-api.yextapis.com/v2/accounts/me/sectionLibraries?sectionLibraryId=library%2F123&v=20260819&api_key=api-key"
      ),
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ displayName: "Library", description: "Test" }),
      })
    );
  });
});
