// creator/src/utils/fileUtils.ts
import * as fs from "fs";
import * as path from "path";

/**
 * Finds a unique directory name by appending a counter.
 * @param basePath The base directory name (e.g., 'www-mcdonalds-com_2025-07-31').
 * @returns A unique directory name (e.g., 'www-mcdonalds-com_2025-07-31(1)').
 */
export function getUniqueDirectoryName(basePath: string): string {
  let counter = 1;
  let newPath = basePath;

  while (fs.existsSync(newPath)) {
    newPath = `${basePath} (${counter})`;
    counter++;
  }

  return newPath;
}

/**
 * Writes a string to a file, creating the directory if it doesn't exist.
 * @param filePath The full path to the file.
 * @param content The string content to write.
 */
export function saveFile(filePath: string, content: string | Buffer) {
  const outputDir = path.dirname(filePath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  fs.writeFileSync(filePath, content);
}

/**
 * Reads and returns the content of the component schemas file.
 * @param schemasPath The path to the component schemas JSON file.
 * @returns The content of the file as a string.
 */
export function readComponentSchemas(schemasPath: string): string {
  if (!fs.existsSync(schemasPath)) {
    throw new Error(
      `Component schemas file not found at: ${schemasPath}. Please run 'pnpm run generate-component-data' first.`,
    );
  }
  return fs.readFileSync(schemasPath, "utf-8");
}
