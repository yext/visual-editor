import path from "node:path";
import fs from "fs-extra";
import { Plugin } from "vite";
import mainTemplate from "./templates/main.tsx?raw";
import editTemplate from "./templates/edit.tsx?raw";
import directoryTemplate from "./templates/directory.tsx?raw";
import locatorTemplate from "./templates/locator.tsx?raw";
import { ComponentField, ComponentFields } from "../types/fields.ts";
import { defaultLayoutData } from "./defaultLayoutData.ts";
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
import type { SectionLibraryLayout } from "../sectionLibrary.ts";

export type VisualEditorPluginOptions = {
  sectionLibrary?: boolean;
  localEditor?: LocalEditorOptions;
};

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

/**
 * virtualFiles defines the template files that are to be generated and inserted into
 * the repo during buildStart
 *
 * It also defines entries that will be used to generate the template-manifest.json
 */
const virtualFiles: VirtualFile[] = [
  {
    filepath: "src/templates/main.tsx",
    content: mainTemplate,
    templateManifestEntry: {
      name: "main",
      description:
        "Use this template to generate pages for each of your Locations.",
      exampleSiteUrl: "",
      layoutRequired: true,
      defaultLayoutData: defaultLayoutData.main,
      componentFields: [
        ComponentFields.PromoSection,
        ComponentFields.ProductSection,
        ComponentFields.EventSection,
        ComponentFields.FAQSection,
        ComponentFields.TestimonialSection,
        ComponentFields.InsightSection,
        ComponentFields.TeamSection,
      ],
    },
  },
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
  {
    filepath: "src/templates/edit.tsx",
    content: editTemplate,
  },
];

export const yextVisualEditorPlugin = (
  options: VisualEditorPluginOptions = {}
): Plugin => {
  let isBuildMode = false;
  let initializedForServe = false;
  const filesToCleanup: string[] = [];
  let sectionLibraryFiles: string[] = [];
  let sectionLibraryManifest: string | undefined;
  let sectionLibraryLayouts: SectionLibraryLayout[] = [];
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
  };

  const syncLocalEditorArtifacts = async (): Promise<void> => {
    ensureLocalEditorStreamConfig(process.cwd());
    await readResolvedLayoutConfigs(process.cwd(), sectionLibraryLayouts, []);
    localEditorArtifacts.syncLocalEditorDataTemplates(sectionLibraryLayouts);
    localEditorArtifacts.syncLocalEditorTemplate(sectionLibraryLayouts);
  };

  /**
   * generateFiles generates the template files and .temlpate-manifest.json file
   *
   * Does not overwrite files that already exists
   *
   * Created files will be marked for deletion on buildEnd
   */
  const generateFiles = () => {
    // Create a structure to store the manifest data
    const manifest: {
      templates: TemplateManifestEntry[];
    } = { templates: [] };

    // Iterate over each template definition
    virtualFiles.forEach((virtualFile: VirtualFile) => {
      const filePath = path.join(process.cwd(), virtualFile.filepath);

      // Ensure the directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // Write the content to the file if it doesn't already exist
      if (!fs.existsSync(filePath)) {
        filesToCleanup.push(filePath);
        fs.writeFileSync(filePath, virtualFile.content);
      }

      // populate template-manifest object
      if (virtualFile.templateManifestEntry) {
        manifest.templates.push(virtualFile.templateManifestEntry);
      }
    });

    const manifestPath = path.join(process.cwd(), ".template-manifest.json");
    if (!fs.existsSync(manifestPath)) {
      // Write the manifest to the .template-manifest.json file
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }
  };

  const cleanupFiles = () => {
    filesToCleanup.forEach((filePath) => {
      fs.rmSync(filePath, { force: true });
    });
    if (options.sectionLibrary) {
      cleanupGeneratedSectionLibraryFiles(sectionLibraryFiles);
      sectionLibraryFiles = [];
    }
  };

  const cleanupGeneratedArtifacts = (): void => {
    localEditorArtifacts.cleanupGeneratedLocalEditorArtifacts();
    cleanupFiles();
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
      if (
        command === "serve" &&
        options.sectionLibrary &&
        options.localEditor?.enabled
      ) {
        generateSectionLibrary();
        await syncLocalEditorArtifacts();
        initializedForServe = true;
      }
    },
    async buildStart() {
      if (options.localEditor?.enabled && !options.sectionLibrary) {
        throw new Error("localEditor requires sectionLibrary: true");
      }
      if (options.sectionLibrary && !initializedForServe) {
        generateSectionLibrary();
      } else if (!options.sectionLibrary) {
        generateFiles();
      }

      if (
        !isBuildMode &&
        options.localEditor?.enabled &&
        !initializedForServe
      ) {
        await syncLocalEditorArtifacts();
      } else if (!initializedForServe) {
        localEditorArtifacts.cleanupGeneratedLocalEditorArtifacts();
      }
    },
    generateBundle() {
      if (options.sectionLibrary && sectionLibraryManifest) {
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
