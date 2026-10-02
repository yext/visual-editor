import { describe, expect, it } from "vitest";
import { getFieldLabel } from "./getFieldLabel.ts";

describe("getFieldLabel", () => {
  it.each([
    ["image", "Image"],
    ["left-image", "Left Image"],
    ["primaryCta", "Primary Cta"],
    ["heroImage2", "Hero Image 2"],
  ])("formats %s as %s", (fieldName, expected) => {
    expect(getFieldLabel(fieldName)).toBe(expected);
  });

  it("preserves an authored label", () => {
    expect(getFieldLabel("left-title", "Custom Title")).toBe("Custom Title");
  });
});
