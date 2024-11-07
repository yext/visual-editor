// Based on https://github.com/bwestwood11/ui-cart/blob/main/scripts/build-registry.ts
// which is a simplified version of https://github.com/shadcn-ui/ui/blob/main/apps/www/scripts/build-registry.mts
import fs from "fs";
import z from "zod";
import path from "path";
import { registryComponents } from "./registry.ts";
import { registryItemFileSchema } from "./schema.ts";

const DIST_DIR = `../../../../dist`;
const SLUG = `components`;
const COMPONENT_PATH = `${DIST_DIR}/${SLUG}/styles/default`;
const COLOR_PATH = `${DIST_DIR}/${SLUG}/colors`;
const ICONS_PATH = `${DIST_DIR}/${SLUG}/icons`;

// matches import { ... } from "..." where the import path starts with ../../
const IMPORT_PATTERN = /from "(\.\.\/\.\.\/[^"]+)"/g;

const styleIndex = {
  name: "default",
  type: "registry:style",
  cssVars: {},
  files: [],
};

const colorIndex = {
  inlineColors: {
    light: {},
    dark: {},
  },
  cssVars: {
    light: {},
    dark: {},
  },
  inlineColorsTemplate: "",
  cssVarsTemplate: "",
};

const iconsIndex = {};

type File = z.infer<typeof registryItemFileSchema>;

async function writeFileRecursive(filePath: string, data: string) {
  const dir = path.dirname(filePath); // Extract the directory path

  try {
    // Ensure the directory exists, recursively creating directories as needed
    await fs.promises.mkdir(dir, { recursive: true });

    // Write the file
    await fs.promises.writeFile(filePath, data, "utf-8");
  } catch (error) {
    console.error("Error writing file: ", error);
  }
}

const getComponentFiles = async (files: File[]) => {
  const filesArrayPromises = (files ?? []).map(async (file) => {
    if (typeof file === "string") {
      const filePath = `../${file}`;
      const fileContent = await fs.promises.readFile(filePath, "utf-8");
      return {
        type: "registry:component",
        content: fileContent.replace(
          IMPORT_PATTERN,
          `from "@yext/visual-editor"`
        ),
        path: file,
        target: `${SLUG}/${file}`,
      };
    }
  });
  const filesArray = await Promise.all(filesArrayPromises);

  return filesArray;
};

export const buildRegistry = async () => {
  // Delete dist folder if it exists
  if (fs.existsSync(DIST_DIR)) {
    fs.rmSync(DIST_DIR, { recursive: true });
  }

  // Create directories if they do not exist
  for (const path of [COMPONENT_PATH, COLOR_PATH, ICONS_PATH]) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path, { recursive: true });
    }
  }

  // Write index files
  fs.writeFileSync(`${COMPONENT_PATH}/index.json`, JSON.stringify(styleIndex));
  fs.writeFileSync(`${COLOR_PATH}/neutral.json`, JSON.stringify(colorIndex));
  fs.writeFileSync(`${ICONS_PATH}/index.json`, JSON.stringify(iconsIndex));
  fs.copyFileSync(`../registry/artifacts.json`, `${DIST_DIR}/artifacts.json`);

  const componentNames = ["index"];

  // generate JSON files for each component
  for (let i = 0; i < registryComponents.length; i++) {
    const component = registryComponents[i];
    componentNames.push(component.name);
    const files = component.files;
    if (!files) throw new Error("No files found for component");

    const filesArray = await getComponentFiles(files);

    const json = JSON.stringify(
      {
        ...component,
        files: filesArray,
      },
      null,
      2
    );
    const jsonPath = `${COMPONENT_PATH}/${component.name}.json`;
    await writeFileRecursive(jsonPath, json);
  }

  // write and export the top level index file
  await writeFileRecursive(
    `${DIST_DIR}/${SLUG}/index.json`,
    JSON.stringify(registryComponents)
  );
  await writeFileRecursive(
    `${DIST_DIR}/${SLUG}/registry/index.json`,
    JSON.stringify(registryComponents)
  );
};

buildRegistry()
  .then(() => {
    console.log("Registry files created successfully");
  })
  .catch((err) => {
    console.error("Error creating registry files: ", err);
  });
