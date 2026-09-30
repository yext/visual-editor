import { Plugin } from "vite";
import {
  cleanupGeneratedSectionLibraryFiles,
  generateSectionLibraryFiles,
} from "./section-library/sectionLibraryGenerator.ts";
import localEditorTemplate from "./templates/local-editor.tsx?raw";
import localEditorDataTemplate from "./templates/local-editor-data.tsx?raw";
import { createLocalEditorArtifactsManager } from "./local-editor/artifacts.ts";
import { readResolvedLayoutConfigs } from "./local-editor/config.ts";
import { ensureLocalEditorStreamConfig } from "./local-editor/generatedFiles.ts";
import {
  handleLocalEditorRequest,
  sendJsonResponse,
} from "./local-editor/server.ts";
import type { LocalEditorOptions } from "./local-editor/types.ts";
import type { SectionLibraryLayout } from "../types/sectionLibrary.ts";

export type VisualEditorPluginOptions = {
  /** @deprecated This option is ignored because Section Library builds are always enabled. */
  sectionLibrary?: boolean;
  localEditor?: LocalEditorOptions;
};

export const yextVisualEditorPlugin = (
  options: VisualEditorPluginOptions = {}
): Plugin => {
  let isBuildMode = false;
  let initializedForServe = false;
  let sectionLibraryFiles: string[] = [];
  let sectionLibraryManifest: string | undefined;
  let sectionLibraryLayouts: SectionLibraryLayout[] = [];
  let sectionLibraryGenerated = false;
  const localEditorArtifacts = createLocalEditorArtifactsManager({
    localEditorTemplateSource: localEditorTemplate,
    localEditorDataTemplateSource: localEditorDataTemplate,
  });

  const generateSectionLibrary = (): void => {
    const generatedLibrary = generateSectionLibraryFiles(
      process.cwd(),
      process.env.SECTION_LIBRARY_REVISION_ID
    );
    sectionLibraryFiles = generatedLibrary.generatedFiles;
    sectionLibraryManifest = generatedLibrary.manifestSource;
    sectionLibraryLayouts = generatedLibrary.layouts;
    sectionLibraryGenerated = generatedLibrary.manifestSource !== undefined;
  };

  const syncLocalEditorArtifacts = async (): Promise<void> => {
    ensureLocalEditorStreamConfig(process.cwd());
    await readResolvedLayoutConfigs(process.cwd(), sectionLibraryLayouts, []);
    localEditorArtifacts.syncLocalEditorDataTemplates(sectionLibraryLayouts);
    localEditorArtifacts.syncLocalEditorTemplate(sectionLibraryLayouts);
  };

  const cleanupSectionLibraryFiles = () => {
    cleanupGeneratedSectionLibraryFiles(sectionLibraryFiles);
    sectionLibraryFiles = [];
  };

  const cleanupGeneratedArtifacts = (): void => {
    localEditorArtifacts.cleanupGeneratedLocalEditorArtifacts();
    cleanupSectionLibraryFiles();
  };

  if (options.localEditor?.enabled) {
    // cleanup on interruption (ctrl + C)
    process.once("SIGINT", () => {
      cleanupGeneratedArtifacts();
      process.nextTick(() => process.exit(130));
    });

    process.once("SIGTERM", () => {
      cleanupGeneratedArtifacts();
      process.nextTick(() => process.exit(143));
    });
  }

  return {
    name: "vite-plugin-yext-visual-editor",
    async config(_, { command }) {
      isBuildMode = command === "build";

      // Pages scans template files immediately after it creates the Vite
      // server. Generate these files here so the scan includes local-editor.
      if (command === "serve" && options.localEditor?.enabled) {
        generateSectionLibrary();
        if (sectionLibraryGenerated) {
          await syncLocalEditorArtifacts();
        } else {
          localEditorArtifacts.cleanupGeneratedLocalEditorArtifacts();
        }
        initializedForServe = true;
      }
    },
    async buildStart() {
      if (!initializedForServe) {
        generateSectionLibrary();
      }

      if (
        !isBuildMode &&
        options.localEditor?.enabled &&
        !initializedForServe &&
        sectionLibraryGenerated
      ) {
        await syncLocalEditorArtifacts();
      } else if (!initializedForServe) {
        localEditorArtifacts.cleanupGeneratedLocalEditorArtifacts();
      }
    },
    generateBundle() {
      if (sectionLibraryManifest) {
        this.emitFile({
          type: "asset",
          fileName: "assets/section-library-manifest.json",
          source: sectionLibraryManifest,
        });
      }
    },
    configureServer(server) {
      if (!options.localEditor?.enabled) {
        return;
      }

      server.httpServer?.once("close", () => {
        cleanupGeneratedArtifacts();
      });

      server.middlewares.use((request, response, next) => {
        if (!request.url) {
          next();
          return;
        }
        void handleLocalEditorRequest(
          request.url,
          response,
          sectionLibraryLayouts
        )
          .then((handled) => {
            if (!handled) {
              next();
            }
          })
          .catch((error: unknown) => {
            sendJsonResponse(
              response,
              { error: error instanceof Error ? error.message : String(error) },
              500
            );
          });
      });
    },
    buildEnd() {
      if (isBuildMode) {
        cleanupGeneratedArtifacts();
      }
    },
  };
};
