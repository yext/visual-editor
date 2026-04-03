import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "fs-extra";
import { tsImport } from "tsx/esm/api";
import { buildLocalEditorDataTemplateName } from "./generatedFiles.ts";
import type {
  LegacyLocalEditorConfig,
  LocalEditorConfig,
  ResolvedLocalEditorConfig,
  ResolvedLocalEditorTemplateConfig,
  SupportedLocalEditorConfig,
  TemplateManifestEntry,
} from "./types.ts";
import { readJsonFile, toErrorMessage } from "./utils.ts";

import {
  DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH,
  DEFAULT_LOCAL_EDITOR_STREAM_PATH,
  LEGACY_LOCAL_EDITOR_STREAM_CONFIG_PATH,
} from "./generatedFiles.ts";

export const resolveLocalEditorStreamConfigPath = async (
  rootDir: string,
  configuredPath?: string
): Promise<string> => {
  if (configuredPath) {
    return configuredPath;
  }

  for (const candidatePath of [
    DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH,
    DEFAULT_LOCAL_EDITOR_STREAM_PATH,
    LEGACY_LOCAL_EDITOR_STREAM_CONFIG_PATH,
  ]) {
    if (fs.existsSync(path.join(rootDir, candidatePath))) {
      return candidatePath;
    }
  }

  return DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH;
};

export const readResolvedTemplateConfigs = async (
  rootDir: string,
  streamConfigPath: string,
  templateManifestEntries: TemplateManifestEntry[],
  diagnostics: string[]
): Promise<ResolvedLocalEditorConfig> => {
  const absoluteStreamConfigPath = path.join(rootDir, streamConfigPath);
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

  let streamConfig: SupportedLocalEditorConfig | undefined;
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
  streamConfig: SupportedLocalEditorConfig
): ResolvedLocalEditorConfig => {
  if (
    isTemplateAwareLocalEditorConfig(streamConfig) &&
    streamConfig.templates
  ) {
    return buildTemplateAwareResolvedConfig(
      templateManifestEntries,
      streamConfig
    );
  }

  return buildLegacyResolvedConfig(
    templateManifestEntries,
    streamConfig as LegacyLocalEditorConfig
  );
};

const loadLocalEditorConfig = async (
  absoluteStreamConfigPath: string
): Promise<SupportedLocalEditorConfig> => {
  const extension = path.extname(absoluteStreamConfigPath);
  if (extension === ".json") {
    return loadJsonLocalEditorConfig(absoluteStreamConfigPath);
  }

  return loadTypeScriptLocalEditorConfig(absoluteStreamConfigPath);
};

const loadJsonLocalEditorConfig = (
  absoluteStreamConfigPath: string
): SupportedLocalEditorConfig => {
  return readJsonFile<SupportedLocalEditorConfig>(
    absoluteStreamConfigPath,
    "local editor stream config"
  );
};

const loadTypeScriptLocalEditorConfig = async (
  absoluteStreamConfigPath: string
): Promise<SupportedLocalEditorConfig> => {
  const cacheBypassPath = buildLocalEditorConfigCacheBypassPath(
    absoluteStreamConfigPath
  );
  fs.copyFileSync(absoluteStreamConfigPath, cacheBypassPath);

  try {
    const importedModule = await tsImport(
      pathToFileURL(cacheBypassPath).href,
      import.meta.url
    );
    return validateLoadedLocalEditorConfig(
      absoluteStreamConfigPath,
      unwrapDefaultExport(importedModule)
    );
  } finally {
    fs.removeSync(cacheBypassPath);
  }
};

const validateLoadedLocalEditorConfig = (
  absoluteStreamConfigPath: string,
  loadedConfig: unknown
): SupportedLocalEditorConfig => {
  if (!loadedConfig || typeof loadedConfig !== "object") {
    throw new Error(
      `Failed to parse local editor stream config at ${path.relative(process.cwd(), absoluteStreamConfigPath)}: expected a default-exported object`
    );
  }

  return loadedConfig as SupportedLocalEditorConfig;
};

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

const buildLegacyResolvedConfig = (
  templateManifestEntries: TemplateManifestEntry[],
  legacyStreamConfig: LegacyLocalEditorConfig
): ResolvedLocalEditorConfig => {
  const manifestTemplates = getManifestTemplateIds(templateManifestEntries);
  const templateEntryMap = createTemplateEntryMap(templateManifestEntries);
  const legacyTemplateIds = (
    legacyStreamConfig.templateIds?.length
      ? legacyStreamConfig.templateIds
      : manifestTemplates
  ).filter((templateId, index, values) => {
    return values.indexOf(templateId) === index;
  });

  return {
    defaults: {
      templateId: legacyStreamConfig.defaults?.templateId,
      entityId: legacyStreamConfig.defaults?.entityId,
      locale: legacyStreamConfig.defaults?.locale,
    },
    templates: legacyTemplateIds.map((templateId) => {
      return buildResolvedTemplateConfig({
        templateId,
        defaults: {
          entityId: legacyStreamConfig.defaults?.entityId,
          locale: legacyStreamConfig.defaults?.locale,
        },
        stream: legacyStreamConfig.stream,
        templateEntryMap,
      });
    }),
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

const isTemplateAwareLocalEditorConfig = (
  value: SupportedLocalEditorConfig
): value is LocalEditorConfig => {
  return "templates" in value;
};

const unwrapDefaultExport = (value: unknown): unknown => {
  let currentValue = value;

  while (isModuleWrapper(currentValue)) {
    currentValue = (currentValue as { default: unknown }).default;
  }

  return currentValue;
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
