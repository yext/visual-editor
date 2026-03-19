export {
  applyAnalytics,
  getAnalyticsScopeHash,
} from "./utils/applyAnalytics.ts";
export { applyHeaderScript } from "./utils/applyHeaderScript.ts";
export { applyCertifiedFacts } from "./utils/applyCertifiedFacts.ts";
export { applyTheme } from "./utils/applyTheme.ts";
export { getCanonicalUrl } from "./utils/canonicalUrl.ts";
export { filterComponentsFromConfig } from "./utils/filterComponents.ts";
export { getPageMetadata } from "./utils/getPageMetadata.ts";
export {
  i18nComponentsInstance,
  injectTranslations,
} from "./utils/i18n/components.ts";
export {
  migrate,
  type Migration,
  type MigrationAction,
  type MigrationRegistry,
} from "./utils/migrate.ts";
export { getSchema } from "./utils/schema/getSchema.ts";
export { VisualEditorProvider } from "./utils/VisualEditorProvider.tsx";
export {
  resolveUrlTemplate,
  resolveUrlTemplateOfChild,
} from "./utils/urls/resolveUrlTemplate.ts";
export {
  mainConfig,
  type MainConfigProps,
} from "./components/configs/mainConfig.tsx";
export {
  directoryConfig,
  type DirectoryConfigProps,
} from "./components/configs/directoryConfig.tsx";
export {
  locatorConfig,
  type LocatorConfigProps,
} from "./components/configs/locatorConfig.tsx";
export { migrationRegistry } from "./components/migrations/migrationRegistry.ts";
export {
  defaultThemeConfig,
  createDefaultThemeConfig,
} from "./components/DefaultThemeConfig.ts";
