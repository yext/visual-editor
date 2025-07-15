import { describe, it, expect } from "vitest";
import { normalizeLocale } from "./normalizeLocale";

describe("normalizeLocale", () => {
  it("lowercases language code", () => {
    expect(normalizeLocale("EN")).toBe("en");
    expect(normalizeLocale("Fr")).toBe("fr");
  });

  it("uppercases region code", () => {
    expect(normalizeLocale("en_us")).toBe("en-US");
    expect(normalizeLocale("fr_ca")).toBe("fr-CA");
    expect(normalizeLocale("es-419")).toBe("es-419");
  });

  it("title-cases script code", () => {
    expect(normalizeLocale("zh_hans_cn")).toBe("zh-Hans-CN");
    expect(normalizeLocale("sr_latn_rs")).toBe("sr-Latn-RS");
    expect(normalizeLocale("sr_Latn_ME")).toBe("sr-Latn-ME");
  });

  it("handles variants and preserves them", () => {
    expect(normalizeLocale("en_US_POSIX")).toBe("en-US-POSIX");
    expect(normalizeLocale("sl_rozdvojeni")).toBe("sl-rozdvojeni");
  });

  it("handles already normalized locales", () => {
    expect(normalizeLocale("de-DE")).toBe("de-DE");
    expect(normalizeLocale("ja-Jpan-JP")).toBe("ja-Jpan-JP");
  });

  it("handles mixed delimiters and casing", () => {
    expect(normalizeLocale("EN-latn_us")).toBe("en-Latn-US");
    expect(normalizeLocale("fr_latn_CA")).toBe("fr-Latn-CA");
    expect(normalizeLocale("EN_US_POSIX")).toBe("en-US-POSIX");
  });

  it("handles edge cases", () => {
    expect(normalizeLocale("")).toBe("");
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("und")).toBe("und");
  });
});
