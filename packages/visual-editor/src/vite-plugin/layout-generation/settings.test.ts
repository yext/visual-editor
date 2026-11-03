// @vitest-environment node
import { afterEach, expect, it, vi } from "vitest";
import { resolveLocalGenerationSettings } from "./settings.ts";

afterEach(() => vi.restoreAllMocks());

it("keeps the existing local defaults when no overrides are configured", () => {
  expect(resolveLocalGenerationSettings()).toEqual({
    attemptTimeoutMs: 300_000,
    maxOutputTokens: {
      page: 128_000,
      prepare: 2_048,
      plan: 16_384,
      section: 32_768,
    },
  });
});

it("merges partial local overrides while retaining defaults for the other workflows", () => {
  expect(
    resolveLocalGenerationSettings({
      attemptTimeoutMs: 1_000,
      maxOutputTokens: { page: 8_000, section: undefined },
    })
  ).toEqual({
    attemptTimeoutMs: 1_000,
    maxOutputTokens: {
      page: 8_000,
      prepare: 2_048,
      plan: 16_384,
      section: 32_768,
    },
  });
});

it.each([
  { attemptTimeoutMs: 0 },
  { maxOutputTokens: { page: -1 } },
  { maxOutputTokens: { section: 1.5 } },
])("disables AI for invalid local overrides: %j", (overrides) => {
  const error = vi.spyOn(console, "error").mockImplementation(() => {});
  expect(resolveLocalGenerationSettings(overrides)).toBeNull();
  expect(error).toHaveBeenCalled();
});
