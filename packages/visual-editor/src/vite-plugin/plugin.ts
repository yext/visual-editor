import path from "node:path";
import fs from "fs-extra";
import { Plugin } from "vite";
import mainTemplate from "./templates/main.tsx?raw";
import editTemplate from "./templates/edit.tsx?raw";
import directoryTemplate from "./templates/directory.tsx?raw";
import locatorTemplate from "./templates/locator.tsx?raw";
import loadTestTemplate01 from "./templates/loadTestTemplate01.tsx?raw";
import loadTestTemplate02 from "./templates/loadTestTemplate02.tsx?raw";
import loadTestTemplate03 from "./templates/loadTestTemplate03.tsx?raw";
import loadTestTemplate04 from "./templates/loadTestTemplate04.tsx?raw";
import loadTestTemplate05 from "./templates/loadTestTemplate05.tsx?raw";
import loadTestTemplate06 from "./templates/loadTestTemplate06.tsx?raw";
import loadTestTemplate07 from "./templates/loadTestTemplate07.tsx?raw";
import loadTestTemplate08 from "./templates/loadTestTemplate08.tsx?raw";
import loadTestTemplate09 from "./templates/loadTestTemplate09.tsx?raw";
import loadTestTemplate10 from "./templates/loadTestTemplate10.tsx?raw";
import loadTestTemplate11 from "./templates/loadTestTemplate11.tsx?raw";
import loadTestTemplate12 from "./templates/loadTestTemplate12.tsx?raw";
import loadTestTemplate13 from "./templates/loadTestTemplate13.tsx?raw";
import loadTestTemplate14 from "./templates/loadTestTemplate14.tsx?raw";
import loadTestTemplate15 from "./templates/loadTestTemplate15.tsx?raw";
import loadTestTemplate16 from "./templates/loadTestTemplate16.tsx?raw";
import loadTestTemplate17 from "./templates/loadTestTemplate17.tsx?raw";
import loadTestTemplate18 from "./templates/loadTestTemplate18.tsx?raw";
import loadTestTemplate19 from "./templates/loadTestTemplate19.tsx?raw";
import loadTestTemplate20 from "./templates/loadTestTemplate20.tsx?raw";
import loadTestTemplate21 from "./templates/loadTestTemplate21.tsx?raw";
import loadTestTemplate22 from "./templates/loadTestTemplate22.tsx?raw";
import loadTestTemplate23 from "./templates/loadTestTemplate23.tsx?raw";
import loadTestTemplate24 from "./templates/loadTestTemplate24.tsx?raw";
import loadTestTemplate25 from "./templates/loadTestTemplate25.tsx?raw";
import loadTestTemplate26 from "./templates/loadTestTemplate26.tsx?raw";
import loadTestTemplate27 from "./templates/loadTestTemplate27.tsx?raw";
import loadTestTemplate28 from "./templates/loadTestTemplate28.tsx?raw";
import loadTestTemplate29 from "./templates/loadTestTemplate29.tsx?raw";
import loadTestTemplate30 from "./templates/loadTestTemplate30.tsx?raw";
import loadTestTemplate31 from "./templates/loadTestTemplate31.tsx?raw";
import loadTestTemplate32 from "./templates/loadTestTemplate32.tsx?raw";
import loadTestTemplate33 from "./templates/loadTestTemplate33.tsx?raw";
import loadTestTemplate34 from "./templates/loadTestTemplate34.tsx?raw";
import loadTestTemplate35 from "./templates/loadTestTemplate35.tsx?raw";
import loadTestTemplate36 from "./templates/loadTestTemplate36.tsx?raw";
import loadTestTemplate37 from "./templates/loadTestTemplate37.tsx?raw";
import loadTestTemplate38 from "./templates/loadTestTemplate38.tsx?raw";
import loadTestTemplate39 from "./templates/loadTestTemplate39.tsx?raw";
import loadTestTemplate40 from "./templates/loadTestTemplate40.tsx?raw";
import loadTestTemplate41 from "./templates/loadTestTemplate41.tsx?raw";
import loadTestTemplate42 from "./templates/loadTestTemplate42.tsx?raw";
import loadTestTemplate43 from "./templates/loadTestTemplate43.tsx?raw";
import loadTestTemplate44 from "./templates/loadTestTemplate44.tsx?raw";
import loadTestTemplate45 from "./templates/loadTestTemplate45.tsx?raw";
import loadTestTemplate46 from "./templates/loadTestTemplate46.tsx?raw";
import loadTestTemplate47 from "./templates/loadTestTemplate47.tsx?raw";
import loadTestTemplate48 from "./templates/loadTestTemplate48.tsx?raw";
import loadTestTemplate49 from "./templates/loadTestTemplate49.tsx?raw";
import loadTestTemplate50 from "./templates/loadTestTemplate50.tsx?raw";
import loadTestTemplate51 from "./templates/loadTestTemplate51.tsx?raw";
import loadTestTemplate52 from "./templates/loadTestTemplate52.tsx?raw";
import loadTestTemplate53 from "./templates/loadTestTemplate53.tsx?raw";
import loadTestTemplate54 from "./templates/loadTestTemplate54.tsx?raw";
import loadTestTemplate55 from "./templates/loadTestTemplate55.tsx?raw";
import loadTestTemplate56 from "./templates/loadTestTemplate56.tsx?raw";
import loadTestTemplate57 from "./templates/loadTestTemplate57.tsx?raw";
import loadTestTemplate58 from "./templates/loadTestTemplate58.tsx?raw";
import loadTestTemplate59 from "./templates/loadTestTemplate59.tsx?raw";
import loadTestTemplate60 from "./templates/loadTestTemplate60.tsx?raw";
import loadTestTemplate61 from "./templates/loadTestTemplate61.tsx?raw";
import loadTestTemplate62 from "./templates/loadTestTemplate62.tsx?raw";
import loadTestTemplate63 from "./templates/loadTestTemplate63.tsx?raw";
import loadTestTemplate64 from "./templates/loadTestTemplate64.tsx?raw";
import loadTestTemplate65 from "./templates/loadTestTemplate65.tsx?raw";
import loadTestTemplate66 from "./templates/loadTestTemplate66.tsx?raw";
import loadTestTemplate67 from "./templates/loadTestTemplate67.tsx?raw";
import loadTestTemplate68 from "./templates/loadTestTemplate68.tsx?raw";
import loadTestTemplate69 from "./templates/loadTestTemplate69.tsx?raw";
import loadTestTemplate70 from "./templates/loadTestTemplate70.tsx?raw";
import loadTestTemplate71 from "./templates/loadTestTemplate71.tsx?raw";
import loadTestTemplate72 from "./templates/loadTestTemplate72.tsx?raw";
import loadTestTemplate73 from "./templates/loadTestTemplate73.tsx?raw";
import loadTestTemplate74 from "./templates/loadTestTemplate74.tsx?raw";
import loadTestTemplate75 from "./templates/loadTestTemplate75.tsx?raw";
import loadTestTemplate76 from "./templates/loadTestTemplate76.tsx?raw";
import loadTestTemplate77 from "./templates/loadTestTemplate77.tsx?raw";
import loadTestTemplate78 from "./templates/loadTestTemplate78.tsx?raw";
import loadTestTemplate79 from "./templates/loadTestTemplate79.tsx?raw";
import loadTestTemplate80 from "./templates/loadTestTemplate80.tsx?raw";
import loadTestTemplate81 from "./templates/loadTestTemplate81.tsx?raw";
import loadTestTemplate82 from "./templates/loadTestTemplate82.tsx?raw";
import loadTestTemplate83 from "./templates/loadTestTemplate83.tsx?raw";
import loadTestTemplate84 from "./templates/loadTestTemplate84.tsx?raw";
import loadTestTemplate85 from "./templates/loadTestTemplate85.tsx?raw";
import loadTestTemplate86 from "./templates/loadTestTemplate86.tsx?raw";
import loadTestTemplate87 from "./templates/loadTestTemplate87.tsx?raw";
import loadTestTemplate88 from "./templates/loadTestTemplate88.tsx?raw";
import loadTestTemplate89 from "./templates/loadTestTemplate89.tsx?raw";
import loadTestTemplate90 from "./templates/loadTestTemplate90.tsx?raw";
import loadTestTemplate91 from "./templates/loadTestTemplate91.tsx?raw";
import loadTestTemplate92 from "./templates/loadTestTemplate92.tsx?raw";
import loadTestTemplate93 from "./templates/loadTestTemplate93.tsx?raw";
import loadTestTemplate94 from "./templates/loadTestTemplate94.tsx?raw";
import loadTestTemplate95 from "./templates/loadTestTemplate95.tsx?raw";
import loadTestTemplate96 from "./templates/loadTestTemplate96.tsx?raw";
import loadTestTemplate97 from "./templates/loadTestTemplate97.tsx?raw";
import loadTestTemplate98 from "./templates/loadTestTemplate98.tsx?raw";
import loadTestTemplate99 from "./templates/loadTestTemplate99.tsx?raw";
import loadTestTemplate100 from "./templates/loadTestTemplate100.tsx?raw";
import loadTestTemplate101 from "./templates/loadTestTemplate101.tsx?raw";
import loadTestTemplate102 from "./templates/loadTestTemplate102.tsx?raw";
import loadTestTemplate103 from "./templates/loadTestTemplate103.tsx?raw";
import loadTestTemplate104 from "./templates/loadTestTemplate104.tsx?raw";
import loadTestTemplate105 from "./templates/loadTestTemplate105.tsx?raw";
import loadTestTemplate106 from "./templates/loadTestTemplate106.tsx?raw";
import loadTestTemplate107 from "./templates/loadTestTemplate107.tsx?raw";
import loadTestTemplate108 from "./templates/loadTestTemplate108.tsx?raw";
import loadTestTemplate109 from "./templates/loadTestTemplate109.tsx?raw";
import loadTestTemplate110 from "./templates/loadTestTemplate110.tsx?raw";
import loadTestTemplate111 from "./templates/loadTestTemplate111.tsx?raw";
import loadTestTemplate112 from "./templates/loadTestTemplate112.tsx?raw";
import loadTestTemplate113 from "./templates/loadTestTemplate113.tsx?raw";
import loadTestTemplate114 from "./templates/loadTestTemplate114.tsx?raw";
import loadTestTemplate115 from "./templates/loadTestTemplate115.tsx?raw";
import loadTestTemplate116 from "./templates/loadTestTemplate116.tsx?raw";
import loadTestTemplate117 from "./templates/loadTestTemplate117.tsx?raw";
import loadTestTemplate118 from "./templates/loadTestTemplate118.tsx?raw";
import loadTestTemplate119 from "./templates/loadTestTemplate119.tsx?raw";
import loadTestTemplate120 from "./templates/loadTestTemplate120.tsx?raw";
import loadTestTemplate121 from "./templates/loadTestTemplate121.tsx?raw";
import loadTestTemplate122 from "./templates/loadTestTemplate122.tsx?raw";
import loadTestTemplate123 from "./templates/loadTestTemplate123.tsx?raw";
import loadTestTemplate124 from "./templates/loadTestTemplate124.tsx?raw";
import loadTestTemplate125 from "./templates/loadTestTemplate125.tsx?raw";
import loadTestTemplate126 from "./templates/loadTestTemplate126.tsx?raw";
import loadTestTemplate127 from "./templates/loadTestTemplate127.tsx?raw";
import loadTestTemplate128 from "./templates/loadTestTemplate128.tsx?raw";
import { ComponentField, ComponentFields } from "../types/fields.ts";
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

