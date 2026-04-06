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
  getEditorTemplateInfoFromTemplateNames,
  injectEditorTemplateInfo,
} from "./editorRoute.ts";
import { createLocalEditorArtifactsManager } from "./local-editor/artifacts.ts";
import { resolveLocalEditorStreamConfigPath } from "./local-editor/config.ts";
import {
  ensureLocalEditorStreamConfig,
  normalizeLocalEditorRoute,
} from "./local-editor/generatedFiles.ts";
import {
  createLocalEditorRequestHandler,
  sendJsonResponse,
} from "./local-editor/server.ts";
import type { LocalEditorOptions } from "./local-editor/types.ts";
import { writeFileIfChanged } from "./local-editor/utils.ts";

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
  const filesToCleanup: string[] = [];
  const localEditorOptions = options.localEditor;
  const localEditorRoute = normalizeLocalEditorRoute(localEditorOptions?.route);
  const handleLocalEditorRequest =
    createLocalEditorRequestHandler(localEditorOptions);
  const trackGeneratedFile = (filePath: string) => {
    if (!filesToCleanup.includes(filePath)) {
      filesToCleanup.push(filePath);
    }
  };
  const localEditorArtifacts = createLocalEditorArtifactsManager({
    localEditorOptions,
    localEditorRoute,
    localEditorTemplateSource: localEditorTemplate,
    localEditorDataTemplateSource: localEditorDataTemplate,
    trackGeneratedFile,
  });

  /**
   * generateFiles generates the template files and .temlpate-manifest.json file
   *
   * Overview:
   * 1. Ensure the built-in virtual template files exist on disk.
   * 2. Collect manifest entries for the generated template manifest.
   * 3. Sync the generated edit template with the resolved editor route metadata.
   * 4. Write the .template-manifest.json file when it does not already exist.
   *
   * Does not overwrite files that already exists
   *
   * Created files will be marked for deletion on buildEnd
   */
  const generateFiles = (registryTemplateNames: string[]) => {
    const rootDir = process.cwd();
    const editorTemplateInfo = getEditorTemplateInfoFromTemplateNames([
      ...(fs.existsSync(path.join(rootDir, "src", "templates", "main.tsx"))
        ? ["main"]
        : []),
      ...virtualFiles.flatMap((virtualFile) =>
        virtualFile.templateManifestEntry
          ? [virtualFile.templateManifestEntry.name]
          : []
      ),
      ...registryTemplateNames,
    ]);

    const manifest: {
      templates: TemplateManifestEntry[];
    } = { templates: [] };

    virtualFiles.forEach((virtualFile: VirtualFile) => {
      const filePath = path.join(rootDir, virtualFile.filepath);
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      let nextContents = virtualFile.content;
      if (virtualFile.filepath === "src/templates/edit.tsx") {
        nextContents = buildEditorTemplateSource({
          rootDir,
          templatePath: filePath,
          templateSource: virtualFile.content,
          templateNames: registryTemplateNames,
        });
        nextContents = injectEditorTemplateInfo(
          nextContents,
          editorTemplateInfo
        );
      }

      if (!fs.existsSync(filePath)) {
        trackGeneratedFile(filePath);
      }

      if (
        !fs.existsSync(filePath) ||
        virtualFile.filepath === "src/templates/edit.tsx"
      ) {
        writeFileIfChanged(filePath, nextContents);
      }

      if (virtualFile.templateManifestEntry) {
        manifest.templates.push(virtualFile.templateManifestEntry);
      }
    });

    const manifestPath = path.join(rootDir, ".template-manifest.json");
    if (!fs.existsSync(manifestPath)) {
      writeFileIfChanged(manifestPath, JSON.stringify(manifest, null, 2));
    }
  };

  const cleanupFiles = () => {
    filesToCleanup.forEach((filePath) => {
      fs.rmSync(filePath, { force: true });
    });
  };

  process.on("SIGINT", () => {
    localEditorArtifacts.cleanupServeArtifacts(cleanupFiles);
    process.nextTick(() => process.exit(0));
  });

  process.on("SIGTERM", () => {
    localEditorArtifacts.cleanupServeArtifacts(cleanupFiles);
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
        localEditorArtifacts.cleanupGeneratedLocalEditorArtifacts();
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
        const resolvedLocalEditorStreamConfigPath =
          await resolveLocalEditorStreamConfigPath(
            process.cwd(),
            localEditorOptions?.streamConfigPath
          );
        localEditorArtifacts.setResolvedLocalEditorStreamConfigPath(
          resolvedLocalEditorStreamConfigPath
        );
        await ensureLocalEditorStreamConfig(
          process.cwd(),
          resolvedLocalEditorStreamConfigPath
        );
        await localEditorArtifacts.syncLocalEditorDataTemplates();
      }

      if (isServeMode && localEditorOptions?.enabled) {
        localEditorArtifacts.syncLocalEditorTemplate({
          registryTemplateNames,
        });
      }
    },
    configureServer(server) {
      if (!localEditorOptions?.enabled) {
        return;
      }

      server.httpServer?.once("close", () => {
        localEditorArtifacts.cleanupServeArtifacts(cleanupFiles);
      });

      server.middlewares.use((request, response, next) => {
        if (!request.url) {
          next();
          return;
        }

        void handleLocalEditorRequest(request.url, response)
          .then((handled) => {
            if (!handled) {
              next();
            }
          })
          .catch((error) => {
            sendJsonResponse(
              response,
              {
                error: error instanceof Error ? error.message : String(error),
              },
              500
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
