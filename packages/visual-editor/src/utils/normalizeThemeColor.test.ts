import { describe, it, expect } from "vitest";
import { normalizeThemeColor } from "./normalizeThemeColor";

describe("normalizeThemeColor", () => {
  it("returns undefined when token is undefined", () => {
    expect(normalizeThemeColor(undefined)).toBeUndefined();
  });

  it("returns undefined when token is empty string", () => {
    expect(normalizeThemeColor("")).toBeUndefined();
  });

  it("strips bg- prefix", () => {
    expect(normalizeThemeColor("bg-palette-primary-dark")).toBe(
      "palette-primary-dark"
    );
  });

  it("strips text- prefix", () => {
    expect(normalizeThemeColor("text-white")).toBe("white");
  });

  it("returns undefined for unsupported prefixes", () => {
    expect(normalizeThemeColor("border-red-500")).toBeUndefined();
  });

  it("returns undefined when prefix exists but value is empty", () => {
    expect(normalizeThemeColor("bg-")).toBeUndefined();
    expect(normalizeThemeColor("text-")).toBeUndefined();
  });
});
