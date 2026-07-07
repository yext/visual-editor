import { describe, expect, it } from "vitest";
import { getRichTextStyle } from "./richTextStyles.ts";

describe("getRichTextStyle", () => {
  it("returns undefined when no typography or color overrides are provided", () => {
    expect(getRichTextStyle({})).toBeUndefined();
  });

  it("maps non-default typography values onto rich text css variables", () => {
    expect(
      getRichTextStyle({
        typography: {
          fontFamily: "'Editorial', serif",
          fontSize: "20px",
          fontWeight: "700",
          fontStyle: "italic",
          textTransform: "uppercase",
        },
      })
    ).toStrictEqual({
      fontFamily: "'Editorial', serif",
      "--fontFamily-body-fontFamily": "'Editorial', serif",
      fontSize: "20px",
      "--fontSize-body-fontSize": "20px",
      fontWeight: "700",
      "--fontWeight-body-fontWeight": "700",
      fontStyle: "italic",
      "--fontStyle-body-fontStyle": "italic",
      textTransform: "uppercase",
      "--textTransform-body-textTransform": "uppercase",
    });
  });

  it("skips default typography values", () => {
    expect(
      getRichTextStyle({
        typography: {
          fontFamily: "default",
          fontSize: "default",
          fontWeight: "default",
          fontStyle: "default",
          textTransform: "default",
        },
      })
    ).toBeUndefined();
  });

  it("resolves theme color tokens and concrete css colors", () => {
    expect(
      getRichTextStyle({
        color: "[#123456]",
      })
    ).toStrictEqual({
      color: "#123456",
    });

    expect(
      getRichTextStyle({
        color: "rgb(1, 2, 3)",
      })
    ).toStrictEqual({
      color: "rgb(1, 2, 3)",
    });
  });
});
