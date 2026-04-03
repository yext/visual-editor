export {
  buildLocalEditorDataTemplateName,
  buildLocalEditorDataTemplatePath,
  buildLocalEditorDataTemplateSource,
  buildLocalEditorTemplateSource,
  DEFAULT_LOCAL_EDITOR_ROUTE,
  DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH,
  DEFAULT_LOCAL_EDITOR_STREAM_PATH,
  ensureLocalEditorStreamConfig,
  GENERATED_LOCAL_EDITOR_TEMPLATE_PREFIX,
  isGeneratedLocalEditorTemplate,
  LEGACY_LOCAL_EDITOR_DATA_TEMPLATE_PATH,
  LEGACY_LOCAL_EDITOR_STREAM_CONFIG_PATH,
  LOCAL_EDITOR_API_BASE_PATH,
  LOCAL_EDITOR_DATA_TEMPLATE_PREFIX,
  normalizeLocalEditorPagesStream,
  normalizeLocalEditorRoute,
  toTemplatePathSegment,
} from "./local-editor/generatedFiles.ts";
export { resolveLocalEditorStreamConfigPath } from "./local-editor/config.ts";
export {
  getLocalEditorDocument,
  getLocalEditorManifest,
} from "./local-editor/data.ts";
export { inferEntityFields } from "./local-editor/entityFields.ts";
export type {
  LocalEditorConfig,
  LocalEditorDocumentResponse,
  LocalEditorManifestResponse,
  LocalEditorPagesStream,
  LocalEditorStreamDefinition,
  LocalEditorTemplateConfig,
} from "./local-editor/types.ts";
