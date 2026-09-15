// @vitest-environment node

import { afterEach, describe, expect, it, vi } from "vitest";
import { yextVisualEditorPlugin } from "./plugin.ts";

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
