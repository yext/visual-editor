const LEGACY_EDITOR_TEMPLATE_NAMES = new Set(["main"]);
const SHARED_EDITOR_TEMPLATE_NAMES = new Set(["directory", "locator"]);

export const EDIT_PATH_PLACEHOLDER = "__YEXT_VISUAL_EDITOR_PATH__";
export const EDIT_TEMPLATE_NAME_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_TEMPLATE_NAME__";
export const EDIT_ENTRY_MODE_PLACEHOLDER = "__YEXT_VISUAL_EDITOR_ENTRY_MODE__";
export const EDIT_COMPAT_TARGET_PATH_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_COMPAT_TARGET_PATH__";
export const EDIT_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_ENTRY_TEMPLATE_IDS_BASE64__";

export type EditorTemplateInfo = {
  path: string;
  configName: string;
  templateId?: string;
};

type EditorCompatTemplateInfo = {
  path: string;
  configName: string;
  entryMode: "redirect" | "chooser";
  redirectTargetPath?: string;
  templateIds: string[];
};

const getNormalizedTemplateNames = (templateNames: string[]): string[] => {
  return [...new Set(templateNames)].filter(
    (templateName) => templateName !== "edit"
  );
};

const getCustomTemplateNames = (templateNames: string[]): string[] => {
  return getNormalizedTemplateNames(templateNames)
    .filter(
      (templateName) =>
        !LEGACY_EDITOR_TEMPLATE_NAMES.has(templateName) &&
        !SHARED_EDITOR_TEMPLATE_NAMES.has(templateName)
    )
    .sort((left, right) => left.localeCompare(right));
};

export const getEditorTemplateInfosFromTemplateNames = (
  templateNames: string[]
): EditorTemplateInfo[] => {
  const normalizedTemplateNames = getNormalizedTemplateNames(templateNames);
  const hasLegacyTemplate = normalizedTemplateNames.some((templateName) =>
    LEGACY_EDITOR_TEMPLATE_NAMES.has(templateName)
  );

  if (hasLegacyTemplate) {
    return [
      {
        path: "edit",
        configName: "edit",
      },
    ];
  }

  const customTemplateNames = getCustomTemplateNames(normalizedTemplateNames);
  if (customTemplateNames.length === 0) {
    return [
      {
        path: "edit",
        configName: "edit",
      },
    ];
  }

  return customTemplateNames.map((templateId) => ({
    templateId,
    path: `edit/${templateId}`,
    configName: `edit-${templateId}`,
  }));
};

export const getEditorTemplateInfoFromTemplateNames = (
  templateNames: string[]
): EditorTemplateInfo => {
  const editorTemplateInfos =
    getEditorTemplateInfosFromTemplateNames(templateNames);
  if (editorTemplateInfos.length === 1) {
    return editorTemplateInfos[0];
  }

  const customTemplateNames = getCustomTemplateNames(templateNames);
  throw new Error(
    "Unable to determine editor path: expected exactly one non-legacy template, " +
      `received ${customTemplateNames.length} (${customTemplateNames.join(", ") || "none"})`
  );
};

export const injectEditorTemplateInfo = (
  templateContent: string,
  editorTemplateInfo: EditorTemplateInfo
): string => {
  if (!templateContent.includes(EDIT_PATH_PLACEHOLDER)) {
    throw new Error("Unable to inject editor path: placeholder not found");
  }

  if (!templateContent.includes(EDIT_TEMPLATE_NAME_PLACEHOLDER)) {
    throw new Error(
      "Unable to inject edit template name: placeholder not found"
    );
  }

  return templateContent
    .replaceAll(EDIT_PATH_PLACEHOLDER, editorTemplateInfo.path)
    .replaceAll(EDIT_TEMPLATE_NAME_PLACEHOLDER, editorTemplateInfo.configName);
};

