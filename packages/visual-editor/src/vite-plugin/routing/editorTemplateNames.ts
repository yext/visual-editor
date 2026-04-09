const LEGACY_EDITOR_TEMPLATE_NAMES = new Set(["main"]);
const SHARED_EDITOR_TEMPLATE_NAMES = new Set(["directory", "locator"]);

export type EffectiveEditorTemplateNames = {
  templateNames: string[];
  usesFallbackMain: boolean;
};

const getNormalizedTemplateNames = (
  templateNames: Iterable<string>
): string[] => {
  return [...new Set(templateNames)].filter(
    (templateName) => templateName !== "edit"
  );
};

const normalizeAndFilterTemplates = (
  templateNames: Iterable<string>
): string[] => {
  return getNormalizedTemplateNames(templateNames)
    .filter(
      (templateName) =>
        !LEGACY_EDITOR_TEMPLATE_NAMES.has(templateName) &&
        !SHARED_EDITOR_TEMPLATE_NAMES.has(templateName)
    )
    .sort((left, right) => left.localeCompare(right));
};

/**
 * Returns only repo-defined custom template names, excluding built-in shared
 * templates and the legacy `main` template.
 */
export const getCustomEditorTemplateNames = (
  templateNames: Iterable<string>
): string[] => {
  return normalizeAndFilterTemplates(templateNames);
};

/**
 * Computes the final template set that the package should treat as available.
 *
 * The built-in shared templates are always present. `main` is synthesized only
 * when the repo does not explicitly define it and there are no explicit custom
 * templates.
 */
export const getEffectiveEditorTemplateNames = (
  explicitLocalTemplateNames: Iterable<string>
): EffectiveEditorTemplateNames => {
  const normalizedTemplateNames = getNormalizedTemplateNames(
    explicitLocalTemplateNames
  );
  const customTemplateNames = getCustomEditorTemplateNames(
    normalizedTemplateNames
  );
  const hasExplicitMain = normalizedTemplateNames.some((templateName) =>
    LEGACY_EDITOR_TEMPLATE_NAMES.has(templateName)
  );
  const usesFallbackMain = !hasExplicitMain && customTemplateNames.length === 0;

  return {
    templateNames: [
      ...(hasExplicitMain || usesFallbackMain ? ["main"] : []),
      ...SHARED_EDITOR_TEMPLATE_NAMES,
      ...customTemplateNames,
    ],
    usesFallbackMain,
  };
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
  return normalizeAndFilterTemplates(templateIds);
};
