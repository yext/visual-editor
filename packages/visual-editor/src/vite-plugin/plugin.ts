import path from "node:path";
import fs from "fs-extra";
import { Plugin } from "vite";
import baseTemplate from "./templates/base.tsx?raw";
import directoryTemplate from "./templates/directory.tsx?raw";
import locatorTemplate from "./templates/locator.tsx?raw";
import localEditorTemplate from "./templates/local-editor.tsx?raw";
import localEditorDataTemplate from "./templates/local-editor-data.tsx?raw";
import { ComponentField } from "../types/fields.ts";
import { defaultLayoutData } from "./registry/defaultLayoutData.ts";
import {
  generateRegistryTemplateFiles,
  getCollectedRegistryTemplateNames,
} from "./registry/registryTemplateGenerator.ts";
import { createGeneratedFileCleanupTracker } from "./generated/fileCleanup.ts";
import { getEffectiveEditorTemplateNames } from "./routing/editorTemplateNames.ts";
import { syncGeneratedEditorFiles } from "./generated/editorFiles.ts";
import { hasExplicitLocalMainTemplate } from "./generated/templateFiles.ts";
import { createLocalEditorArtifactsManager } from "./local-editor/artifacts.ts";
import { ensureLocalEditorStreamConfig } from "./local-editor/generatedFiles.ts";
import {
  handleLocalEditorRequest,
  sendJsonResponse,
} from "./local-editor/server.ts";
import type { LocalEditorOptions } from "./local-editor/types.ts";
import { writeFileIfChanged } from "./generated/writeFileIfChanged.ts";

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

/**
 * virtualFiles defines the template files that are to be generated and inserted into
 * the repo during buildStart
 *
 * It also defines entries that will be used to generate the template-manifest.json
 */
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
      // no componentFields are defined because this is handled in the back-end for the dynamically
      // generated DM fields
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
];

export const yextVisualEditorPlugin = (
  options: VisualEditorPluginOptions = {}
): Plugin => {
  let isBuildMode = false;
  const generatedFileCleanup = createGeneratedFileCleanupTracker();
  let isServeMode = false;
  const localEditorOptions = options.localEditor;
  const localEditorArtifacts = createLocalEditorArtifactsManager({
    localEditorTemplateSource: localEditorTemplate,
    localEditorDataTemplateSource: localEditorDataTemplate,
    trackGeneratedFile: generatedFileCleanup.track,
  });

  /**
   * generateFiles generates the template files and .temlpate-manifest.json file
   *
   * Overview:
   * 1. Ensure the built-in virtual template files exist on disk.
   * 2. Collect manifest entries for the generated template manifest.
   * 3. Sync the generated editor templates and dev template picker with the
   *    resolved editor route metadata.
   * 4. Write the .template-manifest.json file when it does not already exist.
   *
   * Does not overwrite files that already exists
   *
   * Created files will be marked for deletion on buildEnd
   */
  const generateFiles = (registryTemplateNames: string[]) => {
    const rootDir = process.cwd();

    // Create a structure to store the manifest data
    const manifest: {
      templates: TemplateManifestEntry[];
    } = { templates: [] };

    // Iterate over each template definition
    virtualFiles.forEach((virtualFile: VirtualFile) => {
      const filePath = path.join(rootDir, virtualFile.filepath);

      // Ensure the directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      if (!fs.existsSync(filePath)) {
        generatedFileCleanup.track(filePath);
        fs.writeFileSync(filePath, virtualFile.content);
      }

      // populate template-manifest object
      if (virtualFile.templateManifestEntry) {
        manifest.templates.push(virtualFile.templateManifestEntry);
      }
    });

    const explicitLocalTemplateNames = [
      ...(hasExplicitLocalMainTemplate(rootDir) ? ["main"] : []),
      ...registryTemplateNames,
    ];
    const { templateNames: availableTemplateNames } =
      getEffectiveEditorTemplateNames(explicitLocalTemplateNames);
    syncGeneratedEditorFiles({
      rootDir,
      availableTemplateNames,
      isBuildMode,
      trackFileForCleanup: generatedFileCleanup.track,
    });
    const manifestPath = path.join(rootDir, ".template-manifest.json");
    if (!fs.existsSync(manifestPath)) {
      // Write the manifest to the .template-manifest.json file
      writeFileIfChanged(manifestPath, JSON.stringify(manifest, null, 2));
    }
  };

  const cleanupFiles = () => {
    generatedFileCleanup.cleanup();
  };

  // cleanup on interruption (ctrl + C)
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

      const registryTemplateNames = getCollectedRegistryTemplateNames(
        process.cwd()
      );

      generateFiles(registryTemplateNames);
      generateRegistryTemplateFiles({
        rootDir: process.cwd(),
        generatedBaseTemplateSource: baseTemplate,
      });

      if (!isBuildMode && localEditorOptions?.enabled) {
        await ensureLocalEditorStreamConfig(process.cwd());
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
