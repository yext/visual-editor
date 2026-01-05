// delete-visual-editor-keys.ts
import fs from "node:fs";
import path from "node:path";
import * as readline from "node:readline/promises";

/**
 * Prompts the user to enter comma-separated keys to delete
 */
async function promptForKeys(): Promise<string[]> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(
    "Enter the translation keys to delete from visual-editor.json files"
  );
  console.log(
    "(comma-separated, spaces optional, e.g. missingTranslation, saveButton, cancel)"
  );
  console.log("");

  const answer = await rl.question("Keys to delete: ");
  rl.close();

  const keys = answer
    .split(",")
    .map((k) => k.trim())
    .filter(Boolean);

  if (keys.length === 0) {
    console.error("No valid keys provided.");
    process.exit(1);
  }

  return keys;
}

/**
 * Asks whether the user wants to also delete keys from English (en) files
 */
async function promptIncludeEnglish(): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log(
    "\nDo you also want to delete these keys from the English (en) locale files?"
  );
  console.log(
    "This will modify the source English translations — usually not recommended."
  );
  console.log("");

  while (true) {
    const answer = await rl.question("Include English files? (y/N): ");
    const normalized = answer.trim().toLowerCase();

    if (normalized === "" || normalized === "n" || normalized === "no") {
      rl.close();
      return false;
    }
    if (normalized === "y" || normalized === "yes") {
      rl.close();
      return true;
    }
    console.log("Please answer y/yes or n/no (or press Enter for no).");
  }
}

/**
 * Finds all visual-editor.json files in the specified base directories.
 * Optionally includes English locale folders.
 */
function findVisualEditorFiles(
  baseDirs: string[],
  includeEnglish: boolean = false
): string[] {
  const files: string[] = [];

  for (const baseDir of baseDirs) {
    if (!fs.existsSync(baseDir)) {
      console.warn(`Directory not found: ${baseDir} — skipping`);
      continue;
    }

    try {
      const locales = fs
        .readdirSync(baseDir, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name);

      for (const locale of locales) {
        // Skip English unless explicitly requested
        if (locale.toLowerCase() === "en" && !includeEnglish) {
          continue;
        }

        const filePath = path.join(baseDir, locale, "visual-editor.json");
        if (fs.existsSync(filePath)) {
          files.push(filePath);
        }
      }
    } catch (err) {
      console.error(
        `Error reading directory ${baseDir}:`,
        err instanceof Error ? err.message : err
      );
    }
  }

  return files;
}

/**
 * Removes specified keys from a single JSON file and writes it back if changed.
 */
function removeKeysFromFile(filePath: string, keysToDelete: string[]): number {
  let content: Record<string, any>;

  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    content = JSON.parse(raw);
  } catch (err) {
    console.error(
      `Invalid JSON in ${filePath}:`,
      err instanceof Error ? err.message : err
    );
    return 0;
  }

  let removedCount = 0;

  for (const key of keysToDelete) {
    if (key in content) {
      delete content[key];
      removedCount++;
    }
  }

  if (removedCount > 0) {
    const updatedJson = JSON.stringify(content, null, 2) + "\n";
    fs.writeFileSync(filePath, updatedJson, "utf-8");
    console.log(
      `✓ ${path.basename(path.dirname(filePath))}/${path.basename(filePath)} — removed ${removedCount} key(s)`
    );
  }

  return removedCount;
}

/**
 * Main function: deletes specified keys from visual-editor.json files
 * (non-English by default, English optionally)
 */
async function deleteTranslationKeys() {
  console.log("=== Delete Translation Keys from visual-editor.json ===\n");

  const keysToDelete = await promptForKeys();

  const includeEnglish = await promptIncludeEnglish();

  console.log("\nKeys to remove: ", keysToDelete);
  console.log(`Including English (en) files: ${includeEnglish ? "YES" : "NO"}`);
  console.log("Working...\n");

  const baseDirs = [
    path.join("locales", "components"),
    path.join("locales", "platform"),
  ];

  const targetFiles = findVisualEditorFiles(baseDirs, includeEnglish);

  if (targetFiles.length === 0) {
    console.log(
      "No visual-editor.json files found in the specified locale folders."
    );
    return;
  }

  console.log(
    `Found ${targetFiles.length} visual-editor.json file(s) to check.\n`
  );

  let totalRemoved = 0;
  let filesModified = 0;

  for (const filePath of targetFiles) {
    const removed = removeKeysFromFile(filePath, keysToDelete);
    if (removed > 0) {
      filesModified++;
    }
    totalRemoved += removed;
  }

  console.log("\nSummary:");
  console.log(`  Files checked:      ${targetFiles.length}`);
  console.log(`  Files modified:     ${filesModified}`);
  console.log(`  Total keys removed: ${totalRemoved}`);

  if (filesModified === 0) {
    console.log("\nNo matching keys were found in the processed files.");
  }
}

// ────────────────────────────────────────────────
// ENTRY POINT
// ────────────────────────────────────────────────

try {
  await deleteTranslationKeys();
} catch (err) {
  console.error("Unexpected error:", err instanceof Error ? err.message : err);
  process.exit(1);
}
