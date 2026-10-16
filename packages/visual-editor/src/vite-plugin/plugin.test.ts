// @vitest-environment node

import type { IncomingMessage, ServerResponse } from "node:http";
import type { ViteDevServer } from "vite";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { SectionLibraryLayout } from "../types/sectionLibrary.ts";
import { yextVisualEditorPlugin } from "./plugin.ts";

const sectionLibraryMocks = vi.hoisted(() => ({
  cleanupGeneratedSectionLibraryFiles: vi.fn(),
  generateSectionLibraryFiles: vi.fn(() => ({
    generatedFiles: [] as string[],
    layouts: [] as SectionLibraryLayout[],
    manifestSource: undefined as string | undefined,
  })),
}));
const localEditorMocks = vi.hoisted(() => ({
  cleanupGeneratedLocalEditorArtifacts: vi.fn(),
  syncLocalEditorDataTemplates: vi.fn(),
  syncLocalEditorTemplate: vi.fn(),
}));

vi.mock(
  "./section-library/sectionLibraryGenerator.ts",
  () => sectionLibraryMocks
);
vi.mock("./local-editor/artifacts.ts", () => ({
  createLocalEditorArtifactsManager: vi.fn(() => localEditorMocks),
}));
vi.mock("./local-editor/config.ts", () => ({
  readResolvedLayoutConfigs: vi.fn().mockResolvedValue({}),
}));
vi.mock("./local-editor/generatedFiles.ts", () => ({
  ensureLocalEditorStreamConfig: vi.fn(),
  LOCAL_EDITOR_API_BASE_PATH: "/__yext_visual_editor/local-editor",
}));

beforeEach(() => {
  sectionLibraryMocks.generateSectionLibraryFiles.mockReset();
  sectionLibraryMocks.generateSectionLibraryFiles.mockReturnValue({
    generatedFiles: [],
    layouts: [],
    manifestSource: undefined,
  });
});

afterEach(() => {
  vi.clearAllMocks();
});

describe("yextVisualEditorPlugin", () => {
  it.each([
    ["omitted", undefined],
    ["true", true],
    ["false", false],
  ])(
    "generates Section Library files when sectionLibrary is %s",
    async (_, value) => {
      const plugin = yextVisualEditorPlugin(
        value === undefined ? {} : { sectionLibrary: value }
      );
      const buildStart =
        typeof plugin.buildStart === "object"
          ? plugin.buildStart.handler
          : plugin.buildStart;

      expect(buildStart).toBeTypeOf("function");
      await (buildStart as () => void | Promise<void>)();

      expect(
        sectionLibraryMocks.generateSectionLibraryFiles
      ).toHaveBeenCalledOnce();
    }
  );

  it("queues local editor regeneration and reloads after success", async () => {
    const oldFile = "/tmp/old-config.tsx";
    const newFile = "/tmp/new-config.tsx";
    sectionLibraryMocks.generateSectionLibraryFiles
      .mockReturnValueOnce({
        generatedFiles: [oldFile],
        layouts: [
          {
            metadata: { id: "old", displayName: "Old", pageSetType: "ENTITY" },
            defaultLayout: {},
          },
        ],
        manifestSource: "old",
      })
      .mockImplementationOnce(() => {
        throw new Error("Invalid section configuration");
      })
      .mockReturnValueOnce({
        generatedFiles: [newFile],
        layouts: [
          {
            metadata: { id: "new", displayName: "New", pageSetType: "ENTITY" },
            defaultLayout: {},
          },
        ],
        manifestSource: "new",
      });
    const use = vi.fn();
    const invalidateModule = vi.fn();
    const send = vi.fn();
    const error = vi.fn();
    const module = { id: newFile };
    const getModulesByFile = vi.fn((filePath: string) =>
      filePath === newFile ? new Set([module]) : undefined
    );
    const server = {
      httpServer: { once: vi.fn() },
      middlewares: { use },
      moduleGraph: { getModulesByFile, invalidateModule },
      ws: { send },
      config: { logger: { error } },
    } as unknown as ViteDevServer;
    const plugin = yextVisualEditorPlugin({ localEditor: { enabled: true } });
    (plugin.configureServer as (server: ViteDevServer) => void)(server);
    const middleware = use.mock.calls[0][0] as (
      request: IncomingMessage,
      response: ServerResponse,
      next: () => void
    ) => void;

    const request = (method = "POST", libraryRoot = process.cwd()) =>
      new Promise<{ statusCode: number; body: unknown }>((resolve) => {
        const response = {
          statusCode: 200,
          setHeader: vi.fn(),
          end: (body: string) =>
            resolve({
              statusCode: response.statusCode,
              body: JSON.parse(body),
            }),
        };
        middleware(
          {
            method,
            url: "/__yext_visual_editor/local-editor/regenerate",
            headers: { "x-yext-section-library-root": libraryRoot },
          } as unknown as IncomingMessage,
          response as unknown as ServerResponse,
          vi.fn()
        );
      });

    expect(await request("GET")).toEqual({
      statusCode: 405,
      body: { error: "Method not allowed" },
    });
    expect(await request("POST", "/tmp/another-library")).toEqual({
      statusCode: 409,
      body: {
        error: "The running Pages server uses a different section library",
      },
    });
    const [first, failed] = await Promise.all([request(), request()]);
    expect(first).toEqual({
      statusCode: 202,
      body: { status: "queued" },
    });
    expect(failed).toEqual({
      statusCode: 202,
      body: { status: "queued" },
    });
    expect(
      sectionLibraryMocks.generateSectionLibraryFiles
    ).not.toHaveBeenCalled();
    await vi.waitFor(() =>
      expect(
        sectionLibraryMocks.generateSectionLibraryFiles
      ).toHaveBeenCalledTimes(2)
    );
    expect(error).toHaveBeenCalledWith(
      "Local Editor regeneration failed: Invalid section configuration"
    );
    expect(
      sectionLibraryMocks.cleanupGeneratedSectionLibraryFiles
    ).not.toHaveBeenCalledWith([oldFile]);
    expect(await request()).toEqual({
      statusCode: 202,
      body: { status: "queued" },
    });
    await vi.waitFor(() => expect(send).toHaveBeenCalledTimes(2));
    expect(localEditorMocks.syncLocalEditorTemplate).toHaveBeenLastCalledWith([
      expect.objectContaining({
        metadata: expect.objectContaining({ id: "new" }),
      }),
    ]);
    expect(
      sectionLibraryMocks.cleanupGeneratedSectionLibraryFiles
    ).toHaveBeenCalledWith([oldFile]);
    expect(invalidateModule).toHaveBeenCalledWith(module);
    expect(getModulesByFile).toHaveBeenCalledWith(oldFile);
    expect(send).toHaveBeenCalledTimes(2);
    expect(send).toHaveBeenCalledWith({ type: "full-reload" });
  });
});
