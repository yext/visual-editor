import { describe, expect, it } from "vitest";
import { isDirectoryGrid } from "./utils.ts";

describe("isDirectoryGrid", () => {
  it.each([
    { children: [{ address: {} }], expected: true },
    { children: [123], expected: false },
    { children: [], expected: false },
  ])("returns $expected for $children", ({ children, expected }) => {
    expect(isDirectoryGrid(children)).toBe(expected);
  });
});
