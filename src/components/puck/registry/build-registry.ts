// Based on https://github.com/shadcn-ui/ui/blob/main/apps/www/scripts/build-registry.mts
import { registryComponents } from "./registry.ts";
import { promises as fs, existsSync } from "fs";
import { z } from "zod";
import { registryItemFileSchema } from "./schema.ts";
import path from "path";

const REGISTRY_BASE_PATH = "./src/components/puck";
const PUBLIC_FOLDER_BASE_PATH = "./src/components/puck/registry/output";
const PUBLIC_FOLDER_INDEX_PATH = `${PUBLIC_FOLDER_BASE_PATH}/index.ts`;
const COMPONENT_FOLDER_PATH = "components";
const VISUAL_EDITOR_PATH = "../../index.ts";

type File = z.infer<typeof registryItemFileSchema>;

async function writeFileRecursive(filePath: string, data: string) {
  const dir = path.dirname(filePath); // Extract the directory path

  try {
    // Ensure the directory exists, recursively creating directories as needed
    await fs.mkdir(dir, { recursive: true });

    // Write the file
    await fs.writeFile(filePath, data, "utf-8");
  } catch (error) {
    console.error("Error writing file: ", error);
  }
}

const getComponentFiles = async (files: File[]) => {
  const filesArrayPromises = (files ?? []).map(async (file) => {
    if (typeof file === "string") {
      const filePath = `${REGISTRY_BASE_PATH}/${file}`;
      const fileContent = await fs.readFile(filePath, "utf-8");
      return {
        type: "registry:component",
        content: fileContent.replaceAll(
          VISUAL_EDITOR_PATH,
          "@yext/visual-editor"
        ),
        path: file,
        target: `${COMPONENT_FOLDER_PATH}/${file}`,
      };
    }
  });
  const filesArray = await Promise.all(filesArrayPromises);

  return filesArray;
};

const main = async () => {
  // Delete index.ts if it exists
  if (existsSync(PUBLIC_FOLDER_INDEX_PATH)) {
    await fs.rm(PUBLIC_FOLDER_INDEX_PATH);
  }

  const componentNames = ["index"];

  // make a json file and put it in public folder
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
    const jsonPath = `${PUBLIC_FOLDER_BASE_PATH}/${component.name}.json`;
    await writeFileRecursive(jsonPath, json);

    // import new json file in index.ts
    await fs.appendFile(
      PUBLIC_FOLDER_INDEX_PATH,
      `import { default as ${component.name} } from "./${component.name}.json"\n`,
      "utf-8"
    );
  }

  // write and export the top level index file
  await writeFileRecursive(
    `${PUBLIC_FOLDER_BASE_PATH}/topLevel.json`,
    JSON.stringify(registryComponents)
  );

  await fs.appendFile(
    PUBLIC_FOLDER_INDEX_PATH,
    `import { default as index } from "./topLevel.json"\n`,
    "utf-8"
  );

  // export all json objects
  await fs.appendFile(
    PUBLIC_FOLDER_INDEX_PATH,
    `export const componentRegistries = {${componentNames.join(", ")}} \n`,
    "utf-8"
  );
};

main()
  .then(() => {
    console.log("Registry files created successfully");
  })
  .catch((err) => {
    console.error(err);
  });
