import {
  EDIT_PATH_PLACEHOLDER,
  getEditorPathFromTemplateNames,
  injectEditorPath,
} from "./editorRoute.ts";

describe("getEditorPathFromTemplateNames", () => {
  it("uses the legacy route when main is available", () => {
    expect(getEditorPathFromTemplateNames(["main"])).toBe("testedit");
  });

  it("uses the shared route when only shared templates are available", () => {
    expect(getEditorPathFromTemplateNames(["directory", "locator"])).toBe(
      "testedit"
    );
  });

  it("uses the legacy route when a legacy template is mixed with custom templates", () => {
    expect(getEditorPathFromTemplateNames(["main", "custom-template"])).toBe(
      "testedit"
    );
  });

  it("uses a template-scoped route for a single non-legacy template", () => {
    expect(getEditorPathFromTemplateNames(["custom-template"])).toBe(
      "testedit/custom-template"
    );
  });

  it("uses a template-scoped route for a single custom template mixed with shared templates", () => {
    expect(
      getEditorPathFromTemplateNames([
        "custom-template",
        "directory",
        "locator",
      ])
    ).toBe("testedit/custom-template");
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
      injectEditorPath(
        `const editPath = "${EDIT_PATH_PLACEHOLDER}";`,
        "testedit"
      )
    ).toBe('const editPath = "testedit";');
  });

  it("replaces an existing editPath assignment", () => {
    expect(
      injectEditorPath('const editPath = "edit";', "testedit/dunkin")
    ).toBe('const editPath = "testedit/dunkin";');
  });

  it("replaces an existing testedit assignment", () => {
    expect(
      injectEditorPath('const editPath = "testedit";', "testedit/dunkin")
    ).toBe('const editPath = "testedit/dunkin";');
  });
});
