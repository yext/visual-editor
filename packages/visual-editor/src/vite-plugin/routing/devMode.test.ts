import {
  DEV_TEMPLATE_PICKER_MODE_PLACEHOLDER,
  DEV_TEMPLATE_PICKER_TEMPLATE_IDS_BASE64_PLACEHOLDER,
  DEV_TEMPLATE_PICKER_TARGET_PATH_PLACEHOLDER,
  getCustomEditorTemplateIds,
  getDevTemplatePickerInfoFromTemplateNames,
  getLocalTemplateIdFromEditorPath,
  getSingleCustomTemplateId,
  injectDevTemplatePickerInfo,
} from "./devMode.ts";

describe("getDevTemplatePickerInfoFromTemplateNames", () => {
  it("does not create a picker page when the real route is edit", () => {
    expect(
      getDevTemplatePickerInfoFromTemplateNames(["main", "directory"])
    ).toBeNull();
  });

  it("creates a picker page for a single custom template", () => {
    expect(
      getDevTemplatePickerInfoFromTemplateNames(["demo-shop", "directory"])
    ).toEqual({
      path: "edit",
      configName: "edit",
      entryMode: "redirect",
      redirectTargetPath: "edit/demo-shop",
      templateIds: ["demo-shop"],
    });
  });

  it("creates a chooser picker page for multiple custom templates", () => {
    expect(
      getDevTemplatePickerInfoFromTemplateNames([
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

describe("injectDevTemplatePickerInfo", () => {
  it("replaces the picker page placeholders", () => {
    const injected = injectDevTemplatePickerInfo(
      `const entryMode = "${DEV_TEMPLATE_PICKER_MODE_PLACEHOLDER}";
const redirectPath = "${DEV_TEMPLATE_PICKER_TARGET_PATH_PLACEHOLDER}";
const templateIds = "${DEV_TEMPLATE_PICKER_TEMPLATE_IDS_BASE64_PLACEHOLDER}";`,
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
      DEV_TEMPLATE_PICKER_TEMPLATE_IDS_BASE64_PLACEHOLDER
    );
  });

  it("throws when a picker page placeholder is missing", () => {
    expect(() =>
      injectDevTemplatePickerInfo(
        `const redirectPath = "${DEV_TEMPLATE_PICKER_TARGET_PATH_PLACEHOLDER}";`,
        {
          path: "edit",
          configName: "edit",
          entryMode: "redirect",
          redirectTargetPath: "edit/demo-shop",
          templateIds: ["demo-shop"],
        }
      )
    ).toThrow(
      "Unable to inject dev template picker info: placeholder not found"
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
