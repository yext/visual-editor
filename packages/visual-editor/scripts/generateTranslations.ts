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
interface GoogleTranslateResponse {
  translations: TranslationSegment[];
  additionalData?: unknown;
  detectedSourceLang: string;
}

/**
 * Reads all directories under localesDir and returns them as target languages.
 */
async function getTargetLanguages(): Promise<string[]> {
  const entries = await fs.readdir(localesDir, { withFileTypes: true });
  // Filter directories only
  return entries.filter((entry) => entry.isDirectory()).map((dir) => dir.name);
}

const snakeToKebab = (s: string) => s.replace("_", "-");

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
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${defaultLng}&tl=${snakeToKebab(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(`Google Translate API error: ${res.status}`);
  }

  // The response is an array, where the first element is an array of segments
  const data: GoogleTranslateResponse =
    (await res.json()) as GoogleTranslateResponse;

  const translations = data.translations; // array of segments: [translatedText, originalText, ...]
  if (!translations || !Array.isArray(translations)) {
    throw new Error(
      `No translation received for text=${text} language=${targetLang}`
    );
  }

  // Concatenate all translated segment texts
  const translatedText = translations
    .map((segment: TranslationSegment) => segment[0]) // segment[0] is the translated text for that segment
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
async function translateFile(): Promise<void> {
  const defaultPath = path.join(localesDir, defaultLng, `${ns}.json`);
  const defaultJson = flatten(await loadJsonSafe(defaultPath));

  for (const lng of await getTargetLanguages()) {
    const targetPath = path.join(localesDir, lng, `${ns}.json`);
    const targetJson = flatten(await loadJsonSafe(targetPath));

    const cache = new Map<string, string>(
      Object.entries(targetJson).map(([k, v]) => [k.trim(), v])
    );
    const keysToTranslate = Object.keys(defaultJson).filter((key) => {
      const val = cache.get(key.trim());
      return val === undefined || val === "";
    });

    if (keysToTranslate.length === 0) {
      console.log(`✅ No missing translations for [${lng}].`);
      continue;
    }

    console.log(
      `🔄 Translating ${keysToTranslate.length} keys for [${lng}]...`
    );

    let successCount = 0;
    let failCount = 0;

    const translateTasks = keysToTranslate.map(async (key) => {
      const english = defaultJson[key];
      try {
        const translated = await translateText(english, lng);
        cache.set(key.trim(), translated);
        successCount++;
        console.log(`[${lng}] ${key}: "${english}" → "${translated}"`);
      } catch (e) {
        failCount++;
        console.error(`[${lng}] ❌ Failed to translate key "${key}":`, e);
      }
    });

    await Promise.all(translateTasks);

    const finalJson = unflatten(Object.fromEntries(cache));
    if (!isDryRun) {
      await saveJson(targetPath, finalJson);
    }

    console.log(
      `✅ [${lng}] Done. Translated: ${successCount}, Failed: ${failCount}, Saved to: ${targetPath} ${isDryRun ? "(dry run, not written)" : ""}`
    );
  }
}

// Kick off the translation process
translateFile().catch(console.error);
