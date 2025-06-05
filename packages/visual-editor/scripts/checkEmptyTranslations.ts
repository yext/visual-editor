import * as fs from "fs";
import * as path from "path";

const localesDir = path.join(__dirname, "../locales");
let foundEmptyTranslation = false;
const errorMessages: string[] = [];

console.log(`Checking for empty translations in: ${localesDir}`);

try {
  const localeDirs = fs
    .readdirSync(localesDir, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  for (const locale of localeDirs) {
    const filePath = path.join(localesDir, locale, "visual-editor.json");
    if (fs.existsSync(filePath)) {
      console.log(`Checking file: ${filePath}`);
      const content = fs.readFileSync(filePath, "utf8");
      const json = JSON.parse(content);
      for (const key in json) {
        if (Object.prototype.hasOwnProperty.call(json, key)) {
          if (typeof json[key] === "string" && json[key].trim() === "") {
            errorMessages.push(
              `Empty translation for key "${key}" in locale "${locale}" (${filePath})`
            );
            foundEmptyTranslation = true;
          }
        }
      }
    } else {
      console.warn(`File not found, skipping: ${filePath}`);
    }
  }

  if (foundEmptyTranslation) {
    console.error("\nFound empty translation strings:");
    errorMessages.forEach((msg) => console.error(msg));
    process.exit(1); // Exit with error code
  } else {
    console.log("\nNo empty translation strings found. All good!");
    process.exit(0);
  }
} catch (error) {
  console.error("Error during script execution:", error);
  process.exit(1);
}
