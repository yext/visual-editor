import {
  EDIT_PATH_PLACEHOLDER,
  getEditorPathFromTemplateNames,
  injectEditorPath,
} from "./editorRoute.ts";

describe("getEditorPathFromTemplateNames", () => {
  it("uses the legacy route when main is available", () => {
    expect(getEditorPathFromTemplateNames(["main"])).toBe("edit");
  });

  it("uses the shared route when only shared templates are available", () => {
    expect(getEditorPathFromTemplateNames(["directory", "locator"])).toBe(
      "edit"
    );
  });

  it("uses the legacy route when a legacy template is mixed with custom templates", () => {
    expect(getEditorPathFromTemplateNames(["main", "custom-template"])).toBe(
      "edit"
    );
  });

  it("uses a template-scoped route for a single non-legacy template", () => {
    expect(getEditorPathFromTemplateNames(["custom-template"])).toBe(
      "edit/custom-template"
    );
  });

  it("uses a template-scoped route for a single custom template mixed with shared templates", () => {
    expect(
      getEditorPathFromTemplateNames([
        "custom-template",
        "directory",
        "locator",
      ])
    ).toBe("edit/custom-template");
  });

  it("throws when there are multiple non-legacy templates", () => {
    expect(() =>
      getEditorPathFromTemplateNames([
        "custom-a",
        "custom-b",
        "directory",
        "locator",
      ])
    ).toThrow("expected exactly one non-legacy template");
  });
});

describe("injectEditorPath", () => {
  it("replaces the placeholder in the edit template", () => {
    expect(
      injectEditorPath(`const editPath = "${EDIT_PATH_PLACEHOLDER}";`, "edit")
    ).toBe('const editPath = "edit";');
  });
});
