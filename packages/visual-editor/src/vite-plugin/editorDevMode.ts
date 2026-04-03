import {
  getCustomEditorTemplateIds,
  getCustomEditorTemplateNames,
  isSharedEditorTemplateId,
} from "./editorTemplateNames.ts";

export const EDIT_DEV_ENTRY_MODE_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_DEV_ENTRY_MODE__";
export const EDIT_DEV_ENTRY_TARGET_PATH_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_DEV_ENTRY_TARGET_PATH__";
export const EDIT_DEV_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_DEV_ENTRY_TEMPLATE_IDS_BASE64__";

export type EditorDevEntryTemplateInfo = {
  path: string;
  configName: string;
  entryMode: "redirect" | "chooser";
  redirectTargetPath?: string;
  templateIds: string[];
};

/**
 * Returns the dev-only `/edit` entry-page behavior for repos that do not have
 * a local `main` template.
 *
 * The entry page either redirects to the only custom editor page or renders a
 * chooser when multiple custom templates are available.
 */
export const getEditorDevEntryTemplateInfoFromTemplateNames = (
  templateNames: string[]
): EditorDevEntryTemplateInfo | null => {
  if (templateNames.includes("main")) {
    return null;
  }

  const customTemplateNames = getCustomEditorTemplateNames(templateNames);
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

/**
 * Injects the dev entry-page behavior into the generated `/edit` entry page.
 */
export const injectEditorDevEntryTemplateInfo = (
  templateContent: string,
  editorDevEntryTemplateInfo: EditorDevEntryTemplateInfo
): string => {
  if (
    !templateContent.includes(EDIT_DEV_ENTRY_TARGET_PATH_PLACEHOLDER) ||
    !templateContent.includes(EDIT_DEV_ENTRY_MODE_PLACEHOLDER) ||
    !templateContent.includes(EDIT_DEV_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER)
  ) {
    throw new Error(
      "Unable to inject edit dev entry template info: placeholder not found"
    );
  }

  return templateContent
    .replaceAll(
      EDIT_DEV_ENTRY_TARGET_PATH_PLACEHOLDER,
      editorDevEntryTemplateInfo.redirectTargetPath ?? ""
    )
    .replaceAll(
      EDIT_DEV_ENTRY_MODE_PLACEHOLDER,
      editorDevEntryTemplateInfo.entryMode
    )
    .replaceAll(
      EDIT_DEV_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER,
      Buffer.from(
        JSON.stringify(editorDevEntryTemplateInfo.templateIds),
        "utf8"
      ).toString("base64")
    );
};

/**
 * Resolves `/edit/{templateId}` back to a local template id when that template
 * exists in the current repo.
 */
export const getLocalTemplateIdFromEditorPath = (
  pathname: string | undefined,
  availableTemplateIds: Iterable<string>
): string | null => {
  if (!pathname) {
    return null;
  }

  // Trim trailing slashes, then capture the single path segment after `/edit/`
  // so `/edit/demo-shop` matches while `/edit` and `/edit/demo-shop/extra` do not.
  const match = pathname.replace(/\/+$/, "").match(/^\/edit\/([^/]+)$/);
  if (!match) {
    return null;
  }

  const templateId = decodeURIComponent(match[1]);
  return new Set(availableTemplateIds).has(templateId) ? templateId : null;
};

/**
 * Returns the only custom template id when exactly one non-shared template is
 * available. Shared templates such as `directory` and `locator` are excluded.
 */
export const getSingleCustomTemplateId = (
  templateIds: Iterable<string>
): string | null => {
  const customTemplateIds = [...new Set(templateIds)]
    .filter((templateId) => !isSharedEditorTemplateId(templateId))
    .sort((left, right) => left.localeCompare(right));

  return customTemplateIds.length === 1 ? customTemplateIds[0] : null;
};

export { getCustomEditorTemplateIds };
