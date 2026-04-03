import { getCustomEditorTemplateNames } from "./editorTemplateNames.ts";

export const EDIT_PATH_PLACEHOLDER = "__YEXT_VISUAL_EDITOR_PATH__";
export const EDIT_TEMPLATE_NAME_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_TEMPLATE_NAME__";

export type EditorTemplateInfo = {
  path: string;
  configName: string;
  templateId?: string;
};

/**
 * Returns the editor pages that should exist for the current starter repo.
 *
 * When `main` exists, the editor keeps the legacy `/edit` route. When `main`
 * is absent, each custom template gets its own real editor page at
 * `/edit/{templateId}`.
 */
export const getEditorTemplateInfosFromTemplateNames = (
  templateNames: string[]
): EditorTemplateInfo[] => {
  if (templateNames.includes("main")) {
    return [
      {
        path: "edit",
        configName: "edit",
      },
    ];
  }

  const customTemplateNames = getCustomEditorTemplateNames(templateNames);
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

/**
 * Preserves the older single-route helper for callers that expect exactly one
 * real editor page. This is mainly useful for tests and legacy call sites.
 */
export const getEditorTemplateInfoFromTemplateNames = (
  templateNames: string[]
): EditorTemplateInfo => {
  const editorTemplateInfos =
    getEditorTemplateInfosFromTemplateNames(templateNames);
  if (editorTemplateInfos.length === 1) {
    return editorTemplateInfos[0];
  }

  const customTemplateNames = getCustomEditorTemplateNames(templateNames);
  throw new Error(
    "Unable to determine editor path: expected exactly one non-legacy template, " +
      `received ${customTemplateNames.length} (${customTemplateNames.join(", ") || "none"})`
  );
};

/**
 * Injects the resolved editor path and config name into the generated editor
 * template source.
 */
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
