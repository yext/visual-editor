import { describe, expect, it } from "vitest";
import { resolveTranslationLocale } from "./resolveTranslationLocale.ts";

describe("resolveTranslationLocale", () => {
  it("returns empty string for empty input", () => {
    expect(resolveTranslationLocale("")).toBe("");
  });

  it("preserves supported regional locales", () => {
    expect(resolveTranslationLocale("en-GB")).toBe("en-GB");
    expect(resolveTranslationLocale("zh-TW")).toBe("zh-TW");
  });

  it("maps zh-Hant locales to zh-TW", () => {
    expect(resolveTranslationLocale("zh-Hant")).toBe("zh-TW");
    expect(resolveTranslationLocale("zh-Hant-HK")).toBe("zh-TW");
  });

  it("falls back to base locale for unsupported regional locales", () => {
    expect(resolveTranslationLocale("es-MX")).toBe("es");
    expect(resolveTranslationLocale("fr-CA")).toBe("fr");
  });
});
