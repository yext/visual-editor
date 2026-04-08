import {
  getCustomEditorTemplateIds,
  getCustomEditorTemplateNames,
  isLegacyEditorTemplateId,
  isSharedEditorTemplateId,
} from "./editorTemplateNames.ts";

export const DEV_TEMPLATE_PICKER_MODE_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_DEV_TEMPLATE_PICKER_MODE__";
export const DEV_TEMPLATE_PICKER_TARGET_PATH_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_DEV_TEMPLATE_PICKER_TARGET_PATH__";
export const DEV_TEMPLATE_PICKER_TEMPLATE_IDS_BASE64_PLACEHOLDER =
  "__YEXT_VISUAL_EDITOR_DEV_TEMPLATE_PICKER_TEMPLATE_IDS_BASE64__";

export type DevTemplatePickerInfo = {
  path: string;
  configName: string;
  entryMode: "redirect" | "chooser";
  redirectTargetPath?: string;
  templateIds: string[];
};

/**
 * Returns the dev-only `/edit` picker behavior for repos that do not have a
 * local `main` template.
 *
 * The picker page either redirects to the only custom editor page or renders a
 * chooser when multiple custom templates are available.
 */
export const getDevTemplatePickerInfoFromTemplateNames = (
  templateNames: string[]
): DevTemplatePickerInfo | null => {
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
 * Injects the dev template picker behavior into the generated `/edit` page.
 */
export const injectDevTemplatePickerInfo = (
  templateContent: string,
  devTemplatePickerInfo: DevTemplatePickerInfo
): string => {
  if (
    !templateContent.includes(DEV_TEMPLATE_PICKER_TARGET_PATH_PLACEHOLDER) ||
    !templateContent.includes(DEV_TEMPLATE_PICKER_MODE_PLACEHOLDER) ||
    !templateContent.includes(
      DEV_TEMPLATE_PICKER_TEMPLATE_IDS_BASE64_PLACEHOLDER
    )
  ) {
    throw new Error(
      "Unable to inject dev template picker info: placeholder not found"
    );
  }

  return templateContent
    .replaceAll(
      DEV_TEMPLATE_PICKER_TARGET_PATH_PLACEHOLDER,
      devTemplatePickerInfo.redirectTargetPath ?? ""
    )
    .replaceAll(
      DEV_TEMPLATE_PICKER_MODE_PLACEHOLDER,
      devTemplatePickerInfo.entryMode
    )
    .replaceAll(
      DEV_TEMPLATE_PICKER_TEMPLATE_IDS_BASE64_PLACEHOLDER,
      Buffer.from(
        JSON.stringify(devTemplatePickerInfo.templateIds),
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
    .filter(
      (templateId) =>
        !isLegacyEditorTemplateId(templateId) &&
        !isSharedEditorTemplateId(templateId)
    )
    .sort((left, right) => left.localeCompare(right));

  return customTemplateIds.length === 1 ? customTemplateIds[0] : null;
};

export { getCustomEditorTemplateIds };
