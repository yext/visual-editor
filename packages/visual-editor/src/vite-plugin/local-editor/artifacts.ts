import path from "node:path";
import fs from "fs-extra";
import { buildEditorTemplateSource } from "../registryTemplateGenerator.ts";
import { getLocalEditorManifest } from "./data.ts";
import {
  buildLocalEditorDataTemplatePath,
  buildLocalEditorDataTemplateSource,
  buildLocalEditorTemplateSource,
  DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH,
  isGeneratedLocalEditorTemplate,
  LEGACY_LOCAL_EDITOR_DATA_TEMPLATE_PATH,
  LOCAL_EDITOR_DATA_TEMPLATE_PREFIX,
  writeFileIfChanged,
} from "./generatedFiles.ts";
import type { LocalEditorOptions } from "./types.ts";

type CreateLocalEditorArtifactsManagerOptions = {
  localEditorOptions?: LocalEditorOptions;
  localEditorRoute: string;
  localEditorTemplateSource: string;
  localEditorDataTemplateSource: string;
  trackGeneratedFile: (filePath: string) => void;
};

export const createLocalEditorArtifactsManager = ({
  localEditorOptions,
  localEditorRoute,
  localEditorTemplateSource,
  localEditorDataTemplateSource,
  trackGeneratedFile,
}: CreateLocalEditorArtifactsManagerOptions) => {
  let resolvedLocalEditorStreamConfigPath =
    localEditorOptions?.streamConfigPath ??
    DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH;

  const syncLocalEditorTemplate = ({
    rootDir = process.cwd(),
    registryTemplateNames,
  }: {
    rootDir?: string;
    registryTemplateNames: string[];
  }) => {
    const templatePath = path.join(
      rootDir,
      "src",
      "templates",
      "local-editor.tsx"
    );
    let nextTemplateSource = buildLocalEditorTemplateSource(
      localEditorTemplateSource,
      localEditorRoute
    );
    nextTemplateSource = buildEditorTemplateSource({
      rootDir,
      templatePath,
      templateSource: nextTemplateSource,
      templateNames: registryTemplateNames,
    });

    fs.mkdirSync(path.dirname(templatePath), { recursive: true });

    if (
      fs.existsSync(templatePath) &&
      !isGeneratedLocalEditorTemplate(templatePath)
    ) {
      throw new Error(
        `Refusing to overwrite hand-authored local editor template at ${templatePath}`
      );
    }

    writeFileIfChanged(templatePath, nextTemplateSource);
    trackGeneratedFile(templatePath);
  };

  const cleanupLocalEditorTemplate = (rootDir = process.cwd()) => {
    const templatePath = path.join(
      rootDir,
      "src",
      "templates",
      "local-editor.tsx"
    );
    if (isGeneratedLocalEditorTemplate(templatePath)) {
      fs.rmSync(templatePath, { force: true });
    }
  };

  const syncLocalEditorDataTemplates = async ({
    rootDir = process.cwd(),
  }: {
    rootDir?: string;
  } = {}) => {
    const manifest = await getLocalEditorManifest(
      rootDir,
      resolvedLocalEditorStreamConfigPath
    );
    const activeTemplatePaths = new Set<string>();

    for (const templateId of manifest.templates) {
      const templatePath = path.join(
        rootDir,
        buildLocalEditorDataTemplatePath(templateId)
      );
      const streamConfigImportPath = path
        .relative(
          path.dirname(templatePath),
          path.join(rootDir, resolvedLocalEditorStreamConfigPath)
        )
        .split(path.sep)
        .join("/");
      const nextTemplateSource = buildLocalEditorDataTemplateSource(
        localEditorDataTemplateSource,
        streamConfigImportPath.startsWith(".")
          ? streamConfigImportPath
          : `./${streamConfigImportPath}`,
        templateId
      );

      fs.mkdirSync(path.dirname(templatePath), { recursive: true });

      if (
        fs.existsSync(templatePath) &&
        !isGeneratedLocalEditorTemplate(templatePath)
      ) {
        throw new Error(
          `Refusing to overwrite hand-authored local editor data template at ${templatePath}`
        );
      }

      writeFileIfChanged(templatePath, nextTemplateSource);
      activeTemplatePaths.add(templatePath);
    }

    cleanupLocalEditorDataTemplates({
      rootDir,
      activeTemplatePaths,
    });
  };

  const cleanupLocalEditorDataTemplates = ({
    rootDir = process.cwd(),
    activeTemplatePaths,
  }: {
    rootDir?: string;
    activeTemplatePaths?: Set<string>;
  } = {}) => {
    const templatesDirectory = path.join(rootDir, "src", "templates");
    if (!fs.existsSync(templatesDirectory)) {
      return;
    }

    for (const entry of fs.readdirSync(templatesDirectory, {
      withFileTypes: true,
    })) {
      if (!entry.isFile()) {
        continue;
      }

      if (
        !entry.name.startsWith(LOCAL_EDITOR_DATA_TEMPLATE_PREFIX) ||
        path.extname(entry.name) !== ".tsx"
      ) {
        continue;
      }

      const templatePath = path.join(templatesDirectory, entry.name);
      if (
        activeTemplatePaths?.has(templatePath) ||
        !isGeneratedLocalEditorTemplate(templatePath)
      ) {
        continue;
      }

      fs.rmSync(templatePath, { force: true });
    }

    const legacyTemplatePath = path.join(
      rootDir,
      LEGACY_LOCAL_EDITOR_DATA_TEMPLATE_PATH
    );
    if (
      (!activeTemplatePaths || !activeTemplatePaths.has(legacyTemplatePath)) &&
      isGeneratedLocalEditorTemplate(legacyTemplatePath)
    ) {
      fs.rmSync(legacyTemplatePath, { force: true });
    }
  };

  const cleanupGeneratedLocalEditorArtifacts = (rootDir = process.cwd()) => {
    cleanupLocalEditorTemplate(rootDir);
    cleanupLocalEditorDataTemplates({ rootDir });
  };

  const cleanupServeArtifacts = (
    cleanupFiles: () => void,
    rootDir = process.cwd()
  ) => {
    cleanupGeneratedLocalEditorArtifacts(rootDir);
    cleanupFiles();
  };

  return {
    cleanupGeneratedLocalEditorArtifacts,
    cleanupServeArtifacts,
    getResolvedLocalEditorStreamConfigPath: () =>
      resolvedLocalEditorStreamConfigPath,
    setResolvedLocalEditorStreamConfigPath: (nextPath: string) => {
      resolvedLocalEditorStreamConfigPath = nextPath;
    },
    syncLocalEditorDataTemplates,
    syncLocalEditorTemplate,
  };
};
