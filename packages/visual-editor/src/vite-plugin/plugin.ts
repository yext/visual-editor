import path from "node:path";
import fs from "fs-extra";
import { Plugin } from "vite";
import baseTemplate from "./templates/base.tsx?raw";
import directoryTemplate from "./templates/directory.tsx?raw";
import locatorTemplate from "./templates/locator.tsx?raw";
import { ComponentField } from "../types/fields.ts";
import { defaultLayoutData } from "./defaultLayoutData.ts";
import {
  generateRegistryTemplateFiles,
  getCollectedRegistryTemplateNames,
} from "./registryTemplateGenerator.ts";
import { createGeneratedFileCleanupTracker } from "./generatedFileCleanup.ts";
import { getEffectiveEditorTemplateNames } from "./editorTemplateNames.ts";
import { syncGeneratedEditorFiles } from "./generatedEditorFiles.ts";
import { hasExplicitLocalMainTemplate } from "./generatedTemplateFiles.ts";

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

export const yextVisualEditorPlugin = (): Plugin => {
  let isBuildMode = false;
  const generatedFileCleanup = createGeneratedFileCleanupTracker();

  /**
   * generateFiles generates the template files and .temlpate-manifest.json file
   *
   * Overview:
   * 1. Ensure the built-in virtual template files exist on disk.
   * 2. Collect manifest entries for the generated template manifest.
   * 3. Sync the generated editor templates and dev entry page with the
   *    resolved editor route metadata.
   * 4. Write the .template-manifest.json file when it does not already exist.
   *
   * Does not overwrite files that already exists
   *
   * Created files will be marked for deletion on buildEnd
   */
  const generateFiles = () => {
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

      // Write the content to the file if it doesn't already exist
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
      ...getCollectedRegistryTemplateNames(rootDir),
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
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    }
  };

  const cleanupFiles = () => {
    generatedFileCleanup.cleanup();
  };

  return {
    name: "vite-plugin-yext-visual-editor",
    config(_, { command }) {
      isBuildMode = command === "build";
    },
    buildStart() {
      generateFiles();
      generateRegistryTemplateFiles({
        rootDir: process.cwd(),
        generatedBaseTemplateSource: baseTemplate,
      });
    },
    buildEnd() {
      if (isBuildMode) {
        cleanupFiles();
      }
    },
  };
};
