import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { execFileSync } from "node:child_process";
import prompts from "prompts";
import { deploy } from "./deploy.ts";
import type { DeployConfig } from "./config.ts";
import type { SectionLibraryRevision } from "./sectionLibraryApi.ts";

vi.mock("prompts");

const config: DeployConfig = {
  accountId: "123",
  universe: "sandbox",
  apiKey: "api-key",
  origin: "origin",
  partition: "US",
  apiHost: "https://sbx-api.yextapis.com",
};
const sectionLibrary = {
  name: "accounts/123/sectionLibraries/library-123",
  uid: "019c9cb4-a7ad-7312-a603-9a828ac7c103",
  displayName: "Library",
  description: "Test",
};
const sectionLibraryRevision = {
  name: `${sectionLibrary.name}/revisions/019c9cb5-0bc5-76cd-848c-25657b850a8f`,
  status: "STATUS_BUILD_PROCESSING",
} satisfies SectionLibraryRevision;

function successfulResponse(response: object): string {
  return JSON.stringify({ meta: { errors: [] }, response });
}

let rootDir: string;
let sourceCommitHash: string;

beforeEach(() => {
  vi.mocked(prompts).mockReset();
  vi.spyOn(console, "log").mockImplementation(() => {});
  vi.spyOn(console, "warn").mockImplementation(() => {});
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
  fs.mkdirSync(path.join(rootDir, "src", "library"), { recursive: true });
  fs.writeFileSync(
    path.join(rootDir, "src", "library", "library.json"),
    JSON.stringify({
      id: "library/123",
      displayName: "Library",
      description: "Test",
    })
  );
  fs.writeFileSync(path.join(rootDir, "tracked.txt"), "original");
  fs.writeFileSync(path.join(rootDir, ".gitignore"), "ignored.txt\n");
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
  sourceCommitHash = execFileSync("git", ["-C", rootDir, "rev-parse", "HEAD"], {
    encoding: "utf8",
  }).trim();
  vi.spyOn(process, "cwd").mockReturnValue(rootDir);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  fs.rmSync(rootDir, { recursive: true, force: true });
});

