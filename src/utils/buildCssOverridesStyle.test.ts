import { describe, it, expect } from "vitest";
import {
  buildCssOverridesStyle,
  CssVariableOverrides,
} from "./buildCssOverridesStyle.ts";

describe("buildCssOverridesStyle", () => {
  it("should generate correct CSS with one override", () => {
    const selector = ".my-class";
    const overrides = { "--my-variable": "red" };
    const result = buildCssOverridesStyle("", selector, overrides);

    expect(result).toBe(
      '<style type="text/css">.my-class{--my-variable:red!important}</style>'
    );
  });

  it("should generate correct CSS with multiple overrides", () => {
    const selector = ".components";
    const overrides = {
      "--primary": "0 68% 51%",
      "--primary-foreground": "0 0% 100%",
      "--secondary": "11 100% 26%",
    };
    const result = buildCssOverridesStyle("", selector, overrides);

    expect(result).toBe(
      '<style type="text/css">.components{--primary:0 68% 51%!important;--primary-foreground:0 0% 100%!important;--secondary:11 100% 26%!important}</style>'
    );
  });

  it("should handle an empty overrides object", () => {
    const selector = "div";
    const overrides: CssVariableOverrides = {};
    const result = buildCssOverridesStyle("", selector, overrides);

    expect(result).toBe('<style type="text/css">div{}</style>');
  });

  it("should handle if a base string is provided", () => {
    const base = "<style>div{color:blue}</style>";
    const selector = ".components";
    const overrides = { "--primary": "0 68% 51%" };
    const result = buildCssOverridesStyle(base, selector, overrides);

    expect(result).toBe(
      '<style>div{color:blue}</style><style type="text/css">.components{--primary:0 68% 51%!important}</style>'
    );
  });
});
