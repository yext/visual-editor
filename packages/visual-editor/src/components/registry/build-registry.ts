// Based on https://github.com/bwestwood11/ui-cart/blob/main/scripts/build-registry.ts
// which is a simplified version of https://github.com/shadcn-ui/ui/blob/main/apps/www/scripts/build-registry.mts
import { writeFile, copyFile, mkdir, readFile } from "node:fs/promises";
import { existsSync, rmSync } from "fs";
import z from "zod";
import path from "path";
import { registryComponents } from "./registry.ts";
import { registryItemFileSchema } from "./schema.ts";

const DIST_DIR = `./dist`;
const SLUG = `components`;
const COLORS_PATH = `${DIST_DIR}/${SLUG}/colors`;
const ICONS_PATH = `${DIST_DIR}/${SLUG}/icons`;
const STYLES_PATH = `${DIST_DIR}/${SLUG}/styles`;
const YEXT_STYLE_PATH = `${STYLES_PATH}/yext`;
const COMPONENTS_SRC_PATH = `./packages/visual-editor/src/components`;

const styleIndex = {
  name: "yext",
  type: "registry:style",
  cssVars: {},
  files: [],
};

const colorsIndex = {
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

const stylesIndex = [{ name: "yext", label: "Yext" }];

async function writeFileRecursive(filePath: string, data: string) {
  const dir = path.dirname(filePath); // Extract the directory path

  try {
    // Ensure the directory exists, recursively creating directories as needed
    await mkdir(dir, { recursive: true });
    await writeFile(filePath, data, "utf-8");
  } catch (error) {
    console.error("Error writing file: ", error);
  }
}

type File = z.infer<typeof registryItemFileSchema>;
// Read the files specified in registry.ts, insert the @yext/visual-editor import and output JSON
const getComponentFiles = async (files: File[]) => {
  const filesArrayPromises = (files ?? []).map(async (file) => {
    const filePath = `${COMPONENTS_SRC_PATH}/${file.path}`;
    const fileContent = await readFile(filePath, "utf-8");
    return {
      type: "registry:component",
      content: fileContent,
      path: file.path,
      target: `${SLUG}/${file.path}`,
    };
  });
  const filesArray = await Promise.all(filesArrayPromises);

  return filesArray;
};

export const buildRegistry = async () => {
  // Delete dist folder if it exists
  if (existsSync(DIST_DIR)) {
    rmSync(DIST_DIR, { recursive: true });
  }

  // Write all index files
  await Promise.all([
    writeFileRecursive(
      `${YEXT_STYLE_PATH}/index.json`,
      JSON.stringify(styleIndex)
    ),
    writeFileRecursive(
      `${COLORS_PATH}/neutral.json`,
      JSON.stringify(colorsIndex)
    ),
    writeFileRecursive(`${ICONS_PATH}/index.json`, JSON.stringify(iconsIndex)),
    writeFileRecursive(
      `${STYLES_PATH}/index.json`,
      JSON.stringify(stylesIndex)
    ),
    writeFileRecursive(
      `${DIST_DIR}/${SLUG}/index.json`,
      JSON.stringify(registryComponents)
    ),
    writeFileRecursive(
      `${DIST_DIR}/${SLUG}/registry/index.json`,
      JSON.stringify(registryComponents)
    ),
  ]);

  // copy artifacts.json after to ensure that the `dist` dir exists
  await copyFile(
    `${COMPONENTS_SRC_PATH}/registry/artifacts.json`,
    `${DIST_DIR}/artifacts.json`
  );

  // generate JSON files for each component
  for (let i = 0; i < registryComponents.length; i++) {
    const component = registryComponents[i];
    const files = component.files;
    if (!files) {
      throw new Error("No files found for component " + component.name);
    }

    const filesArray = await getComponentFiles(files);

    const json = JSON.stringify(
      {
        ...component,
        files: filesArray,
      },
      null,
      2
    );
    await writeFileRecursive(`${YEXT_STYLE_PATH}/${component.name}.json`, json);
  }
};

buildRegistry()
  .then(() => {
    console.log("Registry files created successfully");
  })
  .catch((err) => {
    console.error("Error creating registry files: ", err);
  });