describe("deploy", () => {
  it("creates a section library revision with Git source metadata", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(successfulResponse(sectionLibrary), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(successfulResponse({ sectionLibraryRevisions: [] }), {
          status: 200,
        })
      )
      .mockResolvedValueOnce(
        new Response(successfulResponse(sectionLibraryRevision), {
          status: 201,
        })
      );
    vi.stubGlobal("fetch", fetchMock);

    const revision = await deploy(config);

    expect(revision).toEqual(sectionLibraryRevision);

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      new URL(
        "https://sbx-api.yextapis.com/v2/accounts/me/sectionLibraries/library%2F123?v=20260819&api_key=api-key"
      ),
      expect.any(Request)
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      new URL(
        "https://sbx-api.yextapis.com/v2/accounts/me/sectionLibraries/library%2F123/revisions?v=20260819&api_key=api-key"
      ),
      expect.any(Request)
    );
    const request = fetchMock.mock.calls[2][1] as Request;
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
      path.join(rootDir, "src", "library", "library.json"),
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
          new Response(successfulResponse(sectionLibrary), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(successfulResponse({ sectionLibraryRevisions: [] }), {
            status: 200,
          })
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
          new Response(successfulResponse(sectionLibrary), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(successfulResponse({ sectionLibraryRevisions: [] }), {
            status: 200,
          })
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
          new Response(successfulResponse(sectionLibrary), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(successfulResponse({ sectionLibraryRevisions: [] }), {
            status: 200,
          })
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
      .mockResolvedValueOnce(
        new Response(successfulResponse({}), { status: 404 })
      )
      .mockResolvedValueOnce(
        new Response(successfulResponse(sectionLibrary), { status: 201 })
      )
      .mockResolvedValueOnce(
        new Response(successfulResponse(sectionLibraryRevision), {
          status: 201,
        })
      );
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
    expect(vi.mocked(prompts)).toHaveBeenCalledWith(
      expect.objectContaining({ initial: 0 }),
      expect.anything()
    );
  });

  it.each([
    {
      name: "staged",
      prepare: () => {
        fs.writeFileSync(path.join(rootDir, "tracked.txt"), "staged");
        execFileSync("git", ["-C", rootDir, "add", "tracked.txt"]);
      },
      status: "M  tracked.txt",
    },
    {
      name: "unstaged",
      prepare: () => {
        fs.writeFileSync(path.join(rootDir, "tracked.txt"), "unstaged");
      },
      status: "M tracked.txt",
    },
    {
      name: "untracked",
      prepare: () => {
        fs.writeFileSync(path.join(rootDir, "new.txt"), "untracked");
      },
      status: "?? new.txt",
    },
  ])(
    "blocks non-interactive deployment with $name changes",
    async (testCase) => {
      testCase.prepare();
      const fetchMock = vi.fn();
      vi.stubGlobal("fetch", fetchMock);

      await expect(
        deploy(config, false, { isInteractive: false })
      ).rejects.toThrow(/--allow-dirty/);

      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining(testCase.status)
      );
      expect(fetchMock).not.toHaveBeenCalled();
    }
  );

  it("ignores files excluded by Git", async () => {
    fs.writeFileSync(path.join(rootDir, "ignored.txt"), "ignored");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(successfulResponse(sectionLibrary), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(successfulResponse({ sectionLibraryRevisions: [] }), {
            status: 200,
          })
        )
        .mockResolvedValueOnce(
          new Response(successfulResponse(sectionLibraryRevision), {
            status: 201,
          })
        )
    );

    await deploy(config, false, { isInteractive: false });

    expect(console.warn).not.toHaveBeenCalled();
  });

  it("cancels a dirty deployment when confirmation is declined", async () => {
    fs.writeFileSync(path.join(rootDir, "new.txt"), "untracked");
    vi.mocked(prompts).mockResolvedValueOnce({ value: false });
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const revision = await deploy(config, false, { isInteractive: true });

    expect(revision).toBeUndefined();
    expect(console.log).toHaveBeenCalledWith(
      "Deployment cancelled; no revision was created."
    );
    expect(fetchMock).not.toHaveBeenCalled();
    expect(vi.mocked(prompts)).toHaveBeenCalledWith(
      expect.objectContaining({ initial: 1 }),
      expect.anything()
    );
  });

  it("warns and deploys a dirty tree with an override", async () => {
    fs.writeFileSync(path.join(rootDir, "new.txt"), "untracked");
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(successfulResponse(sectionLibrary), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(successfulResponse({ sectionLibraryRevisions: [] }), {
            status: 200,
          })
        )
        .mockResolvedValueOnce(
          new Response(successfulResponse(sectionLibraryRevision), {
            status: 201,
          })
        )
    );

    await deploy(config, false, {
      allowDirty: true,
      isInteractive: false,
    });

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("?? new.txt")
    );
    expect(console.warn).toHaveBeenCalledWith(
      "Proceeding because --allow-dirty was provided."
    );
    expect(prompts).not.toHaveBeenCalled();
  });

  it("blocks a duplicate commit in non-interactive mode", async () => {
    const duplicateRevision = {
      ...sectionLibraryRevision,
      sourceCommitHash,
      createTime: "2026-09-01T12:00:00Z",
    };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(successfulResponse(sectionLibrary), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(
            successfulResponse({
              sectionLibraryRevisions: [duplicateRevision],
            }),
            { status: 200 }
          )
        )
    );

    await expect(
      deploy(config, false, { isInteractive: false })
    ).rejects.toThrow(/--allow-duplicate/);

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(duplicateRevision.name)
    );
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(duplicateRevision.status)
    );
  });

  it("lists every revision page before identifying a duplicate", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(successfulResponse(sectionLibrary), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          successfulResponse({
            sectionLibraryRevisions: [],
            nextPageToken: "next page",
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          successfulResponse({
            sectionLibraryRevisions: [
              { ...sectionLibraryRevision, sourceCommitHash },
            ],
          }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchMock);

    await expect(
      deploy(config, false, { isInteractive: false })
    ).rejects.toThrow(/--allow-duplicate/);

    expect(fetchMock).toHaveBeenNthCalledWith(
      3,
      new URL(
        "https://sbx-api.yextapis.com/v2/accounts/me/sectionLibraries/library%2F123/revisions?pageSize=100&pageToken=next+page&v=20260819&api_key=api-key"
      ),
      expect.any(Request)
    );
  });

  it("warns with the newest match and deploys a duplicate with an override", async () => {
    const olderRevision = {
      ...sectionLibraryRevision,
      name: `${sectionLibrary.name}/revisions/older`,
      sourceCommitHash,
      createTime: "2026-09-01T12:00:00Z",
    };
    const newerRevision = {
      ...sectionLibraryRevision,
      name: `${sectionLibrary.name}/revisions/newer`,
      sourceCommitHash,
      createTime: "2026-09-02T12:00:00Z",
    };
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce(
          new Response(successfulResponse(sectionLibrary), { status: 200 })
        )
        .mockResolvedValueOnce(
          new Response(
            successfulResponse({
              sectionLibraryRevisions: [newerRevision, olderRevision],
            }),
            { status: 200 }
          )
        )
        .mockResolvedValueOnce(
          new Response(successfulResponse(sectionLibraryRevision), {
            status: 201,
          })
        )
    );

    await deploy(config, false, {
      allowDuplicate: true,
      isInteractive: false,
    });

    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining("2 revisions")
    );
    expect(console.warn).toHaveBeenCalledWith(
      expect.stringContaining(newerRevision.name)
    );
    expect(console.warn).toHaveBeenCalledWith(
      "Proceeding because --allow-duplicate was provided."
    );
    expect(prompts).not.toHaveBeenCalled();
  });

  it("cancels a duplicate deployment when confirmation is declined", async () => {
    vi.mocked(prompts).mockResolvedValueOnce({ value: false });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(successfulResponse(sectionLibrary), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(
          successfulResponse({
            sectionLibraryRevisions: [
              { ...sectionLibraryRevision, sourceCommitHash },
            ],
          }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchMock);
    const revision = await deploy(config, false, { isInteractive: true });

    expect(revision).toBeUndefined();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(console.log).toHaveBeenCalledWith(
      "Deployment cancelled; no revision was created."
    );
  });

  it("confirms dirty and duplicate conditions separately before updating metadata", async () => {
    fs.writeFileSync(path.join(rootDir, "new.txt"), "untracked");
    vi.mocked(prompts)
      .mockResolvedValueOnce({ value: true })
      .mockResolvedValueOnce({ value: false });
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          successfulResponse({
            ...sectionLibrary,
            displayName: "Old Library",
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(
          successfulResponse({
            sectionLibraryRevisions: [
              { ...sectionLibraryRevision, sourceCommitHash },
            ],
          }),
          { status: 200 }
        )
      );
    vi.stubGlobal("fetch", fetchMock);
    const revision = await deploy(config, false, { isInteractive: true });

    expect(revision).toBeUndefined();
    expect(prompts).toHaveBeenCalledTimes(2);
    expect(console.warn).toHaveBeenNthCalledWith(
      1,
      expect.stringContaining("working tree")
    );
    expect(console.warn).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining("already been uploaded")
    );
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it("updates both metadata fields before creating the revision", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        new Response(
          successfulResponse({
            ...sectionLibrary,
            displayName: "Old Library",
          }),
          { status: 200 }
        )
      )
      .mockResolvedValueOnce(
        new Response(successfulResponse({ sectionLibraryRevisions: [] }), {
          status: 200,
        })
      )
      .mockResolvedValueOnce(
        new Response(successfulResponse(sectionLibrary), { status: 200 })
      )
      .mockResolvedValueOnce(
        new Response(successfulResponse(sectionLibraryRevision), {
          status: 201,
        })
      );
    vi.stubGlobal("fetch", fetchMock);
    await deploy(config, false, { isInteractive: false });

    const updateRequest = fetchMock.mock.calls[2][1] as Request;
    expect(updateRequest.method).toBe("PATCH");
    expect(await updateRequest.text()).toBe(
      JSON.stringify({ displayName: "Library", description: "Test" })
    );
    expect(console.log).toHaveBeenCalledWith(
      'Updated metadata for Section Library "library/123".'
    );
    expect(console.log).toHaveBeenCalledWith(
      `Uploaded commit ${sourceCommitHash} to a revision for Section Library "library/123".`
    );
  });
});