export const getEditorCompatTemplateInfoFromTemplateNames = (
  templateNames: string[]
): EditorCompatTemplateInfo | null => {
  const normalizedTemplateNames = getNormalizedTemplateNames(templateNames);
  const hasLegacyTemplate = normalizedTemplateNames.some((templateName) =>
    LEGACY_EDITOR_TEMPLATE_NAMES.has(templateName)
  );
  if (hasLegacyTemplate) {
    return null;
  }

  const customTemplateNames = getCustomTemplateNames(normalizedTemplateNames);
  if (customTemplateNames.length === 0) {
    return null;
  }

  if (customTemplateNames.length === 1) {
    return {
      path: "edit",
      configName: "edit",
      entryMode: "redirect",
      redirectTargetPath: `edit/${customTemplateNames[0]}`,
      templateIds: customTemplateNames,
    };
  }

  return {
    path: "edit",
    configName: "edit",
    entryMode: "chooser",
    templateIds: customTemplateNames,
  };
};

export const injectEditorCompatTemplateInfo = (
  templateContent: string,
  editorCompatTemplateInfo: EditorCompatTemplateInfo
): string => {
  if (
    !templateContent.includes(EDIT_COMPAT_TARGET_PATH_PLACEHOLDER) ||
    !templateContent.includes(EDIT_ENTRY_MODE_PLACEHOLDER) ||
    !templateContent.includes(EDIT_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER)
  ) {
    throw new Error(
      "Unable to inject edit entry template info: placeholder not found"
    );
  }

  return templateContent
    .replaceAll(
      EDIT_COMPAT_TARGET_PATH_PLACEHOLDER,
      editorCompatTemplateInfo.redirectTargetPath ?? ""
    )
    .replaceAll(EDIT_ENTRY_MODE_PLACEHOLDER, editorCompatTemplateInfo.entryMode)
    .replaceAll(
      EDIT_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER,
      Buffer.from(
        JSON.stringify(editorCompatTemplateInfo.templateIds),
        "utf8"
      ).toString("base64")
    );
};

export const getEditorTemplateFilePath = (
  editorTemplateInfo: EditorTemplateInfo
): string => {
  if (editorTemplateInfo.configName === "edit") {
    return "src/templates/edit.tsx";
  }

  return `src/templates/${editorTemplateInfo.configName}.tsx`;
};

export const isManagedEditorTemplateFileName = (templateFileName: string) => {
  return templateFileName === "edit" || templateFileName.startsWith("edit-");
};

export const getLocalTemplateIdFromEditorPath = (
  pathname: string | undefined,
  availableTemplateIds: Iterable<string>
): string | null => {
  if (!pathname) {
    return null;
  }

  const match = pathname.replace(/\/+$/, "").match(/^\/edit\/([^/]+)$/);
  if (!match) {
    return null;
  }

  const templateId = decodeURIComponent(match[1]);
  return new Set(availableTemplateIds).has(templateId) ? templateId : null;
};

export const getSingleCustomTemplateId = (
  templateIds: Iterable<string>
): string | null => {
  const customTemplateIds = [...new Set(templateIds)]
    .filter((templateId) => !SHARED_EDITOR_TEMPLATE_NAMES.has(templateId))
    .sort((left, right) => left.localeCompare(right));

  return customTemplateIds.length === 1 ? customTemplateIds[0] : null;
};

export const isSharedEditorTemplateId = (templateId: string): boolean => {
  return SHARED_EDITOR_TEMPLATE_NAMES.has(templateId);
};

export const isLegacyEditorTemplateId = (templateId: string): boolean => {
  return LEGACY_EDITOR_TEMPLATE_NAMES.has(templateId);
};

export const getCustomEditorTemplateIds = (
  templateIds: Iterable<string>
): string[] => {
  return [...new Set(templateIds)]
    .filter(
      (templateId) =>
        !isLegacyEditorTemplateId(templateId) &&
        !isSharedEditorTemplateId(templateId)
    )
    .sort((left, right) => left.localeCompare(right));
};
