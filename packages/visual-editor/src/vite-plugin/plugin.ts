import path from "node:path";
import fs from "fs-extra";
import { Plugin } from "vite";
import baseTemplate from "./templates/base.tsx?raw";
import editTemplate from "./templates/edit.tsx?raw";
import directoryTemplate from "./templates/directory.tsx?raw";
import locatorTemplate from "./templates/locator.tsx?raw";
import localEditorTemplate from "./templates/local-editor.tsx?raw";
import localEditorDataTemplate from "./templates/local-editor-data.tsx?raw";
import { ComponentField } from "../types/fields.ts";
import { defaultLayoutData } from "./defaultLayoutData.ts";
import {
  buildEditorTemplateSource,
  generateRegistryTemplateFiles,
  getGeneratedRegistryTemplateNames,
} from "./registryTemplateGenerator.ts";
import {
  buildLocalEditorDataTemplatePath,
  buildLocalEditorDataTemplateSource,
  buildLocalEditorTemplateSource,
  DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH,
  ensureLocalEditorStreamConfig,
  getLocalEditorDocument,
  getLocalEditorManifest,
  isGeneratedLocalEditorTemplate,
  LEGACY_LOCAL_EDITOR_DATA_TEMPLATE_PATH,
  LOCAL_EDITOR_API_BASE_PATH,
  LOCAL_EDITOR_DATA_TEMPLATE_PREFIX,
  normalizeLocalEditorRoute,
  resolveLocalEditorStreamConfigPath,
} from "./localEditor.ts";

type TemplateManifestEntry = {
  name: string;
  description: string;
  exampleSiteUrl: string;
  layoutRequired: boolean;
  defaultLayoutData?: any;
  componentFields?: ComponentField[];
};

type VirtualFile = {
  filepath: string;
  content: any;
  templateManifestEntry?: TemplateManifestEntry;
};

type LocalEditorOptions = {
  enabled?: boolean;
  route?: string;
  streamConfigPath?: string;
};

export type VisualEditorPluginOptions = {
  localEditor?: LocalEditorOptions;
};

const virtualFiles: VirtualFile[] = [
  {
    filepath: "src/templates/directory.tsx",
    content: directoryTemplate,
    templateManifestEntry: {
      name: "directory",
      description:
        "Use this template to generate pages for each of your Directory entities.",
      exampleSiteUrl: "",
      layoutRequired: true,
      defaultLayoutData: defaultLayoutData.directory,
    },
  },
  {
    filepath: "src/templates/locator.tsx",
    content: locatorTemplate,
    templateManifestEntry: {
      name: "locator",
      description: "Use this template to generate pages for your Locators.",
      exampleSiteUrl: "",
      layoutRequired: true,
      defaultLayoutData: defaultLayoutData.locator,
    },
  },
  {
    filepath: "src/templates/edit.tsx",
    content: editTemplate,
  },
];

