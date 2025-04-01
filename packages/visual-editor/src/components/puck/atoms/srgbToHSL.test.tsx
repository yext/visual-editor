import { describe, it, expect } from "vitest";
import { srgbToHSL } from "./srgbToHSL.ts";

describe("srgbToHSL", () => {
  it("should correctly calculate RGB", () => {
    expect(srgbToHSL([0, 0, 0])).toStrictEqual([0, 0, 0]);
    expect(srgbToHSL([1, 1, 1])).toStrictEqual([0, 0, 100]);
    expect(srgbToHSL([0.23, 0.5, 0.1])).toStrictEqual([100.5, 66.6, 30]);
    expect(srgbToHSL([0.88, 0.1, 0.9])).toStrictEqual([298.5, 80, 50]);
  });

  it("should return undefined if hex argument is invalid", () => {
    expect(srgbToHSL([])).toBeUndefined();
    expect(srgbToHSL([1, 2, 3, 4])).toBeUndefined();
    expect(srgbToHSL([2000, 0.4, 0.2])).toBeUndefined();
    expect(srgbToHSL([0.2, -0.4, 0.2])).toBeUndefined();
  });
});
