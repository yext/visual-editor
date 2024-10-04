import { describe, it, expect } from "vitest";
import { applyTheme, Document } from "./applyTheme.ts";

describe("buildCssOverridesStyle", () => {
  it("should generate correct CSS with one override in c_theme", () => {
    const document: Document = { c_theme: { "--my-variable": "red" } };
    const result = applyTheme(document);

    expect(result).toBe(
      '<style type="text/css">.components{--my-variable:red !important}</style>'
    );
  });

  it("should generate correct CSS with multiple overrides in c_theme", () => {
    const document: Document = {
      c_theme: {
        "--primary": "0 68% 51%",
        "--primary-foreground": "0 0% 100%",
        "--secondary": "11 100% 26%",
      },
    };
    const result = applyTheme(document);

    expect(result).toBe(
      '<style type="text/css">.components{--primary:0 68% 51% !important;--primary-foreground:0 0% 100% !important;--secondary:11 100% 26% !important}</style>'
    );
  });

  it("should return nothing for an empty c_theme field", () => {
    const result = applyTheme({} as Document);

    expect(result).toBe("");
  });

  it("should return the base string unmodified when c_theme is empty", () => {
    const base = "<style>div{color:blue}</style>";
    const result = applyTheme({} as Document, base);

    expect(result).toBe(base);
  });

  it("should return the base string followed by the appropriate styling when both are provided", () => {
    const base = "<style>div{color:blue}</style>";
    const document: Document = { c_theme: { "--primary": "0 68% 51%" } };
    const result = applyTheme(document, base);

    expect(result).toBe(
      '<style>div{color:blue}</style><style type="text/css">.components{--primary:0 68% 51% !important}</style>'
    );
  });
});
