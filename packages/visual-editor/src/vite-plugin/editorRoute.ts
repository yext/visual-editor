const LEGACY_EDITOR_TEMPLATE_NAMES = new Set(["main"]);
const SHARED_EDITOR_TEMPLATE_NAMES = new Set(["directory", "locator"]);

export const EDIT_PATH_PLACEHOLDER = "__YEXT_VISUAL_EDITOR_PATH__";
export const EDIT_TEMPLATE_NAME_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_TEMPLATE_NAME__";
export const EDIT_DEV_ENTRY_MODE_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_DEV_ENTRY_MODE__";
export const EDIT_DEV_ENTRY_TARGET_PATH_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_DEV_ENTRY_TARGET_PATH__";
export const EDIT_DEV_ENTRY_TEMPLATE_IDS_BASE64_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_DEV_ENTRY_TEMPLATE_IDS_BASE64__";

export type EditorTemplateInfo = {
  path: string;
  configName: string;
  templateId?: string;
};

export type EditorDevEntryTemplateInfo = {
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

  const customTemplateNames = getCustomTemplateNames(templateNames);
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
