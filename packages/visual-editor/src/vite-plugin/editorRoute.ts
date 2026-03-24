const LEGACY_EDITOR_TEMPLATE_NAMES = new Set(["main"]);
const SHARED_EDITOR_TEMPLATE_NAMES = new Set(["directory", "locator"]);

export const EDIT_PATH_PLACEHOLDER = "__YEXT_VISUAL_EDITOR_PATH__";

export const getEditorPathFromTemplateNames = (
  templateNames: string[]
): string => {
  const uniqueTemplateNames = [...new Set(templateNames)].filter(
    (templateName) => templateName !== "edit"
  );

  if (
    uniqueTemplateNames.some((templateName) =>
      LEGACY_EDITOR_TEMPLATE_NAMES.has(templateName)
    )
  ) {
    return "edit";
  }

  const customTemplateNames = uniqueTemplateNames.filter(
    (templateName) => !SHARED_EDITOR_TEMPLATE_NAMES.has(templateName)
  );

  if (customTemplateNames.length === 0) {
    return "edit";
  }

  if (customTemplateNames.length !== 1) {
    throw new Error(
      "Unable to determine editor path: expected exactly one non-legacy template, " +
        `received ${customTemplateNames.length} (${customTemplateNames.join(", ") || "none"})`
    );
  }

  return `edit/${customTemplateNames[0]}`;
};

export const injectEditorPath = (
  templateContent: string,
  editorPath: string
): string => {
  if (!templateContent.includes(EDIT_PATH_PLACEHOLDER)) {
    throw new Error("Unable to inject editor path: placeholder not found");
  }

  return templateContent.replace(EDIT_PATH_PLACEHOLDER, editorPath);
};
