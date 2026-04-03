import {
  EDIT_DEV_ENTRY_MODE_PLACEHOLDER,
  EDIT_DEV_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER,
  EDIT_DEV_ENTRY_TARGET_PATH_PLACEHOLDER,
  EDIT_PATH_PLACEHOLDER,
  EDIT_TEMPLATE_NAME_PLACEHOLDER,
  getEditorDevEntryTemplateInfoFromTemplateNames,
  getEditorTemplateInfosFromTemplateNames,
  getLocalTemplateIdFromEditorPath,
  getEditorTemplateInfoFromTemplateNames,
  getEditorTemplateFilePath,
  isManagedEditorTemplateFileName,
  injectEditorDevEntryTemplateInfo,
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
        "sample-store",
        "demo-shop",
        "directory",
        "locator",
      ])
    ).toEqual([
      {
        templateId: "demo-shop",
        path: "edit/demo-shop",
        configName: "edit-demo-shop",
      },
      {
        templateId: "sample-store",
        path: "edit/sample-store",
        configName: "edit-sample-store",
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
        "test-market",
        "directory",
        "locator",
      ])
    ).toEqual({
      templateId: "test-market",
      path: "edit/test-market",
      configName: "edit-test-market",
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
          path: "edit/demo-shop",
          configName: "edit-demo-shop",
        }
      )
    ).toBe(`const editPath = "edit/demo-shop";
const duplicateEditPath = "edit/demo-shop";
const editTemplateName = "edit-demo-shop";
const duplicateEditTemplateName = "edit-demo-shop";`);
  });

  it("throws when the path placeholder is missing", () => {
    expect(() =>
      injectEditorTemplateInfo('const editPath = "edit";', {
        path: "edit/demo-shop",
        configName: "edit-demo-shop",
      })
    ).toThrow("Unable to inject editor path: placeholder not found");
  });

  it("throws when the template name placeholder is missing", () => {
    expect(() =>
      injectEditorTemplateInfo(
        `const editPath = "${EDIT_PATH_PLACEHOLDER}";
const editTemplateName = "edit";`,
        {
          path: "edit/demo-shop",
          configName: "edit-demo-shop",
        }
      )
    ).toThrow("Unable to inject edit template name: placeholder not found");
  });
});

describe("getEditorDevEntryTemplateInfoFromTemplateNames", () => {
  it("does not create a dev entry page when the real route is edit", () => {
    expect(
      getEditorDevEntryTemplateInfoFromTemplateNames(["main", "directory"])
    ).toBeNull();
  });

  it("creates an entry page for a single custom template", () => {
    expect(
      getEditorDevEntryTemplateInfoFromTemplateNames(["demo-shop", "directory"])
    ).toEqual({
      path: "edit",
      configName: "edit",
      entryMode: "redirect",
      redirectTargetPath: "edit/demo-shop",
      templateIds: ["demo-shop"],
    });
  });

  it("creates a chooser entry page for multiple custom templates", () => {
    expect(
      getEditorDevEntryTemplateInfoFromTemplateNames([
        "demo-shop",
        "sample-store",
        "directory",
      ])
    ).toEqual({
      path: "edit",
      configName: "edit",
      entryMode: "chooser",
      templateIds: ["demo-shop", "sample-store"],
    });
  });
});

describe("injectEditorDevEntryTemplateInfo", () => {
  it("replaces the entry page placeholders", () => {
    const injected = injectEditorDevEntryTemplateInfo(
      `const entryMode = "${EDIT_DEV_ENTRY_MODE_PLACEHOLDER}";
const redirectPath = "${EDIT_DEV_ENTRY_TARGET_PATH_PLACEHOLDER}";
const templateIds = "${EDIT_DEV_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER}";`,
      {
        path: "edit",
        configName: "edit",
        entryMode: "redirect",
        redirectTargetPath: "edit/demo-shop",
        templateIds: ["demo-shop", "sample-store"],
      }
    );
    expect(injected).toContain('const entryMode = "redirect";');
    expect(injected).toContain('const redirectPath = "edit/demo-shop";');
    expect(injected).not.toContain(
      EDIT_DEV_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER
    );
  });

  it("throws when an entry page placeholder is missing", () => {
    expect(() =>
      injectEditorDevEntryTemplateInfo(
        `const redirectPath = "${EDIT_DEV_ENTRY_TARGET_PATH_PLACEHOLDER}";`,
        {
          path: "edit",
          configName: "edit",
          entryMode: "redirect",
          redirectTargetPath: "edit/demo-shop",
          templateIds: ["demo-shop"],
        }
      )
    ).toThrow(
      "Unable to inject edit dev entry template info: placeholder not found"
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
        path: "edit/demo-shop",
        configName: "edit-demo-shop",
        templateId: "demo-shop",
      })
    ).toBe("src/templates/edit-demo-shop.tsx");
  });

  it("recognizes managed edit template file names", () => {
    expect(isManagedEditorTemplateFileName("edit")).toBe(true);
    expect(isManagedEditorTemplateFileName("edit-demo-shop")).toBe(true);
    expect(isManagedEditorTemplateFileName("directory")).toBe(false);
  });
});

describe("getLocalTemplateIdFromEditorPath", () => {
  it("extracts a local template id from an editor pathname", () => {
    expect(
      getLocalTemplateIdFromEditorPath("/edit/demo-shop", [
        "demo-shop",
        "sample-store",
      ])
    ).toBe("demo-shop");
  });

  it("returns null when the local template does not exist", () => {
    expect(
      getLocalTemplateIdFromEditorPath("/edit/ghost", [
        "demo-shop",
        "sample-store",
      ])
    ).toBeNull();
  });
});
