export * from "./i18n/index.ts";
export * from "./schema/index.ts";
export { fetchLocalesToPathsForEntity } from "./api/fetchLocalesToPathsForEntity.ts";
export { applyAnalytics, getAnalyticsScopeHash } from "./applyAnalytics.ts";
export { applyHeaderScript } from "./applyHeaderScript.ts";
export { applyCertifiedFacts } from "./applyCertifiedFacts.ts";
export { applyTheme } from "./applyTheme.ts";
export { getCanonicalUrl } from "./canonicalUrl.ts";
export { themeManagerCn, themeManagerTwMergeConfiguration } from "./cn.ts";
export { getPageMetadata } from "./getPageMetadata.ts";
export { normalizeLink } from "./normalizeLink.ts";
export {
  migrate,
  type Migration,
  type MigrationAction,
  type MigrationRegistry,
} from "./migrate.ts";
export { resolveComponentData } from "./resolveComponentData.tsx";
export { resolveYextEntityField } from "./resolveYextEntityField.ts";
export {
  createSearchAnalyticsConfig,
  createSearchHeadlessConfig,
} from "./searchHeadlessConfig.ts";
export { normalizeSlug } from "./slugifier.ts";
export {
  backgroundColors,
  defaultThemeTailwindExtensions,
  ThemeOptions,
  type ThemeColor,
  type HeadingLevel,
  VisualEditorComponentsContentPath,
  VisualEditorThemeClassSafelist,
} from "./themeConfigOptions.ts";
export { type ThemeConfig, themeResolver, deepMerge } from "./themeResolver.ts";
export { type StreamDocument } from "./types/StreamDocument.ts";
export {
  resolveUrlTemplate,
  resolveUrlTemplateOfChild,
} from "./urls/resolveUrlTemplate.ts";
export { VisualEditorProvider } from "./VisualEditorProvider.tsx";
export {
  constructFontSelectOptions,
  defaultFonts,
  getFontWeightOptions,
  getFontWeightOverrideOptions,
  type FontRegistry,
} from "./fonts/visualEditorFonts.ts";
export { msg, pt, usePlatformTranslation } from "./i18n/platform.ts";
export { withPropOverrides } from "./withPropOverrides.ts";
