import fs from "fs";
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
for (const langDir of fs.readdirSync(baseDir)) {
  const langPath = path.join(baseDir, langDir);

  if (!fs.lstatSync(langPath).isDirectory()) continue;

  // Process each file inside the language directory
  for (const file of fs.readdirSync(langPath)) {
    const filePath = path.join(langPath, file);
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const sorted = sortObject(data);
    fs.writeFileSync(filePath, JSON.stringify(sorted, null, 2) + "\n");
  }
}
