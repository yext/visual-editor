// Based on https://github.com/bwestwood11/ui-cart/blob/main/scripts/build-registry.ts
// which is a simplified version of https://github.com/shadcn-ui/ui/blob/main/apps/www/scripts/build-registry.mts
import { writeFile, mkdir, readFile } from "node:fs/promises";
import z from "zod";
import { fileURLToPath } from "node:url";
import { resolve, dirname } from "node:path";
import { registryComponents } from "./registry.ts";
import { registryItemFileSchema } from "./schema.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const ROOT_DIR = resolve(__dirname, "..", "..", "..", "..", "..", ".."); // root of the project
const DIST_DIR = resolve(ROOT_DIR, "dist");
const SLUG = "components";
const COLORS_PATH = resolve(DIST_DIR, SLUG, "colors");
const ICONS_PATH = resolve(DIST_DIR, SLUG, "icons");
const STYLES_PATH = resolve(DIST_DIR, SLUG, "styles");
const YEXT_STYLE_PATH = resolve(DIST_DIR, SLUG, "yext");
const COMPONENTS_SRC_PATH = resolve(__dirname, "..");

// matches import { ... } from "..." where the import path starts with ../../
const IMPORT_PATTERN = /from "(\.\.\/\.\.\/[^"]+)"/g;

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
  const dir = dirname(filePath); // Extract the directory path

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
    const filePath = resolve(COMPONENTS_SRC_PATH, file.path);
    const fileContent = await readFile(filePath, "utf-8");
    return {
      type: "registry:component",
      content: fileContent.replace(
        IMPORT_PATTERN,
        `from "@yext/visual-editor"`
      ),
      path: file.path,
      target: `${SLUG}/${file.path}`,
    };
  });
  const filesArray = await Promise.all(filesArrayPromises);

  return filesArray;
};

export const buildRegistry = async () => {
  // Write all index files
  await Promise.all([
    writeFileRecursive(
      resolve(YEXT_STYLE_PATH, "index.json"),
      JSON.stringify(styleIndex)
    ),
    writeFileRecursive(
      resolve(COLORS_PATH, "neutral.json"),
      JSON.stringify(colorsIndex)
    ),
    writeFileRecursive(
      resolve(ICONS_PATH, "index.json"),
      JSON.stringify(iconsIndex)
    ),
    writeFileRecursive(
      resolve(STYLES_PATH, "index.json"),
      JSON.stringify(stylesIndex)
    ),
    writeFileRecursive(
      resolve(DIST_DIR, SLUG, "index.json"),
      JSON.stringify(registryComponents)
    ),
    writeFileRecursive(
      resolve(DIST_DIR, SLUG, "registry", "index.json"),
      JSON.stringify(registryComponents)
    ),
  ]);

  // generate JSON files for each component
  for (let i = 0; i < registryComponents.length; i++) {
    const component = registryComponents[i];
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
