const LEGACY_EDITOR_TEMPLATE_NAMES = new Set(["main"]);
const SHARED_EDITOR_TEMPLATE_NAMES = new Set(["directory", "locator"]);

export const EDIT_PATH_PLACEHOLDER = "__YEXT_VISUAL_EDITOR_PATH__";
export const EDIT_TEMPLATE_NAME_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_TEMPLATE_NAME__";

type EditorTemplateInfo = {
  path: string;
  configName: string;
};

export const getEditorTemplateInfoFromTemplateNames = (
  templateNames: string[]
): EditorTemplateInfo => {
  const normalizedTemplateNames = [...new Set(templateNames)].filter(
    (templateName) => templateName !== "edit"
  );

  if (
    normalizedTemplateNames.some((templateName) =>
      LEGACY_EDITOR_TEMPLATE_NAMES.has(templateName)
    )
  ) {
    return {
      path: "edit",
      configName: "edit",
    };
  }

  // `directory` and `locator` are shared built-ins. They should not affect
  // whether the editor route is template-scoped.
  const customTemplateNames = normalizedTemplateNames.filter(
    (templateName) => !SHARED_EDITOR_TEMPLATE_NAMES.has(templateName)
  );
  if (customTemplateNames.length === 0) {
    return {
      path: "edit",
      configName: "edit",
    };
  }

  if (customTemplateNames.length !== 1) {
    throw new Error(
      "Unable to determine editor path: expected exactly one non-legacy template, " +
        `received ${customTemplateNames.length} (${customTemplateNames.join(", ") || "none"})`
    );
  }

  const customTemplateName = customTemplateNames[0];
  return {
    path: `edit/${customTemplateName}`,
    configName: `edit-${customTemplateName}`,
  };
};

export const injectEditorTemplateInfo = (
  templateContent: string,
  editorTemplateInfo: EditorTemplateInfo
): string => {
  if (templateContent.includes(EDIT_PATH_PLACEHOLDER)) {
    if (!templateContent.includes(EDIT_TEMPLATE_NAME_PLACEHOLDER)) {
      throw new Error(
        "Unable to inject edit template name: placeholder not found"
      );
    }

    return templateContent
      .replaceAll(EDIT_PATH_PLACEHOLDER, editorTemplateInfo.path)
      .replaceAll(
        EDIT_TEMPLATE_NAME_PLACEHOLDER,
        editorTemplateInfo.configName
      );
  }

  throw new Error("Unable to inject editor path: placeholder not found");
};
