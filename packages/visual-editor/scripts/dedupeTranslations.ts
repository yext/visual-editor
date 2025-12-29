// scripts/dedupeTranslations.ts

import { readdir, readFile, writeFile } from "node:fs/promises";
import { createReadStream } from "node:fs";
import { join, resolve } from "node:path";
import oboe from "oboe";

const COMPONENTS_DIR = resolve("locales/components");
const PLATFORM_DIR = resolve("locales/platform");
const TARGET_FILE = "visual-editor.json";

interface Entry {
  keyPath: string;
  value: any;
  stringValue: string;
}

const dedupeTranslations = async () => {
  let totalDuplicatesRemoved = 0;
  let filesWithConflicts = 0;
  let filesProcessed = 0;

  const localeDirs = [
    ...(await readdir(COMPONENTS_DIR).catch(() => [])).map((d) =>
      join(COMPONENTS_DIR, d)
    ),
    ...(await readdir(PLATFORM_DIR).catch(() => [])).map((d) =>
      join(PLATFORM_DIR, d)
    ),
  ];

  for (const localeDir of localeDirs) {
    const filePath = join(localeDir, TARGET_FILE);

    // Quick check if file exists
    const content = await readFile(filePath, "utf-8").catch(() => null);
    if (!content) {
      continue;
    }

    filesProcessed++;

    const entries: Entry[] = [];
    const seen = new Map<string, string>();
    const conflicts = new Set<string>();

    await new Promise<void>((resolve, reject) => {
      oboe(createReadStream(filePath))
        .node("!*", function (value: any, path: string[]) {
          // Fires for every primitive value (string, number, boolean, null)
          if (path.length === 0) {
            return oboe.drop; // skip root
          }

          const fullKey = path.join(".");
          const stringValue = JSON.stringify(value);

          if (seen.has(fullKey)) {
            if (seen.get(fullKey) !== stringValue) {
              conflicts.add(fullKey);
            }
            // else: exact duplicate → remove later
          } else {
            seen.set(fullKey, stringValue);
          }

          entries.push({ keyPath: fullKey, value, stringValue });

          return oboe.drop;
        })
        .done(() => resolve())
        .fail((err: any) => {
          console.error(`❌ Failed to parse ${filePath}:`, err.thrown || err);
          reject(err);
        });
    });

    // Report conflicts
    if (conflicts.size > 0) {
      console.log(`⚠️  Conflicting duplicate keys found in: ${filePath}`);
      for (const key of [...conflicts].sort()) {
        console.log(`   → "${key}" has different values.`);
      }
      filesWithConflicts++;
    }

    // Rebuild clean object without exact duplicates
    let duplicatesRemoved = 0;
    const cleaned: any = {};
    const used = new Set<string>();

    for (const { keyPath, value, stringValue } of entries) {
      if (used.has(keyPath) && seen.get(keyPath) === stringValue) {
        duplicatesRemoved++;
        continue;
      }
      used.add(keyPath);

      const parts = keyPath.split(".");
      let obj = cleaned;
      for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i];
        if (!obj[part]) obj[part] = {};
        obj = obj[part];
      }
      obj[parts[parts.length - 1]] = value;
    }

    if (duplicatesRemoved > 0) {
      totalDuplicatesRemoved += duplicatesRemoved;
      console.log(
        `🗑️  Removed ${duplicatesRemoved} exact duplicate key/value pair(s) from: ${filePath}`
      );
      await writeFile(
        filePath,
        JSON.stringify(cleaned, null, 2) + "\n",
        "utf-8"
      );
    }
  }

  // Final summary
  if (totalDuplicatesRemoved === 0 && filesWithConflicts === 0) {
    console.log(
      "✅ No duplicates or conflicts found in any visual-editor.json files."
    );
  } else {
    if (totalDuplicatesRemoved > 0) {
      console.log(
        `\nSummary: Removed ${totalDuplicatesRemoved} exact duplicate entries across all files.`
      );
    }
    if (filesWithConflicts > 0) {
      console.log(
        `Summary: ${filesWithConflicts} file(s) have conflicting duplicate keys.`
      );
    }
  }

  console.log(`Processed ${filesProcessed} files.`);
};

try {
  await dedupeTranslations();
} catch (err) {
  console.error("Error:", err);
  process.exit(1);
}