const syntheticTemplates: VirtualFile[] = [
  loadTestTemplate01,
  loadTestTemplate02,
  loadTestTemplate03,
  loadTestTemplate04,
  loadTestTemplate05,
  loadTestTemplate06,
  loadTestTemplate07,
  loadTestTemplate08,
  loadTestTemplate09,
  loadTestTemplate10,
  loadTestTemplate11,
  loadTestTemplate12,
  loadTestTemplate13,
  loadTestTemplate14,
  loadTestTemplate15,
  loadTestTemplate16,
  loadTestTemplate17,
  loadTestTemplate18,
  loadTestTemplate19,
  loadTestTemplate20,
  loadTestTemplate21,
  loadTestTemplate22,
  loadTestTemplate23,
  loadTestTemplate24,
  loadTestTemplate25,
  loadTestTemplate26,
  loadTestTemplate27,
  loadTestTemplate28,
  loadTestTemplate29,
  loadTestTemplate30,
  loadTestTemplate31,
  loadTestTemplate32,
  loadTestTemplate33,
  loadTestTemplate34,
  loadTestTemplate35,
  loadTestTemplate36,
  loadTestTemplate37,
  loadTestTemplate38,
  loadTestTemplate39,
  loadTestTemplate40,
  loadTestTemplate41,
  loadTestTemplate42,
  loadTestTemplate43,
  loadTestTemplate44,
  loadTestTemplate45,
  loadTestTemplate46,
  loadTestTemplate47,
  loadTestTemplate48,
  loadTestTemplate49,
  loadTestTemplate50,
  loadTestTemplate51,
  loadTestTemplate52,
  loadTestTemplate53,
  loadTestTemplate54,
  loadTestTemplate55,
  loadTestTemplate56,
  loadTestTemplate57,
  loadTestTemplate58,
  loadTestTemplate59,
  loadTestTemplate60,
  loadTestTemplate61,
  loadTestTemplate62,
  loadTestTemplate63,
  loadTestTemplate64,
  loadTestTemplate65,
  loadTestTemplate66,
  loadTestTemplate67,
  loadTestTemplate68,
  loadTestTemplate69,
  loadTestTemplate70,
  loadTestTemplate71,
  loadTestTemplate72,
  loadTestTemplate73,
  loadTestTemplate74,
  loadTestTemplate75,
  loadTestTemplate76,
  loadTestTemplate77,
  loadTestTemplate78,
  loadTestTemplate79,
  loadTestTemplate80,
  loadTestTemplate81,
  loadTestTemplate82,
  loadTestTemplate83,
  loadTestTemplate84,
  loadTestTemplate85,
  loadTestTemplate86,
  loadTestTemplate87,
  loadTestTemplate88,
  loadTestTemplate89,
  loadTestTemplate90,
  loadTestTemplate91,
  loadTestTemplate92,
  loadTestTemplate93,
  loadTestTemplate94,
  loadTestTemplate95,
  loadTestTemplate96,
  loadTestTemplate97,
  loadTestTemplate98,
  loadTestTemplate99,
  loadTestTemplate100,
  loadTestTemplate101,
  loadTestTemplate102,
  loadTestTemplate103,
  loadTestTemplate104,
  loadTestTemplate105,
  loadTestTemplate106,
  loadTestTemplate107,
  loadTestTemplate108,
  loadTestTemplate109,
  loadTestTemplate110,
  loadTestTemplate111,
  loadTestTemplate112,
  loadTestTemplate113,
  loadTestTemplate114,
  loadTestTemplate115,
  loadTestTemplate116,
  loadTestTemplate117,
  loadTestTemplate118,
  loadTestTemplate119,
  loadTestTemplate120,
  loadTestTemplate121,
  loadTestTemplate122,
  loadTestTemplate123,
  loadTestTemplate124,
  loadTestTemplate125,
  loadTestTemplate126,
  loadTestTemplate127,
  loadTestTemplate128,
].map((content, index) => {
  const templateNumber = String(index + 1).padStart(2, "0");

  return {
    filepath: `src/templates/loadTestTemplate${templateNumber}.tsx`,
    content,
    templateManifestEntry: {
      name: `loadTestTemplate${templateNumber}`,
      description:
        "Synthetic load-test template generated to stress bundle size, config registration, and template manifest growth.",
      exampleSiteUrl: "",
      layoutRequired: true,
    },
  };
});

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
  ...syntheticTemplates,
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
    buildStart() {
      generateFiles();
    },
    buildEnd() {
      if (isBuildMode) {
        cleanupFiles();
      }
    },
  };
};
