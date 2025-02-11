import { describe, it, expect } from "vitest";
import { themeManagerCn } from "./cn.ts";

describe("themeManagerCn", () => {
  it("merges default tailwind classes", () => {
    const input = "text-sm font-bold text-lg text-black text-[12pt]";
    const output = themeManagerCn(input);
    const expected = "font-bold text-black text-[12pt]";
    expect(output).toBe(expected);
  });

  it("merges theme manager classes", () => {
    const input =
      "font-heading1-fontFamily font-heading2-fontFamily text-heading1-fontSize text-heading2-fontSize";
    const output = themeManagerCn(input);
    const expected = "font-heading2-fontFamily text-heading2-fontSize";
    expect(output).toBe(expected);
  });

  it("merges theme manager and default tailwind classes", () => {
    const input =
      "text-sm font-bold text-lg text-black font-heading1-fontFamily font-heading2-fontFamily " +
      "font-heading1-fontWeight text-heading1-fontSize text-heading2-fontSize text-[12pt]";
    const output = themeManagerCn(input);
    const expected =
      "text-black font-heading2-fontFamily font-heading1-fontWeight text-[12pt]";
    expect(output).toBe(expected);
  });
});
