import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "fs-extra";
import { tsImport } from "tsx/esm/api";
import { buildLocalEditorDataTemplateName } from "./generatedFiles.ts";
import type {
  LocalEditorConfig,
  ResolvedLocalEditorConfig,
  ResolvedLocalEditorTemplateConfig,
  TemplateManifestEntry,
} from "./types.ts";
import { toErrorMessage } from "./utils.ts";

import {
  DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH,
  toAbsoluteLocalEditorPath,
} from "./generatedFiles.ts";

/**
 * Loads the local-editor config and merges it with template-manifest defaults.
 *
 * The config is always read from `stream.config.ts`. When that file does not
 * exist, this records a diagnostic and falls back to one resolved template per
 * manifest entry so the local editor can still boot with manifest-derived
 * default layouts. When the config exists but cannot be loaded, this records
 * the error and returns no active templates.
 */
export const readResolvedTemplateConfigs = async (
  rootDir: string,
  templateManifestEntries: TemplateManifestEntry[],
  diagnostics: string[]
): Promise<ResolvedLocalEditorConfig> => {
  const absoluteStreamConfigPath = toAbsoluteLocalEditorPath(
    rootDir,
    DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH
  );
  if (!fs.existsSync(absoluteStreamConfigPath)) {
    diagnostics.push(
      `Missing local editor config at ${path.relative(process.cwd(), absoluteStreamConfigPath)}. Create this file to configure templates and snapshot defaults.`
    );
    return {
      defaults: {},
      templates: templateManifestEntries.map((templateEntry) => {
        return {
          templateId: templateEntry.name,
          dataTemplateName: buildLocalEditorDataTemplateName(
            templateEntry.name
          ),
          defaults: {},
          defaultLayoutData: normalizeDefaultLayoutData(
            templateEntry.defaultLayoutData
          ),
        };
      }),
    };
  }

  let streamConfig: LocalEditorConfig | undefined;
  try {
    streamConfig = await loadLocalEditorConfig(absoluteStreamConfigPath);
  } catch (error) {
    diagnostics.push(toErrorMessage(error));
    return {
      defaults: {},
      templates: [],
    };
  }

  return buildResolvedTemplateConfigs(templateManifestEntries, streamConfig);
};

const buildResolvedTemplateConfigs = (
  templateManifestEntries: TemplateManifestEntry[],
  streamConfig: LocalEditorConfig
): ResolvedLocalEditorConfig => {
  return buildTemplateAwareResolvedConfig(
    templateManifestEntries,
    streamConfig
  );
};

const loadLocalEditorConfig = async (
  absoluteStreamConfigPath: string
): Promise<LocalEditorConfig> => {
  if (path.extname(absoluteStreamConfigPath) === ".json") {
    throw new Error(
      `Unsupported local editor config at ${path.relative(process.cwd(), absoluteStreamConfigPath)}: move JSON config into a TypeScript file such as ${DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH}`
    );
  }

  return loadTypeScriptLocalEditorConfig(absoluteStreamConfigPath);
};

/**
 * Imports a TypeScript local-editor config through a unique temporary path.
 *
 * Copying the config file to a cache-bypass filename avoids stale module reuse
 * across repeated dev-server loads. The temporary file is always removed after
 * import, even when evaluation fails.
 */
const loadTypeScriptLocalEditorConfig = async (
  absoluteStreamConfigPath: string
): Promise<LocalEditorConfig> => {
  const cacheBypassPath = buildLocalEditorConfigCacheBypassPath(
    absoluteStreamConfigPath
  );
  fs.copyFileSync(absoluteStreamConfigPath, cacheBypassPath);

  try {
    const importedModule = await tsImport(
      pathToFileURL(cacheBypassPath).href,
      import.meta.url
    );
    let loadedConfig: unknown = importedModule;
    while (isModuleWrapper(loadedConfig)) {
      loadedConfig = loadedConfig.default;
    }
    return validateLoadedLocalEditorConfig(
      absoluteStreamConfigPath,
      loadedConfig
    );
  } finally {
    fs.removeSync(cacheBypassPath);
  }
};

const validateLoadedLocalEditorConfig = (
  absoluteStreamConfigPath: string,
  loadedConfig: unknown
): LocalEditorConfig => {
  if (!loadedConfig || typeof loadedConfig !== "object") {
    throw new Error(
      `Failed to parse local editor stream config at ${path.relative(process.cwd(), absoluteStreamConfigPath)}: expected a default-exported object`
    );
  }

  return loadedConfig as LocalEditorConfig;
};

