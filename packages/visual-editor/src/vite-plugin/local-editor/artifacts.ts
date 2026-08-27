import path from "node:path";
import fs from "fs-extra";
import type { SectionLibraryLayout } from "../../types/sectionLibrary.ts";
import {
  buildLocalEditorDataTemplatePath,
  buildLocalEditorDataTemplateSource,
  DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH,
  isGeneratedLocalEditorTemplate,
  LEGACY_LOCAL_EDITOR_DATA_TEMPLATE_PATH,
  LOCAL_EDITOR_DATA_TEMPLATE_PREFIX,
  toAbsoluteLocalEditorPath,
} from "./generatedFiles.ts";
import { writeFileIfChanged } from "./utils.ts";

const LOCAL_EDITOR_STYLESHEET_HREFS_PLACEHOLDER =
  "__LOCAL_EDITOR_STYLESHEET_HREFS__";

type CreateLocalEditorArtifactsManagerOptions = {
  localEditorTemplateSource: string;
  localEditorDataTemplateSource: string;
};

/**
 * Creates and removes the generated Local Editor Pages templates.
 *
 * 1. Write the Local Editor shell with one config import for each layout.
 * 2. Write data templates for Entity and Directory layouts.
 * 3. Remove only files that this feature generated.
 */
export const createLocalEditorArtifactsManager = ({
  localEditorTemplateSource,
  localEditorDataTemplateSource,
}: CreateLocalEditorArtifactsManagerOptions) => {
  const syncLocalEditorTemplate = (
    layouts: SectionLibraryLayout[],
    rootDir = process.cwd()
  ): void => {
    const templatePath = path.join(
      rootDir,
      "src",
      "templates",
      "local-editor.tsx"
    );
    writeGeneratedTemplate(
      templatePath,
      localEditorTemplateSource
        .replace(
          LOCAL_EDITOR_STYLESHEET_HREFS_PLACEHOLDER,
          JSON.stringify(readLocalEditorFontStylesheetHrefs(rootDir))
        )
        .replace(
          "/* LOCAL_EDITOR_CONFIG_IMPORTS */",
          layouts
            .map((layout, index) => {
              return `import { sectionLibraryConfig as LayoutConfig${index} } from ${JSON.stringify(`../library/.generated/libraryConfig-${layout.metadata.id}`)};`;
            })
            .join("\n")
        )
        .replace(
          "/* LOCAL_EDITOR_COMPONENT_REGISTRY */",
          layouts
            .map((layout, index) => {
              return `  ${JSON.stringify(layout.metadata.id)}: LayoutConfig${index},`;
            })
            .join("\n")
        )
    );
  };

  const syncLocalEditorDataTemplates = (
    layouts: SectionLibraryLayout[],
    rootDir = process.cwd()
  ): void => {
    const activeTemplatePaths = new Set<string>();
    const layoutIdByTemplatePath = new Map<string, string>();
    for (const layout of layouts) {
      if (
        layout.metadata.pageSetType !== "ENTITY" &&
        layout.metadata.pageSetType !== "DIRECTORY"
      ) {
        continue;
      }
      const templatePath = path.join(
        rootDir,
        buildLocalEditorDataTemplatePath(layout.metadata.id)
      );
      const existingLayoutId = layoutIdByTemplatePath.get(templatePath);
      if (existingLayoutId) {
        console.warn(
          `Local Editor layouts "${existingLayoutId}" and "${layout.metadata.id}" generate the same data template at ${path.relative(rootDir, templatePath)}. The later layout will overwrite the earlier layout's template.`
        );
      } else {
        layoutIdByTemplatePath.set(templatePath, layout.metadata.id);
      }
      const streamConfigPath = path
        .relative(
          path.dirname(templatePath),
          toAbsoluteLocalEditorPath(
            rootDir,
            DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH
          )
        )
        .split(path.sep)
        .join("/");
      writeGeneratedTemplate(
        templatePath,
        buildLocalEditorDataTemplateSource(
          localEditorDataTemplateSource,
          streamConfigPath.startsWith(".")
            ? streamConfigPath
            : `./${streamConfigPath}`,
          layout.metadata.id,
          layout.metadata.pageSetType
        )
      );
      activeTemplatePaths.add(templatePath);
    }
    cleanupLocalEditorDataTemplates(rootDir, activeTemplatePaths);
  };

  const cleanupGeneratedLocalEditorArtifacts = (
    rootDir = process.cwd()
  ): void => {
    const templatePath = path.join(
      rootDir,
      "src",
      "templates",
      "local-editor.tsx"
    );
    if (isGeneratedLocalEditorTemplate(templatePath)) {
      fs.removeSync(templatePath);
    }
    cleanupLocalEditorDataTemplates(rootDir);
  };

  return {
    cleanupGeneratedLocalEditorArtifacts,
    syncLocalEditorDataTemplates,
    syncLocalEditorTemplate,
  };
};

const writeGeneratedTemplate = (templatePath: string, source: string): void => {
  fs.ensureDirSync(path.dirname(templatePath));
  if (
    fs.existsSync(templatePath) &&
    !isGeneratedLocalEditorTemplate(templatePath)
  ) {
    throw new Error(
      `Refusing to overwrite hand-authored local editor template at ${templatePath}`
    );
  }
  writeFileIfChanged(templatePath, source);
};

const cleanupLocalEditorDataTemplates = (
  rootDir: string,
  activeTemplatePaths?: Set<string>
): void => {
  const templatesDirectory = path.join(rootDir, "src", "templates");
  if (!fs.existsSync(templatesDirectory)) {
    return;
  }
  for (const entry of fs.readdirSync(templatesDirectory, {
    withFileTypes: true,
  })) {
    const templatePath = path.join(templatesDirectory, entry.name);
    if (
      !entry.isFile() ||
      !entry.name.startsWith(LOCAL_EDITOR_DATA_TEMPLATE_PREFIX) ||
      path.extname(entry.name) !== ".tsx" ||
      activeTemplatePaths?.has(templatePath) ||
      !isGeneratedLocalEditorTemplate(templatePath)
    ) {
      continue;
    }
    fs.removeSync(templatePath);
  }
  const legacyTemplatePath = path.join(
    rootDir,
    LEGACY_LOCAL_EDITOR_DATA_TEMPLATE_PATH
  );
  if (
    !activeTemplatePaths?.has(legacyTemplatePath) &&
    isGeneratedLocalEditorTemplate(legacyTemplatePath)
  ) {
    fs.removeSync(legacyTemplatePath);
  }
};

const readLocalEditorFontStylesheetHrefs = (rootDir: string): string[] => {
  const fontsDirectory = path.join(rootDir, "public", "y-fonts");
  if (!fs.existsSync(fontsDirectory)) {
    return [];
  }
  return fs
    .readdirSync(fontsDirectory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && path.extname(entry.name) === ".css")
    .map((entry) => `/y-fonts/${entry.name}`)
    .sort((left, right) => left.localeCompare(right));
};
