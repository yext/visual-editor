const LEGACY_EDITOR_TEMPLATE_NAMES = new Set(["main"]);
const SHARED_EDITOR_TEMPLATE_NAMES = new Set(["directory", "locator"]);

export const EDIT_PATH_PLACEHOLDER = "__YEXT_VISUAL_EDITOR_PATH__";
export const EDIT_TEMPLATE_NAME_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_TEMPLATE_NAME__";
const EDIT_PATH_DECLARATION_PATTERN = /const editPath = ".*?";/;
const LEGACY_GET_PATH_BLOCK_PATTERN =
  /export const getPath:\s*GetPath<TemplateProps>\s*=\s*\(\)\s*=>\s*\{\s*return\s+(".*?");\s*\};/;
const LEGACY_GET_PATH_EXPRESSION_PATTERN =
  /export const getPath:\s*GetPath<TemplateProps>\s*=\s*\(\)\s*=>\s*(".*?");/;
const EDIT_TEMPLATE_NAME_DECLARATION_PATTERN =
  /const editTemplateName = ".*?";/;
const EDIT_CONFIG_NAME_PROPERTY_PATTERN =
  /(export const config:\s*TemplateConfig\s*=\s*\{[\s\S]*?\bname:\s*)(".*?"|editTemplateName)(,)/;

type EditorTemplateInfo = {
  path: string;
  configName: string;
};

const getCustomTemplateNameFromTemplateNames = (
  templateNames: string[]
): string | null => {
  const uniqueTemplateNames = [...new Set(templateNames)].filter(
    (templateName) => templateName !== "edit"
  );

  if (
    uniqueTemplateNames.some((templateName) =>
      LEGACY_EDITOR_TEMPLATE_NAMES.has(templateName)
    )
  ) {
    return null;
  }

  const customTemplateNames = uniqueTemplateNames.filter(
    (templateName) => !SHARED_EDITOR_TEMPLATE_NAMES.has(templateName)
  );

  if (customTemplateNames.length === 0) {
    return null;
  }

  if (customTemplateNames.length !== 1) {
    throw new Error(
      "Unable to determine editor path: expected exactly one non-legacy template, " +
        `received ${customTemplateNames.length} (${customTemplateNames.join(", ") || "none"})`
    );
  }

  return customTemplateNames[0];
};

export const getEditorTemplateInfoFromTemplateNames = (
  templateNames: string[]
): EditorTemplateInfo => {
  const customTemplateName =
    getCustomTemplateNameFromTemplateNames(templateNames);

  if (!customTemplateName) {
    return {
      path: "edit",
      configName: "edit",
    };
  }

  return {
    path: `edit/${customTemplateName}`,
    configName: `edit-${customTemplateName}`,
  };
};

export const getEditorPathFromTemplateNames = (
  templateNames: string[]
): string => {
  return getEditorTemplateInfoFromTemplateNames(templateNames).path;
};

export const getEditorConfigNameFromTemplateNames = (
  templateNames: string[]
): string => {
  return getEditorTemplateInfoFromTemplateNames(templateNames).configName;
};

export const injectEditorTemplateInfo = (
  templateContent: string,
  editorTemplateInfo: EditorTemplateInfo
): string => {
  let updatedContent = templateContent;

  if (updatedContent.includes(EDIT_PATH_PLACEHOLDER)) {
    updatedContent = updatedContent.replace(
      EDIT_PATH_PLACEHOLDER,
      editorTemplateInfo.path
    );
  } else if (EDIT_PATH_DECLARATION_PATTERN.test(updatedContent)) {
    updatedContent = updatedContent.replace(
      EDIT_PATH_DECLARATION_PATTERN,
      `const editPath = "${editorTemplateInfo.path}";`
    );
  } else {
    const migratedLegacyGetPath = migrateLegacyGetPath(
      updatedContent,
      editorTemplateInfo.path
    );
    if (!migratedLegacyGetPath) {
      throw new Error("Unable to inject editor path: placeholder not found");
    }
    updatedContent = migratedLegacyGetPath;
  }

  if (updatedContent.includes(EDIT_TEMPLATE_NAME_PLACEHOLDER)) {
    return updatedContent.replace(
      EDIT_TEMPLATE_NAME_PLACEHOLDER,
      editorTemplateInfo.configName
    );
  }

  if (EDIT_TEMPLATE_NAME_DECLARATION_PATTERN.test(updatedContent)) {
    return updatedContent.replace(
      EDIT_TEMPLATE_NAME_DECLARATION_PATTERN,
      `const editTemplateName = "${editorTemplateInfo.configName}";`
    );
  }

  if (!EDIT_CONFIG_NAME_PROPERTY_PATTERN.test(updatedContent)) {
    throw new Error(
      "Unable to inject edit template name: placeholder not found"
    );
  }

  return updatedContent.replace(
    EDIT_CONFIG_NAME_PROPERTY_PATTERN,
    `$1"${editorTemplateInfo.configName}"$3`
  );
};

const migrateLegacyGetPath = (
  templateContent: string,
  editorPath: string
): string | null => {
  if (LEGACY_GET_PATH_BLOCK_PATTERN.test(templateContent)) {
    return templateContent.replace(
      LEGACY_GET_PATH_BLOCK_PATTERN,
      `const editPath = "${editorPath}";

export const getPath: GetPath<TemplateProps> = () => {
  return editPath;
};`
    );
  }

  if (LEGACY_GET_PATH_EXPRESSION_PATTERN.test(templateContent)) {
    return templateContent.replace(
      LEGACY_GET_PATH_EXPRESSION_PATTERN,
      `const editPath = "${editorPath}";

export const getPath: GetPath<TemplateProps> = () => {
  return editPath;
};`
    );
  }

  return null;
};
