import {
  testPrompts,
  testGenerationSettings,
} from "../../internal/layoutGeneration/testing/promptFixtures.ts";
// @vitest-environment node
import type { IncomingMessage, ServerResponse } from "node:http";
import { beforeEach, expect, it, vi } from "vitest";
import { getLocalEditorGenerationLocales } from "../local-editor/data.ts";
import { createGenerationMiddleware } from "./middleware.ts";

vi.mock("../local-editor/data.ts", () => ({
  getLocalEditorGenerationLocales: vi.fn(),
}));
beforeEach(() => {
  vi.mocked(getLocalEditorGenerationLocales).mockReset();
});

const requestContext = async (url?: string) => {
  const response = { statusCode: 0, setHeader: vi.fn(), end: vi.fn() };
  const next = vi.fn();
  const log = Object.assign(vi.fn(), {
    flush: async () => {},
    close: async () => {},
  });
  createGenerationMiddleware({
    rootDir: "/library",
    getLayouts: () => [],
    getModel: () => "configured-model",
    prompts: testPrompts,
    generationSettings: testGenerationSettings,
    logGeneration: log,
  })({ url } as IncomingMessage, response as unknown as ServerResponse, next);
  return { response, next };
};

it.each([
  undefined,
  "/unrelated",
  "/__yext_visual_editor/local-editor/manifest",
])("leaves %s to the rest of the dev server", async (url) => {
  const { response, next } = await requestContext(url);
  expect(next).toHaveBeenCalledOnce();
  expect(response.end).not.toHaveBeenCalled();
});

it("rejects a context request without a layout before loading local settings", async () => {
  const { response, next } = await requestContext(
    "/__yext_visual_editor/local-editor/generate/context"
  );
  expect(response.statusCode).toBe(400);
  expect(JSON.parse(response.end.mock.calls[0][0])).toEqual({
    error: "A layoutId is required.",
  });
  expect(getLocalEditorGenerationLocales).not.toHaveBeenCalled();
  expect(next).not.toHaveBeenCalled();
});

it("returns the configured model and the selected layout's locale union", async () => {
  vi.mocked(getLocalEditorGenerationLocales).mockResolvedValue(["en", "fr"]);
  const { response, next } = await requestContext(
    "/__yext_visual_editor/local-editor/generate/context?layoutId=location"
  );
  await vi.waitFor(() => expect(response.end).toHaveBeenCalledOnce());
  expect(getLocalEditorGenerationLocales).toHaveBeenCalledWith(
    "/library",
    [],
    "location"
  );
  expect(response.statusCode).toBe(200);
  expect(JSON.parse(response.end.mock.calls[0][0])).toEqual({
    model: "configured-model",
    prompts: testPrompts,
    generationSettings: testGenerationSettings,
    locales: ["en", "fr"],
  });
  expect(next).not.toHaveBeenCalled();
});

it("returns local-settings failures without falling through to another route", async () => {
  vi.mocked(getLocalEditorGenerationLocales).mockRejectedValue(
    new Error("Layout settings unavailable")
  );
  const { response, next } = await requestContext(
    "/__yext_visual_editor/local-editor/generate/context?layoutId=location"
  );
  await vi.waitFor(() => expect(response.end).toHaveBeenCalledOnce());
  expect(response.statusCode).toBe(500);
  expect(JSON.parse(response.end.mock.calls[0][0]).error).toContain(
    "Layout settings unavailable"
  );
  expect(next).not.toHaveBeenCalled();
});
