import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.resolve(__dirname, "..");

const COMPONENTS_EN_PATH = path.join(
  ROOT_DIR,
  "locales/components/en/visual-editor.json"
);
const PLATFORM_DIR = path.join(ROOT_DIR, "locales/platform");
const COMPONENTS_DIR = path.join(ROOT_DIR, "locales/components");

// Helper to ensure directory exists
const ensureDir = (dir: string) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Load JSON file safely
const loadJson = (filePath: string): Record<string, any> => {
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${filePath} – treating as empty object`);
    return {};
  }
  try {
    const content = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(content) as Record<string, any>;
  } catch (err) {
    console.error(`Failed to parse JSON in ${filePath}:`, err);
    return {};
  }
};

// Save JSON file with pretty formatting
const saveJson = (filePath: string, data: Record<string, string>) => {
  ensureDir(path.dirname(filePath));
  const content = JSON.stringify(data, null, 2) + "\n";
  fs.writeFileSync(filePath, content, "utf-8");
  console.log(`Updated: ${filePath}`);
};

/**
 * Copies translations from platform locale files to components locale files. If the key does not exist
 * in the components file but exists in the platform file, it will be copied over. If the key already exists
 * in the components file, it will be overwritten.
 */
const copyPlatformTranslations = async () => {
  // 1. Read the English components file to get the list of keys
  if (!fs.existsSync(COMPONENTS_EN_PATH)) {
    console.error(`English components file not found: ${COMPONENTS_EN_PATH}`);
    process.exit(1);
  }

  const enComponentKeys = Object.keys(loadJson(COMPONENTS_EN_PATH));
  if (enComponentKeys.length === 0) {
    console.log("No keys found in English components file.");
    return;
  }

  console.log(
    `Found ${enComponentKeys.length} keys in locales/components/en/visual-editor.json\n`
  );

  // 2. Find all locale folders under locales/platform
  if (!fs.existsSync(PLATFORM_DIR)) {
    console.error(`Platform directory not found: ${PLATFORM_DIR}`);
    process.exit(1);
  }

  const platformLocaleDirs = fs
    .readdirSync(PLATFORM_DIR, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  const localesToProcess = platformLocaleDirs;

  if (localesToProcess.length === 0) {
    console.log("No non-English locale folders found in locales/platform.");
    return;
  }

  console.log(`Processing locales: ${localesToProcess.join(", ")}\n`);

  for (const locale of localesToProcess) {
    const platformFilePath = path.join(
      PLATFORM_DIR,
      locale,
      "visual-editor.json"
    );
    const componentsFilePath = path.join(
      COMPONENTS_DIR,
      locale,
      "visual-editor.json"
    );

    // Load platform translations for this locale
    const platformTranslations = loadJson(platformFilePath);

    // Load existing components translations (if any)
    const componentsTranslations = loadJson(componentsFilePath);

    let updated = false;

    // Copy missing keys/mismatching values from platform to components
    for (const key of enComponentKeys) {
      if (key in platformTranslations) {
        if (componentsTranslations[key] !== platformTranslations[key]) {
          componentsTranslations[key] = platformTranslations[key];
          updated = true;
          console.log(
            `  → Added/Updated "${key}" to components/${locale}/visual-editor.json`
          );
        }
      }
    }

    // Save only if something was added
    if (updated) {
      saveJson(componentsFilePath, componentsTranslations);
    } else {
      console.log(`No new keys to add for locale "${locale}"`);
    }
  }

  console.log("\nDone!");
};

try {
  await copyPlatformTranslations();
} catch (err) {
  console.error("Unexpected error:", err);
  process.exit(1);
}
