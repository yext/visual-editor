import {
  EDIT_PATH_PLACEHOLDER,
  EDIT_TEMPLATE_NAME_PLACEHOLDER,
  getEditorTemplateInfoFromTemplateNames,
  injectEditorTemplateInfo,
} from "./editorRoute.ts";

describe("getEditorTemplateInfoFromTemplateNames", () => {
  it("uses the legacy route when main is available", () => {
    expect(getEditorTemplateInfoFromTemplateNames(["main"])).toEqual({
      path: "edit",
      configName: "edit",
    });
  });

  it("uses the shared route when only shared templates are available", () => {
    expect(
      getEditorTemplateInfoFromTemplateNames(["directory", "locator"])
    ).toEqual({
      path: "edit",
      configName: "edit",
    });
  });

  it("uses the legacy route when a legacy template is mixed with custom templates", () => {
    expect(
      getEditorTemplateInfoFromTemplateNames(["main", "custom-template"])
    ).toEqual({
      path: "edit",
      configName: "edit",
    });
  });

  it("uses a template-scoped route for a single non-legacy template", () => {
    expect(getEditorTemplateInfoFromTemplateNames(["custom-template"])).toEqual(
      {
        path: "edit/custom-template",
        configName: "edit-custom-template",
      }
    );
  });

  it("uses a template-scoped route for a single custom template mixed with shared templates", () => {
    expect(
      getEditorTemplateInfoFromTemplateNames([
        "custom-template",
        "directory",
        "locator",
      ])
    ).toEqual({
      path: "edit/custom-template",
      configName: "edit-custom-template",
    });
  });

  it("throws when there are multiple non-legacy templates", () => {
    expect(() =>
      getEditorTemplateInfoFromTemplateNames([
        "custom-a",
        "custom-b",
        "directory",
        "locator",
      ])
    ).toThrow("expected exactly one non-legacy template");
  });

  it("returns the matching path and config name", () => {
    expect(
      getEditorTemplateInfoFromTemplateNames([
        "sweetgreen",
        "directory",
        "locator",
      ])
    ).toEqual({
      path: "edit/sweetgreen",
      configName: "edit-sweetgreen",
    });
  });
});

describe("injectEditorTemplateInfo", () => {
  it("replaces both placeholders in the edit template", () => {
    expect(
      injectEditorTemplateInfo(
        `const editPath = "${EDIT_PATH_PLACEHOLDER}";
const editTemplateName = "${EDIT_TEMPLATE_NAME_PLACEHOLDER}";`,
        {
          path: "edit",
          configName: "edit",
        }
      )
    ).toBe('const editPath = "edit";\nconst editTemplateName = "edit";');
  });

  it("throws when the path placeholder is missing", () => {
    expect(() =>
      injectEditorTemplateInfo('const editPath = "edit";', {
        path: "edit/dunkin",
        configName: "edit-dunkin",
      })
    ).toThrow("Unable to inject editor path: placeholder not found");
  });

  it("throws when the template name placeholder is missing", () => {
    expect(() =>
      injectEditorTemplateInfo(
        `const editPath = "${EDIT_PATH_PLACEHOLDER}";
const editTemplateName = "edit";`,
        {
          path: "edit/dunkin",
          configName: "edit-dunkin",
        }
      )
    ).toThrow("Unable to inject edit template name: placeholder not found");
  });
});
