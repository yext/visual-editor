import { getEffectiveEditorTemplateNames } from "./editorTemplateNames.ts";

describe("getEffectiveEditorTemplateNames", () => {
  it("synthesizes main when there are no explicit custom templates", () => {
    expect(getEffectiveEditorTemplateNames(["directory", "locator"])).toEqual({
      templateNames: ["main", "directory", "locator"],
      usesFallbackMain: true,
    });
  });

  it("suppresses fallback main when a custom template exists", () => {
    expect(
      getEffectiveEditorTemplateNames(["demo-shop", "directory", "locator"])
    ).toEqual({
      templateNames: ["directory", "locator", "demo-shop"],
      usesFallbackMain: false,
    });
  });

  it("preserves explicit main when it exists alongside custom templates", () => {
    expect(
      getEffectiveEditorTemplateNames(["main", "demo-shop", "directory"])
    ).toEqual({
      templateNames: ["main", "directory", "locator", "demo-shop"],
      usesFallbackMain: false,
    });
  });
});
