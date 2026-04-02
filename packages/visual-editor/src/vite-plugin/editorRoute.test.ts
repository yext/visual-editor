import {
  EDIT_ENTRY_MODE_PLACEHOLDER,
  EDIT_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER,
  EDIT_COMPAT_TARGET_PATH_PLACEHOLDER,
  EDIT_PATH_PLACEHOLDER,
  EDIT_TEMPLATE_NAME_PLACEHOLDER,
  getEditorCompatTemplateInfoFromTemplateNames,
  getEditorTemplateInfosFromTemplateNames,
  getLocalTemplateIdFromEditorPath,
  getEditorTemplateInfoFromTemplateNames,
  getEditorTemplateFilePath,
  isManagedEditorTemplateFileName,
  injectEditorCompatTemplateInfo,
  injectEditorTemplateInfo,
} from "./editorRoute.ts";

describe("getEditorTemplateInfosFromTemplateNames", () => {
  it("uses the legacy edit route when main is available", () => {
    expect(getEditorTemplateInfosFromTemplateNames(["main"])).toEqual([
      {
        path: "edit",
        configName: "edit",
      },
    ]);
  });

  it("uses one editor route per custom template when main is absent", () => {
    expect(
      getEditorTemplateInfosFromTemplateNames([
        "baskin",
        "dunkin",
        "directory",
        "locator",
      ])
    ).toEqual([
      {
        templateId: "baskin",
        path: "edit/baskin",
        configName: "edit-baskin",
      },
      {
        templateId: "dunkin",
        path: "edit/dunkin",
        configName: "edit-dunkin",
      },
    ]);
  });
});

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
        templateId: "custom-template",
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
      templateId: "custom-template",
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
      templateId: "sweetgreen",
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

  it("replaces all occurrences of both placeholders", () => {
    expect(
      injectEditorTemplateInfo(
        `const editPath = "${EDIT_PATH_PLACEHOLDER}";
const duplicateEditPath = "${EDIT_PATH_PLACEHOLDER}";
const editTemplateName = "${EDIT_TEMPLATE_NAME_PLACEHOLDER}";
const duplicateEditTemplateName = "${EDIT_TEMPLATE_NAME_PLACEHOLDER}";`,
        {
          path: "edit/dunkin",
          configName: "edit-dunkin",
        }
      )
    ).toBe(`const editPath = "edit/dunkin";
const duplicateEditPath = "edit/dunkin";
const editTemplateName = "edit-dunkin";
const duplicateEditTemplateName = "edit-dunkin";`);
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

describe("getEditorCompatTemplateInfoFromTemplateNames", () => {
  it("does not create a compatibility route when the real route is edit", () => {
    expect(
      getEditorCompatTemplateInfoFromTemplateNames(["main", "directory"])
    ).toBeNull();
  });

  it("creates a compatibility route for a single custom template", () => {
    expect(
      getEditorCompatTemplateInfoFromTemplateNames(["dunkin", "directory"])
    ).toEqual({
      path: "edit",
      configName: "edit",
      entryMode: "redirect",
      redirectTargetPath: "edit/dunkin",
      templateIds: ["dunkin"],
    });
  });

  it("creates a chooser entry page for multiple custom templates", () => {
    expect(
      getEditorCompatTemplateInfoFromTemplateNames([
        "dunkin",
        "baskin",
        "directory",
      ])
    ).toEqual({
      path: "edit",
      configName: "edit",
      entryMode: "chooser",
      templateIds: ["baskin", "dunkin"],
    });
  });
});

describe("injectEditorCompatTemplateInfo", () => {
  it("replaces the entry page placeholders", () => {
    const injected = injectEditorCompatTemplateInfo(
      `const entryMode = "${EDIT_ENTRY_MODE_PLACEHOLDER}";
const redirectPath = "${EDIT_COMPAT_TARGET_PATH_PLACEHOLDER}";
const templateIds = "${EDIT_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER}";`,
      {
        path: "edit",
        configName: "edit",
        entryMode: "redirect",
        redirectTargetPath: "edit/dunkin",
        templateIds: ["dunkin", "baskin"],
      }
    );
    expect(injected).toContain('const entryMode = "redirect";');
    expect(injected).toContain('const redirectPath = "edit/dunkin";');
    expect(injected).not.toContain(EDIT_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER);
  });

  it("throws when an entry page placeholder is missing", () => {
    expect(() =>
      injectEditorCompatTemplateInfo(
        `const redirectPath = "${EDIT_COMPAT_TARGET_PATH_PLACEHOLDER}";`,
        {
          path: "edit",
          configName: "edit",
          entryMode: "redirect",
          redirectTargetPath: "edit/dunkin",
          templateIds: ["dunkin"],
        }
      )
    ).toThrow(
      "Unable to inject edit entry template info: placeholder not found"
    );
  });
});

describe("editor template files", () => {
  it("maps legacy and custom editor templates to managed file paths", () => {
    expect(
      getEditorTemplateFilePath({
        path: "edit",
        configName: "edit",
      })
    ).toBe("src/templates/edit.tsx");
    expect(
      getEditorTemplateFilePath({
        path: "edit/dunkin",
        configName: "edit-dunkin",
        templateId: "dunkin",
      })
    ).toBe("src/templates/edit-dunkin.tsx");
  });

  it("recognizes managed edit template file names", () => {
    expect(isManagedEditorTemplateFileName("edit")).toBe(true);
    expect(isManagedEditorTemplateFileName("edit-dunkin")).toBe(true);
    expect(isManagedEditorTemplateFileName("directory")).toBe(false);
  });
});

describe("getLocalTemplateIdFromEditorPath", () => {
  it("extracts a local template id from an editor pathname", () => {
    expect(
      getLocalTemplateIdFromEditorPath("/edit/dunkin", ["dunkin", "baskin"])
    ).toBe("dunkin");
  });

  it("returns null when the local template does not exist", () => {
    expect(
      getLocalTemplateIdFromEditorPath("/edit/ghost", ["dunkin", "baskin"])
    ).toBeNull();
  });
});
