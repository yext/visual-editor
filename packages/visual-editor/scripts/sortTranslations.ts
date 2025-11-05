import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";

/**
 * The base directory where translation JSON files are located.
 * Resolves to the "../locales" folder relative to this script's location.
 */
const baseDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "../locales"
);

/**
 * Recursively sorts the keys of an object alphabetically.
 * If the input is not an object or is an array, it is returned as-is.
 *
 * @param {any} obj - The object to sort.
 * @returns {any} A new object with keys sorted alphabetically.
 */
function sortObject(obj: any): any {
  if (typeof obj !== "object" || obj === null || Array.isArray(obj)) return obj;

  return Object.keys(obj)
    .sort()
    .reduce(
      (acc, key) => {
        acc[key] = sortObject(obj[key]);
        return acc;
      },
      {} as Record<string, any>
    );
}

/**
 * Reads all language directories under the baseDir,
 * then reads, sorts, and overwrites each JSON translation file within those directories.
 */
async function processLocalesFolder(currentPath: string, subfolderPath = "") {
  const items = await fs.readdir(currentPath, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(currentPath, item.name);
    const currentSubfolder = subfolderPath
      ? path.join(subfolderPath, item.name)
      : item.name;

    if (item.isDirectory()) {
      const subItems = await fs.readdir(fullPath, { withFileTypes: true });
      const hasJson = subItems.some(
        (f) => f.isFile() && f.name.endsWith(".json")
      );

      if (hasJson) {
        for (const file of subItems) {
          if (file.isFile() && file.name.endsWith(".json")) {
            const filePath = path.join(fullPath, file.name);
            const data = JSON.parse(await fs.readFile(filePath, "utf8"));
            const sorted = sortObject(data);
            await fs.writeFile(
              filePath,
              JSON.stringify(sorted, null, 2) + "\n"
            );
          }
        }
      } else {
        await processLocalesFolder(fullPath, currentSubfolder);
      }
    }
  }
}

await processLocalesFolder(baseDir);
