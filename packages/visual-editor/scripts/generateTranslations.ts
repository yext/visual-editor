import fs from "fs/promises";
import path from "path";

/** Default source language used for translation */
const defaultLng = "en";

/** i18next namespace to operate on */
const ns = "visual-editor";

/** Path to the root locales directory */
const localesDir = "./locales";

/** Whether to perform a dry run (simulate only, no file writes) */
const isDryRun = process.argv.includes("--dry-run");

/** Represents one translation segment from the Google Translate API */
type TranslationSegment = [
  translatedText: string,
  originalText: string,
  ...rest: unknown[],
];

/** Structured response from the Google Translate API */
type GoogleTranslateRawResponse = [TranslationSegment[], unknown, string];

// Context separator used by i18next-scanner
const CONTEXT_SEPARATOR = "_";

// Unique markers for embedding context into the text for translation
const CONTEXT_MARKER_START = "[[";
const CONTEXT_MARKER_END = "]]";

// Google Translate API very rarely removes/adds [ or ]
// Matches one or more opening "[", then any characters (non-greedy), then one or more closing "]"
const CONTEXT_EMBED_REGEX = new RegExp(`\\[+.*?\\]+`, "g");

/**
 * Extracts context from a key if it uses the i18next context separator.
 */
function extractContextFromKey(key: string): string | null {
  const parts = key.split(CONTEXT_SEPARATOR);
  if (parts.length > 1) {
    return parts[parts.length - 1];
  }
  return null;
}

/**
 * Inserts context into text to be translated using unique markers.
 * Ex. "Left" with context "direction" becomes "Left [[direction]]"
 */
function embedContextInText(text: string, context: string): string {
  return `${text} ${CONTEXT_MARKER_START}${context}${CONTEXT_MARKER_END}`;
}

/**
 * Removes embedded context from the translated text using the unique markers.
 * Ex. "Gauche [[direction]]" becomes "Gauche"
 */
function removeEmbeddedContext(text: string): string {
  return text.replace(CONTEXT_EMBED_REGEX, "").trim();
}

/**
 * Reads all directories under localesDir and returns them as target languages.
 */
async function getTargetLanguages(
  type: "components" | "platform"
): Promise<string[]> {
  const entries = await fs.readdir(path.join(localesDir, type), {
    withFileTypes: true,
  });
  // Filter directories only
  return entries.filter((entry) => entry.isDirectory()).map((dir) => dir.name);
}

/**
 * Translates a string of text using the unofficial Google Translate API
 * @param text - The original English text to translate
 * @param targetLang - The target locale code (e.g., "fr_FR")
 * @returns The translated string, or the original text if translation fails
 */
async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${defaultLng}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Google Translate API error: ${res.status} for text: "${text}"`
    );
  }

  const data = (await res.json()) as GoogleTranslateRawResponse;

  const translations = data[0];
  if (!translations || !Array.isArray(translations)) {
    throw new Error(
      `No translation received for text=${text} language=${targetLang}`
    );
  }

  const translatedText = translations
    .map(([translatedText]: TranslationSegment) => translatedText)
    .join("");

  return translatedText || text;
}

/**
 * Reads a JSON file safely, returning an empty object if the file doesn't exist or is invalid
 * @param filePath - Full path to the JSON file
 * @returns Parsed JSON object or an empty object if reading fails
 */
async function loadJsonSafe(filePath: string): Promise<Record<string, any>> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Writes a JSON object to the specified path
 * @param filePath - Full path to the output file
 * @param data - JSON data to write
 */
async function saveJson(
  filePath: string,
  data: Record<string, string>
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

/**
 * Flattens a nested JSON object into a dot-separated key-value structure
 * @param obj - The object to flatten
 * @param prefix - Prefix for nested keys (used internally)
 * @returns A flat object with dot-separated keys
 */
function flatten(
  obj: Record<string, any>,
  prefix = ""
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key in obj) {
    const value = obj[key];
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (typeof value === "object" && value !== null) {
      Object.assign(result, flatten(value, newKey));
    } else {
      result[newKey] = String(value ?? "");
    }
  }
  return result;
}

/**
 * Reconstructs a nested JSON object from a flat dot-separated key structure
 * @param obj - Flat object with dot-separated keys
 * @returns A nested object
 */
function unflatten(obj: Record<string, string>): Record<string, any> {
  const result: Record<string, any> = {};
  for (const flatKey in obj) {
    const parts = flatKey.split(".");
    let cur = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        cur[part] = obj[flatKey];
      } else {
        cur[part] ??= {};
        cur = cur[part];
      }
    }
  }
  return result;
}

/**
 * Loads the base English translation file, compares it to each target language file,
 * translates missing or empty keys using Google Translate, and optionally writes them back.
 */
async function translateFile(type: "components" | "platform"): Promise<void> {
  const defaultPath = path.join(localesDir, type, defaultLng, `${ns}.json`);
  const defaultJson = flatten(await loadJsonSafe(defaultPath));

  for (const lng of await getTargetLanguages(type)) {
    if (lng === defaultLng) {
      console.log(`Skipping default language [${lng}].`);
      continue;
    }

    const targetPath = path.join(localesDir, type, lng, `${ns}.json`);
    const targetJson = flatten(await loadJsonSafe(targetPath));

    const cache = new Map<string, string>(
      Object.entries(targetJson).map(([k, v]) => [k.trim(), v])
    );
    const keysToTranslate = Object.keys(defaultJson).filter((key) => {
      const val = cache.get(key.trim());
      return val === undefined || val === "";
    });

    if (keysToTranslate.length === 0) {
      console.log(`✅ No missing translations for [${type}/${lng}].`);
      continue;
    }

    console.log(
      `🔄 Translating ${keysToTranslate.length} keys for [${type}/${lng}]...`
    );

    let successCount = 0;
    let failCount = 0;

    // Allow all translations to attempt.
    // Even if some fail, we still have partial results.
    await Promise.allSettled(
      keysToTranslate.map(async (key) => {
        let english = defaultJson[key];
        const context = extractContextFromKey(key);

        // If context exists, embed it for translation
        if (context) {
          english = embedContextInText(english, context);
        }

        try {
          let translated = await translateText(english, lng);
          // If context was embedded, remove it from the translated text
          if (context) {
            translated = removeEmbeddedContext(translated);
          }
          cache.set(key.trim(), translated);
          successCount++;
          console.log(
            `[${type}/${lng}] ${key}: "${defaultJson[key]}" -> "${translated}"`
          );
        } catch (e) {
          failCount++;
          console.error(`[${lng}] ❌ Failed to translate key "${key}":`, e);
        }
      })
    );

    const finalJson = unflatten(Object.fromEntries(cache));
    if (!isDryRun) {
      await saveJson(targetPath, finalJson);
    }

    console.log(
      `✅ [${type}/${lng}] Done. Translated: ${successCount}, Failed: ${failCount}, Saved to: ${targetPath} ${isDryRun ? "(dry run, not written)" : ""}`
    );
  }
}

// Kick off the translation process
translateFile("components").catch(console.error);
translateFile("platform").catch(console.error);
