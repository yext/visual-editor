import { afterEach, expect, it } from "vitest";
import { installLocalEditorLocatorMocks } from "./locatorMocks.ts";

let cleanup: (() => void) | undefined;

afterEach(() => {
  cleanup?.();
  cleanup = undefined;
});

it("returns fixture Locator results and restores browser APIs", async () => {
  const originalFetch = globalThis.fetch;
  cleanup = installLocalEditorLocatorMocks();
  const response = await fetch("https://example.com/search/vertical/query", {
    method: "POST",
    body: JSON.stringify({ offset: 20, limit: 20 }),
  });
  const payload = (await response.json()) as {
    response: { resultsCount: number; results: unknown[] };
  };

  expect(payload.response.resultsCount).toBe(24);
  expect(payload.response.results).toHaveLength(4);
  cleanup();
  cleanup = undefined;
  expect(globalThis.fetch).toBe(originalFetch);
});