export const yextVisualEditorPlugin = (
  options: VisualEditorPluginOptions = {}
): Plugin => {
  let isBuildMode = false;
  let isServeMode = false;
  let resolvedLocalEditorStreamConfigPath =
    options.localEditor?.streamConfigPath ??
    DEFAULT_LOCAL_EDITOR_STREAM_CONFIG_PATH;
  const filesToCleanup: string[] = [];
  const localEditorOptions = options.localEditor;
  const localEditorRoute = normalizeLocalEditorRoute(localEditorOptions?.route);

  const trackGeneratedFile = (filePath: string) => {
    if (!filesToCleanup.includes(filePath)) {
      filesToCleanup.push(filePath);
    }
  };

  const generateFiles = (registryTemplateNames: string[]) => {
    const manifest: {
      templates: TemplateManifestEntry[];
    } = { templates: [] };

    virtualFiles.forEach((virtualFile: VirtualFile) => {
      const filePath = path.join(process.cwd(), virtualFile.filepath);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      if (!fs.existsSync(filePath)) {
        let nextContents = virtualFile.content;
        if (virtualFile.filepath === "src/templates/edit.tsx") {
          nextContents = buildEditorTemplateSource({
            rootDir: process.cwd(),
            templatePath: filePath,
            templateSource: nextContents,
            templateNames: registryTemplateNames,
          });
        }

        writeFileIfChanged(filePath, nextContents);
        trackGeneratedFile(filePath);
      }

      if (virtualFile.templateManifestEntry) {
        manifest.templates.push(virtualFile.templateManifestEntry);
      }
    });

    const manifestPath = path.join(process.cwd(), ".template-manifest.json");
    if (!fs.existsSync(manifestPath)) {
      writeFileIfChanged(manifestPath, JSON.stringify(manifest, null, 2));
    }
  };

  const cleanupFiles = () => {
    filesToCleanup.forEach((filePath) => {
      fs.rmSync(filePath, { force: true });
    });
  };

  const cleanupGeneratedLocalEditorArtifacts = () => {
    cleanupLocalEditorTemplate();
    cleanupLocalEditorDataTemplates();
  };

  const cleanupServeArtifacts = () => {
    cleanupGeneratedLocalEditorArtifacts();
    cleanupFiles();
  };

  const syncLocalEditorTemplate = (registryTemplateNames: string[]) => {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "local-editor.tsx"
    );
    let nextTemplateSource = buildLocalEditorTemplateSource(
      localEditorTemplate,
      localEditorRoute
    );
    nextTemplateSource = buildEditorTemplateSource({
      rootDir: process.cwd(),
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

  const cleanupLocalEditorTemplate = () => {
    const templatePath = path.join(
      process.cwd(),
      "src",
      "templates",
      "local-editor.tsx"
    );
    if (isGeneratedLocalEditorTemplate(templatePath)) {
      fs.rmSync(templatePath, { force: true });
    }
  };

  const syncLocalEditorDataTemplates = async () => {
    const manifest = await getLocalEditorManifest(
      process.cwd(),
      resolvedLocalEditorStreamConfigPath
    );
    const activeTemplatePaths = new Set<string>();

    for (const templateId of manifest.templates) {
      const templatePath = path.join(
        process.cwd(),
        buildLocalEditorDataTemplatePath(templateId)
      );
      const streamConfigImportPath = path
        .relative(
          path.dirname(templatePath),
          path.join(process.cwd(), resolvedLocalEditorStreamConfigPath)
        )
        .split(path.sep)
        .join("/");
      const nextTemplateSource = buildLocalEditorDataTemplateSource(
        localEditorDataTemplate,
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

    cleanupLocalEditorDataTemplates(activeTemplatePaths);
  };

  const cleanupLocalEditorDataTemplates = (
    activeTemplatePaths?: Set<string>
  ) => {
    const templatesDirectory = path.join(process.cwd(), "src", "templates");
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
      process.cwd(),
      LEGACY_LOCAL_EDITOR_DATA_TEMPLATE_PATH
    );
    if (
      (!activeTemplatePaths || !activeTemplatePaths.has(legacyTemplatePath)) &&
      isGeneratedLocalEditorTemplate(legacyTemplatePath)
    ) {
      fs.rmSync(legacyTemplatePath, { force: true });
    }
  };

  process.on("SIGINT", () => {
    cleanupServeArtifacts();
    process.nextTick(() => process.exit(0));
  });

  process.on("SIGTERM", () => {
    cleanupServeArtifacts();
    process.nextTick(() => process.exit(0));
  });

  return {
    name: "vite-plugin-yext-visual-editor",
    config(_, { command }) {
      isBuildMode = command === "build";
      isServeMode = command === "serve";
    },
    async buildStart() {
      if (isBuildMode || !localEditorOptions?.enabled) {
        cleanupGeneratedLocalEditorArtifacts();
      }

      const registryTemplateNames = getGeneratedRegistryTemplateNames(
        process.cwd()
      );

      generateFiles(registryTemplateNames);
      generateRegistryTemplateFiles({
        rootDir: process.cwd(),
        generatedBaseTemplateSource: baseTemplate,
      });

      if (!isBuildMode && localEditorOptions?.enabled) {
        resolvedLocalEditorStreamConfigPath =
          await resolveLocalEditorStreamConfigPath(
            process.cwd(),
            localEditorOptions?.streamConfigPath
          );
        await ensureLocalEditorStreamConfig(
          process.cwd(),
          resolvedLocalEditorStreamConfigPath
        );
        await syncLocalEditorDataTemplates();
      }

      if (isServeMode && localEditorOptions?.enabled) {
        syncLocalEditorTemplate(registryTemplateNames);
      }
    },
    configureServer(server) {
      if (!localEditorOptions?.enabled) {
        return;
      }

      server.httpServer?.once("close", cleanupServeArtifacts);

      server.middlewares.use((request, response, next) => {
        void (async () => {
          if (!request.url) {
            next();
            return;
          }

          const requestUrl = new URL(request.url, "http://localhost");
          const streamConfigPath = await resolveLocalEditorStreamConfigPath(
            process.cwd(),
            localEditorOptions?.streamConfigPath
          );

          if (
            requestUrl.pathname === `${LOCAL_EDITOR_API_BASE_PATH}/manifest`
          ) {
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify(
                await getLocalEditorManifest(process.cwd(), streamConfigPath)
              )
            );
            return;
          }

          if (
            requestUrl.pathname === `${LOCAL_EDITOR_API_BASE_PATH}/document`
          ) {
            response.setHeader("Content-Type", "application/json");
            response.end(
              JSON.stringify(
                await getLocalEditorDocument(
                  process.cwd(),
                  streamConfigPath,
                  requestUrl.searchParams.get("templateId") ?? undefined,
                  requestUrl.searchParams.get("entityId") ?? undefined,
                  requestUrl.searchParams.get("locale") ?? undefined
                )
              )
            );
            return;
          }

          next();
        })().catch((error) => {
          response.statusCode = 500;
          response.setHeader("Content-Type", "application/json");
          response.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : String(error),
            })
          );
        });
      });
    },
    buildEnd() {
      if (isBuildMode) {
        cleanupFiles();
      }
    },
  };
};

const writeFileIfChanged = (filePath: string, contents: string) => {
  if (
    fs.existsSync(filePath) &&
    fs.readFileSync(filePath, "utf8") === contents
  ) {
    return;
  }

  fs.writeFileSync(filePath, contents);
};
