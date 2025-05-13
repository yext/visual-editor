import path from "node:path";
import fs from "fs-extra";
import { Plugin } from "vite";
import mainTemplate from "./templates/main.tsx?raw";
import editTemplate from "./templates/edit.tsx?raw";
import directoryTemplate from "./templates/directory.tsx?raw";
import { ComponentField, ComponentFieldMappings } from "@yext/visual-editor";
import { defaultLayoutData } from "./defaultLayoutData.ts";

type TemplateDefinition = {
  name: string;
  description: string;
  content: string;
  layoutRequired: boolean;
  includeInManifest: boolean;
  exampleSiteUrl?: string;
  defaultLayoutData?: string;
  componentFields?: Array<ComponentField>;
};

// files to generate
const templateDefinitions: Record<string, TemplateDefinition> = {
  "src/templates/main.tsx": {
    name: "main",
    description:
      "Use this template to generate pages for each of your Locations.",
    content: mainTemplate,
    layoutRequired: true,
    includeInManifest: true,
    exampleSiteUrl: "",
    defaultLayoutData: defaultLayoutData.main,
    componentFields: [
      ComponentFieldMappings.HeroSection,
      ComponentFieldMappings.PromoSection,
      ComponentFieldMappings.ProductsSection,
      ComponentFieldMappings.EventsSection,
      ComponentFieldMappings.FAQSection,
      ComponentFieldMappings.TestimonialsSection,
      ComponentFieldMappings.InsightsSection,
      ComponentFieldMappings.TeamSection,
    ],
  },
  "src/templates/edit.tsx": {
    name: "edit",
    description: "The template used to generate the layout and theme editor.",
    content: editTemplate,
    layoutRequired: false,
    includeInManifest: false,
  },
  "src/templates/directory.tsx": {
    name: "directory",
    description:
      "Use this template to generate pages for each of your Directory entities.",
    content: directoryTemplate,
    layoutRequired: true,
    includeInManifest: true,
    exampleSiteUrl: "",
    defaultLayoutData: defaultLayoutData.directory,
  },
};

export const yextVisualEditorPlugin = (): Plugin => {
  let isBuildMode = false;
  const filesToCleanup: string[] = [];

  // generateFiles generates the template files and also the template-manifest.json
  const generateFiles = () => {
    // Create a structure to store the manifest data
    const manifest: {
      templates: {
        name: string;
        description: string;
        exampleSiteUrl: string;
        layoutRequired: boolean;
        defaultLayoutData?: any;
        componentFieldMappings?: ComponentField[];
      }[];
    } = { templates: [] };

    // Iterate over each template definition
    Object.entries(templateDefinitions).forEach(
      ([fileName, templateDefinition]) => {
        const filePath = path.join(process.cwd(), fileName);
        filesToCleanup.push(filePath);

        // Ensure the directory exists
        fs.mkdirSync(path.dirname(filePath), { recursive: true });

        // Write the content to the file if it doesn't already exist
        if (!fs.existsSync(filePath)) {
          fs.writeFileSync(filePath, templateDefinition.content);
        }

        // If includeInManifest is true, build the manifest entry
        if (templateDefinition.includeInManifest) {
          const {
            name,
            description,
            exampleSiteUrl = "",
            layoutRequired,
            defaultLayoutData,
            componentFields,
          } = templateDefinition;

          const manifestEntry: (typeof manifest.templates)[number] = {
            name,
            description,
            exampleSiteUrl,
            layoutRequired,
            defaultLayoutData,
          };

          // Include component field mappings if provided
          if (componentFields) {
            manifestEntry.componentFieldMappings = componentFields;
          }

          // Add this template's entry to the manifest
          manifest.templates.push(manifestEntry);
        }
      }
    );

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
