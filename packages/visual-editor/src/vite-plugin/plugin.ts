import path from "node:path";
import { Plugin, type ViteDevServer } from "vite";
import {
  cleanupGeneratedSectionLibraryFiles,
  generateSectionLibraryFiles,
} from "./section-library/sectionLibraryGenerator.ts";
import localEditorTemplate from "./templates/local-editor.tsx?raw";
import localEditorDataTemplate from "./templates/local-editor-data.tsx?raw";
import { createLocalEditorArtifactsManager } from "./local-editor/artifacts.ts";
import { readResolvedLayoutConfigs } from "./local-editor/config.ts";
import {
  ensureLocalEditorStreamConfig,
  LOCAL_EDITOR_API_BASE_PATH,
} from "./local-editor/generatedFiles.ts";
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
  let generation = 0;
  let regeneration = Promise.resolve();
  const localEditorArtifacts = createLocalEditorArtifactsManager({
    localEditorTemplateSource: localEditorTemplate,
    localEditorDataTemplateSource: localEditorDataTemplate,
  });

  /**
   * Rebuilds the development registry after the library checkout changes.
   *
   * 1. Validate and generate the current library files.
   * 2. Sync Local Editor templates and remove obsolete generated files.
   * 3. Publish the new layout state and invalidate Vite's loaded modules.
   */
  const regenerateSectionLibrary = async (
    server?: ViteDevServer
  ): Promise<{ generation: number; layouts: string[] }> => {
    const generatedLibrary = generateSectionLibraryFiles(
      process.cwd(),
      process.env.SECTION_LIBRARY_REVISION_ID
    );
    if (
      !isBuildMode &&
      options.localEditor?.enabled &&
      generatedLibrary.manifestSource !== undefined
    ) {
      ensureLocalEditorStreamConfig(process.cwd());
      await readResolvedLayoutConfigs(
        process.cwd(),
        generatedLibrary.layouts,
        [],
        true
      );
      localEditorArtifacts.syncLocalEditorDataTemplates(
        generatedLibrary.layouts
      );
      localEditorArtifacts.syncLocalEditorTemplate(generatedLibrary.layouts);
    } else {
      localEditorArtifacts.cleanupGeneratedLocalEditorArtifacts();
    }

    const obsoleteFiles = sectionLibraryFiles.filter(
      (filePath) => !generatedLibrary.generatedFiles.includes(filePath)
    );
    cleanupGeneratedSectionLibraryFiles(obsoleteFiles);
    sectionLibraryFiles = generatedLibrary.generatedFiles;
    sectionLibraryManifest = generatedLibrary.manifestSource;
    sectionLibraryLayouts = generatedLibrary.layouts;
    generation += 1;

    if (server) {
      for (const filePath of [
        ...sectionLibraryFiles,
        ...obsoleteFiles,
        path.join(process.cwd(), "src", "templates", "local-editor.tsx"),
      ]) {
        for (const module of server.moduleGraph.getModulesByFile(filePath) ??
          []) {
          server.moduleGraph.invalidateModule(module);
        }
      }
      server.ws.send({ type: "full-reload" });
    }
    return {
      generation,
      layouts: sectionLibraryLayouts.map((layout) => layout.metadata.id),
    };
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
        await regenerateSectionLibrary();
        initializedForServe = true;
      }
    },
    async buildStart() {
      if (!initializedForServe) {
        await regenerateSectionLibrary();
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
        if (
          new URL(request.url, "http://localhost").pathname ===
          `${LOCAL_EDITOR_API_BASE_PATH}/regenerate`
        ) {
          if (request.method !== "POST") {
            response.setHeader("Allow", "POST");
            sendJsonResponse(response, { error: "Method not allowed" }, 405);
            return;
          }
          const libraryRoot = request.headers["x-yext-section-library-root"];
          if (
            typeof libraryRoot !== "string" ||
            !path.isAbsolute(libraryRoot)
          ) {
            sendJsonResponse(
              response,
              { error: "X-Yext-Section-Library-Root must be an absolute path" },
              400
            );
            return;
          }
          if (path.resolve(libraryRoot) !== path.resolve(process.cwd())) {
            sendJsonResponse(
              response,
              {
                error:
                  "The running Pages server uses a different section library",
              },
              409
            );
            return;
          }

          const pending = regeneration
            .then(() => new Promise<void>((resolve) => setImmediate(resolve)))
            .then(() => regenerateSectionLibrary(server));
          regeneration = pending.then(
            () => {},
            () => {}
          );
          sendJsonResponse(response, { status: "queued" }, 202);
          void pending.catch((error: unknown) => {
            server.config.logger.error(
              `Local Editor regeneration failed: ${error instanceof Error ? error.message : String(error)}`
            );
          });
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
