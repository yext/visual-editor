import fs from "fs/promises";
import path from "path";

const getPluralCategories = (locale: string): Set<string> => {
  const categories = new Set<string>();
  try {
    const pr = new Intl.PluralRules(locale);
    // Test integers from 0 to 200 to cover all possible plural rules
    for (let i = 0; i <= 200; i++) {
      categories.add(pr.select(i));
    }
  } catch (_) {
    console.error(
      `Invalid locale: ${locale}. Falling back to 'one' and 'other'.`
    );
    categories.add("one");
    categories.add("other");
  }
  return categories;
};

const removeUnneededPlurals = (obj: any, categories: Set<string>): void => {
  if (typeof obj !== "object" || obj === null) return;

  for (const key of Object.keys(obj)) {
    const value = obj[key];
    if (typeof value === "object" && value !== null) {
      removeUnneededPlurals(value, categories);
    } else if (typeof value === "string") {
      // Check if key ends with _suffix where suffix is a plural category
      const match = key.match(/_(zero|one|two|few|many|other)$/);
      if (match) {
        const suffix = match[1];
        if (!categories.has(suffix)) {
          delete obj[key];
        }
      }
    }
  }
};

/**
 * Fixes plural forms in translation JSON files by removing unneeded plural keys
 * based on the locale's pluralization rules.
 */
const fixPlurals = async () => {
  const baseDirs = ["locales/components", "locales/platform"];

  for (const baseDir of baseDirs) {
    try {
      const localeDirs = await fs.readdir(baseDir, { withFileTypes: true });
      for (const dirent of localeDirs) {
        if (dirent.isDirectory()) {
          const locale = dirent.name;
          const filePath = path.join(baseDir, locale, "visual-editor.json");
          try {
            const stats = await fs.stat(filePath);
            if (stats.isFile()) {
              const content = await fs.readFile(filePath, "utf-8");
              const obj = JSON.parse(content);
              const categories = getPluralCategories(locale);
              removeUnneededPlurals(obj, categories);
              await fs.writeFile(
                filePath,
                JSON.stringify(obj, null, 2),
                "utf-8"
              );
              console.log(`Processed ${filePath}`);
            }
          } catch (e) {
            console.error(`Error processing ${filePath}: ${e}`);
          }
        }
      }
    } catch (e) {
      console.error(`Error reading directory ${baseDir}: ${e}`);
    }
  }
};

try {
  await fixPlurals();
} catch (err) {
  console.error("Unexpected error:", err);
  process.exit(1);
}
