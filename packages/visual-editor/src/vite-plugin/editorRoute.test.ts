import {
  EDIT_PATH_PLACEHOLDER,
  EDIT_TEMPLATE_NAME_PLACEHOLDER,
  getEditorConfigNameFromTemplateNames,
  getEditorTemplateInfoFromTemplateNames,
  getEditorPathFromTemplateNames,
  injectEditorTemplateInfo,
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

describe("getEditorConfigNameFromTemplateNames", () => {
  it("uses the legacy config name when main is available", () => {
    expect(getEditorConfigNameFromTemplateNames(["main"])).toBe("edit");
  });

  it("uses a template-scoped config name for a single custom template", () => {
    expect(getEditorConfigNameFromTemplateNames(["dunkin"])).toBe(
      "edit-dunkin"
    );
  });
});

describe("getEditorTemplateInfoFromTemplateNames", () => {
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

  it("replaces existing path and template-name assignments", () => {
    expect(
      injectEditorTemplateInfo(
        'const editPath = "edit";\nconst editTemplateName = "edit";',
        {
          path: "edit/dunkin",
          configName: "edit-dunkin",
        }
      )
    ).toBe(
      'const editPath = "edit/dunkin";\nconst editTemplateName = "edit-dunkin";'
    );
  });

  it("replaces an existing config.name string when editTemplateName is not present", () => {
    expect(
      injectEditorTemplateInfo(
        `const editPath = "edit";
export const config: TemplateConfig = {
  name: "edit",
};`,
        {
          path: "edit/dunkin",
          configName: "edit-dunkin",
        }
      )
    ).toBe(`const editPath = "edit/dunkin";
export const config: TemplateConfig = {
  name: "edit-dunkin",
};`);
  });

  it("migrates a legacy getPath block to the editPath declaration form", () => {
    expect(
      injectEditorTemplateInfo(
        `export const getPath: GetPath<TemplateProps> = () => {
  return "edit";
};

export const config: TemplateConfig = {
  name: "edit",
};`,
        {
          path: "edit/dunkin",
          configName: "edit-dunkin",
        }
      )
    ).toBe(`const editPath = "edit/dunkin";

export const getPath: GetPath<TemplateProps> = () => {
  return editPath;
};

export const config: TemplateConfig = {
  name: "edit-dunkin",
};`);
  });
});