/**
 * Resolves template-aware config into the runtime shape expected by the shell.
 *
 * Templates are ordered by manifest order first so generated artifacts stay
 * stable, then any config-only template ids are appended. Only templates with a
 * configured stream are included in the resolved result.
 */
const buildTemplateAwareResolvedConfig = (
  templateManifestEntries: TemplateManifestEntry[],
  streamConfig: LocalEditorConfig
): ResolvedLocalEditorConfig => {
  const manifestTemplates = getManifestTemplateIds(templateManifestEntries);
  const templateEntryMap = createTemplateEntryMap(templateManifestEntries);
  const orderedTemplateIds = [
    ...manifestTemplates.filter((templateId) => {
      return !!streamConfig.templates?.[templateId];
    }),
    ...Object.keys(streamConfig.templates ?? {}).filter((templateId) => {
      return !manifestTemplates.includes(templateId);
    }),
  ];

  const activeTemplateConfigs = orderedTemplateIds.flatMap((templateId) => {
    const templateConfig = streamConfig.templates?.[templateId] ?? {};
    if (!templateConfig.stream) {
      return [];
    }

    return [
      buildResolvedTemplateConfig({
        templateId,
        defaults: {
          entityId: templateConfig.defaults?.entityId,
          locale:
            templateConfig.defaults?.locale ?? streamConfig.defaults?.locale,
        },
        stream: templateConfig.stream,
        templateEntryMap,
      }),
    ];
  });

  return {
    defaults: {
      templateId: streamConfig.defaults?.templateId,
      entityId: streamConfig.defaults?.entityId,
      locale: streamConfig.defaults?.locale,
    },
    templates: activeTemplateConfigs,
  };
};

const buildResolvedTemplateConfig = ({
  templateId,
  defaults,
  stream,
  templateEntryMap,
}: {
  templateId: string;
  defaults: { entityId?: string; locale?: string };
  stream?: ResolvedLocalEditorTemplateConfig["stream"];
  templateEntryMap: Map<string, TemplateManifestEntry>;
}): ResolvedLocalEditorTemplateConfig => {
  return {
    templateId,
    dataTemplateName: buildLocalEditorDataTemplateName(templateId),
    defaults,
    stream,
    defaultLayoutData: normalizeDefaultLayoutData(
      templateEntryMap.get(templateId)?.defaultLayoutData
    ),
  };
};

const getManifestTemplateIds = (
  templateManifestEntries: TemplateManifestEntry[]
): string[] => {
  return templateManifestEntries.map((templateEntry) => {
    return templateEntry.name;
  });
};

const createTemplateEntryMap = (
  templateManifestEntries: TemplateManifestEntry[]
): Map<string, TemplateManifestEntry> => {
  return new Map(
    templateManifestEntries.map((templateEntry) => {
      return [templateEntry.name, templateEntry];
    })
  );
};

const isModuleWrapper = (
  value: unknown
): value is { default: unknown; __esModule?: boolean } => {
  if (!value || typeof value !== "object" || !("default" in value)) {
    return false;
  }

  return Object.keys(value).every((key) => {
    return key === "default" || key === "__esModule";
  });
};

const buildLocalEditorConfigCacheBypassPath = (
  absoluteStreamConfigPath: string
): string => {
  const extension = path.extname(absoluteStreamConfigPath);
  const baseName = path.basename(absoluteStreamConfigPath, extension);
  const cacheBypassSuffix = `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 10)}`;

  return path.join(
    path.dirname(absoluteStreamConfigPath),
    `.${baseName}.local-editor.${cacheBypassSuffix}${extension}`
  );
};

/**
 * Normalizes manifest layout defaults into their runtime representation.
 *
 * Manifest entries may store layout data as a parsed object or as a JSON
 * string. JSON strings are parsed when possible; otherwise the original value
 * is preserved.
 */
const normalizeDefaultLayoutData = (defaultLayoutData: unknown): unknown => {
  if (typeof defaultLayoutData !== "string") {
    return defaultLayoutData;
  }

  try {
    return JSON.parse(defaultLayoutData) as unknown;
  } catch {
    return defaultLayoutData;
  }
};
