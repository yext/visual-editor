import path from "node:path";
import fs from "fs-extra";
import { Plugin } from "vite";
import mainTemplate from "./templates/main.tsx?raw";
import editTemplate from "./templates/edit.tsx?raw";
import directoryTemplate from "./templates/directory.tsx?raw";
import locatorTemplate from "./templates/locator.tsx?raw";
import { ComponentField, ComponentFields } from "@yext/visual-editor";
import { defaultLayoutData } from "./defaultLayoutData.ts";

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
        ComponentFields.HeroSection,
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
        "Use this template to generate pages for each of your Locations.",
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

export const yextVisualEditorPlugin = (): Plugin => {
  let isBuildMode = false;
  const filesToCleanup: string[] = [];

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
      filesToCleanup.push(filePath);

      // Ensure the directory exists
      fs.mkdirSync(path.dirname(filePath), { recursive: true });

      // Write the content to the file if it doesn't already exist
      if (!fs.existsSync(filePath)) {
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

      // Add the manifest file path to the cleanup list
      filesToCleanup.push(manifestPath);
    }
  };

  const cleanupFiles = () => {
    filesToCleanup.forEach((filePath) => {
      fs.rmSync(filePath, { force: true });
    });
  };

  // cleanup on interruption (ctrl + C)
  process.on("SIGINT", () => {
    cleanupFiles();
    process.nextTick(() => process.exit(0));
  });

  process.on("SIGTERM", () => {
    cleanupFiles();
    process.nextTick(() => process.exit(0));
  });

  return {
    name: "vite-plugin-yext-visual-editor",
    config(_, { command }) {
      isBuildMode = command === "build";
    },
    configureServer(server) {
      if (isBuildMode) {
        return;
      }
      generateFiles();
      server.httpServer?.on("close", () => {
        cleanupFiles();
      });
    },
    buildStart() {
      if (!isBuildMode) {
        return;
      }
      generateFiles();
    },
    buildEnd() {
      if (!isBuildMode) {
        return;
      }
      cleanupFiles();
    },
    closeBundle() {
      if (!isBuildMode) {
        return;
      }
      cleanupFiles();
    },
  };
};
