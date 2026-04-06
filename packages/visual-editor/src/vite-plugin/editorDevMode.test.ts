import {
  EDIT_DEV_ENTRY_MODE_PLACEHOLDER,
  EDIT_DEV_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER,
  EDIT_DEV_ENTRY_TARGET_PATH_PLACEHOLDER,
  getCustomEditorTemplateIds,
  getEditorDevEntryTemplateInfoFromTemplateNames,
  getLocalTemplateIdFromEditorPath,
  getSingleCustomTemplateId,
  injectEditorDevEntryTemplateInfo,
} from "./editorDevMode.ts";

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

describe("custom template helpers", () => {
  it("returns the only custom template id when one exists", () => {
    expect(
      getSingleCustomTemplateId(["demo-shop", "directory", "locator"])
    ).toBe("demo-shop");
  });

  it("does not treat main as a custom template id", () => {
    expect(getSingleCustomTemplateId(["main", "directory"])).toBeNull();
  });

  it("returns null when multiple custom template ids exist", () => {
    expect(
      getSingleCustomTemplateId(["demo-shop", "sample-store", "directory"])
    ).toBeNull();
  });

  it("returns only custom template ids", () => {
    expect(
      getCustomEditorTemplateIds(["main", "directory", "locator", "demo-shop"])
    ).toEqual(["demo-shop"]);
  });
});
