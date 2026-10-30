// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import type { ViteDevServer } from "vite";
import { yextVisualEditorPlugin } from "./plugin.ts";

const loggerMocks = vi.hoisted(() => {
  const flush = vi.fn(async () => {});
  const close = vi.fn(async () => {});
  const log = Object.assign(vi.fn(), { flush, close });
  return { log, createGenerationLogger: vi.fn(() => log) };
});

vi.mock("./layout-generation/generationLogger.ts", () => ({
  createGenerationLogger: loggerMocks.createGenerationLogger,
}));

const sectionLibraryMocks = vi.hoisted(() => ({
  cleanupGeneratedSectionLibraryFiles: vi.fn(),
  generateSectionLibraryFiles: vi.fn(() => ({
    generatedFiles: [],
    layouts: [],
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

afterEach(() => {
  vi.clearAllMocks();
  vi.restoreAllMocks();
});

describe("yextVisualEditorPlugin", () => {
  it("initializes the generation log and closes it with the local editor server", async () => {
    const existingSignals = new Map(
      (["SIGINT", "SIGTERM"] as const).map((event) => [
        event,
        process.listeners(event),
      ])
    );
    try {
      const plugin = yextVisualEditorPlugin({
        localEditor: { enabled: true, layoutGenerationEnabled: true },
      });
      const configureServer =
        typeof plugin.configureServer === "object"
          ? plugin.configureServer.handler
          : plugin.configureServer;
      const server = {
        config: { root: "/test/library" },
        httpServer: { once: vi.fn() },
        middlewares: { use: vi.fn() },
      };
      await (configureServer as (server: ViteDevServer) => Promise<void>)(
        server as unknown as ViteDevServer
      );
      expect(server.middlewares.use).toHaveBeenCalledTimes(2);
      expect(loggerMocks.createGenerationLogger).toHaveBeenCalledWith(
        "/test/library/src/library/.generated/logs"
      );
      expect(server.httpServer.once).toHaveBeenCalledWith(
        "close",
        expect.any(Function)
      );
      const [, closeServer] = server.httpServer.once.mock.calls[0];
      closeServer();
      expect(loggerMocks.log.close).toHaveBeenCalledOnce();
      expect(
        localEditorMocks.cleanupGeneratedLocalEditorArtifacts
      ).toHaveBeenCalledOnce();
      expect(
        sectionLibraryMocks.cleanupGeneratedSectionLibraryFiles
      ).toHaveBeenCalledOnce();
    } finally {
      for (const [event, original] of existingSignals)
        for (const listener of process.listeners(event))
          if (!original.includes(listener))
            process.removeListener(event, listener);
    }
  });
  it.each([
    { enabled: true },
    { enabled: true, layoutGenerationEnabled: false },
    { enabled: false, layoutGenerationEnabled: true },
  ])(
    "disables generation and logging with localEditor %j",
    async (localEditor) => {
      vi.spyOn(process, "once").mockReturnValue(process);
      const plugin = yextVisualEditorPlugin({ localEditor });
      const configureServer =
        typeof plugin.configureServer === "object"
          ? plugin.configureServer.handler
          : plugin.configureServer;
      const server = {
        config: { root: "/test/library" },
        httpServer: { once: vi.fn() },
        middlewares: { use: vi.fn() },
      };

      await (configureServer as (server: ViteDevServer) => Promise<void>)(
        server as unknown as ViteDevServer
      );

      expect(loggerMocks.createGenerationLogger).not.toHaveBeenCalled();
      expect(server.middlewares.use).toHaveBeenCalledTimes(
        localEditor.enabled ? 1 : 0
      );
      if (localEditor.enabled) {
        const [, closeServer] = server.httpServer.once.mock.calls[0];
        closeServer();
        expect(loggerMocks.log.close).not.toHaveBeenCalled();
        expect(
          localEditorMocks.cleanupGeneratedLocalEditorArtifacts
        ).toHaveBeenCalledOnce();
      }
    }
  );

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
});
