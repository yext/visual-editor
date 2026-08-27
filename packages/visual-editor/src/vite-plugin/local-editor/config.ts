import path from "node:path";
import { pathToFileURL } from "node:url";
import fs from "fs-extra";
import { tsImport } from "tsx/esm/api";
import type { SectionLibraryLayout } from "../../types/sectionLibrary.ts";
import { buildLocalEditorDataTemplateName } from "./generatedFiles.ts";
import type { LocalEditorConfig, ResolvedLocalEditorConfig } from "./types.ts";
import { toErrorMessage } from "./utils.ts";
import {
  DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH,
  toAbsoluteLocalEditorPath,
} from "./generatedFiles.ts";

let cachedStreamConfig:
  | { filePath: string; config: LocalEditorConfig }
  | undefined;

/**
 * Loads the Local Editor stream settings for the Section Library layouts.
 *
 * 1. Load the root `stream.config.ts` file with tsx.
 * 2. Merge global, page set, and layout settings.
 * 3. Return diagnostics when the file is missing or invalid.
 */
export const readResolvedLayoutConfigs = async (
  rootDir: string,
  layouts: SectionLibraryLayout[],
  diagnostics: string[]
): Promise<ResolvedLocalEditorConfig> => {
  const streamConfigPath = toAbsoluteLocalEditorPath(
    rootDir,
    DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH
  );
  if (!fs.existsSync(streamConfigPath)) {
    diagnostics.push(
      `Missing local editor config at ${path.relative(process.cwd(), streamConfigPath)}.`
    );
    return resolveLocalEditorConfigs(layouts, {});
  }

  try {
    return resolveLocalEditorConfigs(
      layouts,
      await loadLocalEditorConfig(streamConfigPath)
    );
  } catch (error) {
    diagnostics.push(toErrorMessage(error));
    return resolveLocalEditorConfigs(layouts, {});
  }
};

const loadLocalEditorConfig = async (
  streamConfigPath: string
): Promise<LocalEditorConfig> => {
  if (path.extname(streamConfigPath) === ".json") {
    throw new Error(
      `Unsupported local editor config at ${path.relative(process.cwd(), streamConfigPath)}: use ${DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH}.`
    );
  }

  if (cachedStreamConfig?.filePath === streamConfigPath) {
    return cachedStreamConfig.config;
  }

  const importedModule = await tsImport(
    pathToFileURL(streamConfigPath).href,
    import.meta.url
  );
  let config: unknown = importedModule;
  while (
    config &&
    typeof config === "object" &&
    "default" in config &&
    Object.keys(config).every(
      (key) => key === "default" || key === "__esModule"
    )
  ) {
    config = config.default;
  }
  if (!config || typeof config !== "object") {
    throw new Error(
      `Failed to parse local editor stream config at ${path.relative(process.cwd(), streamConfigPath)}: expected a default-exported object.`
    );
  }
  const resolvedConfig = config as LocalEditorConfig;
  cachedStreamConfig = {
    filePath: streamConfigPath,
    config: resolvedConfig,
  };
  return resolvedConfig;
};

export const resolveLocalEditorConfigs = (
  libraryLayouts: SectionLibraryLayout[],
  streamConfig: LocalEditorConfig
): ResolvedLocalEditorConfig => {
  const layouts = libraryLayouts.flatMap((libraryLayout) => {
    const layoutId = libraryLayout.metadata.id;
    const pageSetType = libraryLayout.metadata.pageSetType;
    const pageSetTypeConfig = streamConfig.pageSetTypes?.[pageSetType];
    const layoutConfig = streamConfig.layouts?.[layoutId];
    const stream = layoutConfig?.stream ?? pageSetTypeConfig?.stream;
    const dataSource: "stream" | "fixture" =
      pageSetType === "ENTITY" || (pageSetType === "DIRECTORY" && stream)
        ? "stream"
        : "fixture";
    if (dataSource === "stream" && !stream) {
      return [];
    }
    return [
      {
        layoutId,
        dataTemplateName: buildLocalEditorDataTemplateName(layoutId),
        pageSetType,
        dataSource,
        defaults: {
          entityId:
            layoutConfig?.defaults?.entityId ??
            pageSetTypeConfig?.defaults?.entityId,
          locale:
            layoutConfig?.defaults?.locale ??
            pageSetTypeConfig?.defaults?.locale ??
            streamConfig.defaults?.locale,
        },
        stream: dataSource === "stream" ? stream : undefined,
        defaultLayoutData: libraryLayout.defaultLayout,
      },
    ];
  });
  return {
    defaults: {
      layoutId: streamConfig.defaults?.layoutId,
      entityId: streamConfig.defaults?.entityId,
      locale: streamConfig.defaults?.locale,
    },
    env: streamConfig.env ?? {},
    layouts,
  };
};
