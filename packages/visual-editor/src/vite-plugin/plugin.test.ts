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
});

describe("yextVisualEditorPlugin", () => {
  it("writes and flushes a startup log when the local editor server initializes", () => {
    const existingSignals = new Map(
      (["SIGINT", "SIGTERM"] as const).map((event) => [
        event,
        process.listeners(event),
      ])
    );
    try {
      const plugin = yextVisualEditorPlugin({ localEditor: { enabled: true } });
      const configureServer =
        typeof plugin.configureServer === "object"
          ? plugin.configureServer.handler
          : plugin.configureServer;
      const server = {
        config: { root: "/test/library" },
        httpServer: { once: vi.fn() },
        middlewares: { use: vi.fn() },
      };
      (configureServer as (server: ViteDevServer) => void)(
        server as unknown as ViteDevServer
      );
      expect(loggerMocks.createGenerationLogger).toHaveBeenCalledWith(
        "/test/library/src/library/.generated/logs"
      );
      expect(loggerMocks.log).toHaveBeenCalledWith(
        "[local-editor generation] Server initialized",
        { root: "/test/library", model: "gpt-6-luna" }
      );
      expect(loggerMocks.log.flush).toHaveBeenCalledOnce();
    } finally {
      for (const [event, original] of existingSignals)
        for (const listener of process.listeners(event))
          if (!original.includes(listener))
            process.removeListener(event, listener);
    }
  });
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
