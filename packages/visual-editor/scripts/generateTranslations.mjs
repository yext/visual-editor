import fs from "fs/promises";
import path from "path";

/**
 * Fills missing platform locale values using Google Translate.
 *
 * Behavior:
 * - Reads English source strings from locales/platform/en/visual-editor.json.
 * - Translates only missing/empty keys in non-English platform locale files.
 * - Adds contextual hints to ambiguous keys and removes them after translation.
 * - Preserves nested object JSON shape on disk.
 */
const defaultLng = "en";
const ns = "visual-editor";
const localesDir = "./locales";
const isDryRun = process.argv.includes("--dry-run");

const CONTEXT_SEPARATOR = "_";
const CONTEXT_MARKER_START = "[[";
const CONTEXT_MARKER_END = "]]";
const PLURAL_SUFFIXES = new Set(["zero", "one", "two", "few", "many", "other"]);
const INTERPOLATION_REGEX = /\{\{\s*([^{}]+?)\s*\}\}/g;

/**
 * Reads and validates the --type argument.
 * This script intentionally supports "platform" only.
 */
function getTypeArg() {
  const index = process.argv.findIndex((arg) => arg === "--type");
  const raw = index >= 0 ? process.argv[index + 1] : "platform";

  if (raw !== "platform") {
    throw new Error(
      `Unsupported --type "${raw}". This script only supports "--type platform".`
    );
  }

  return "platform";
}

/**
 * Removes an i18next plural suffix from the final key segment when present.
 */
function stripPluralSuffix(segment) {
  const parts = segment.split(CONTEXT_SEPARATOR);
  const last = parts[parts.length - 1];

  if (PLURAL_SUFFIXES.has(last)) {
    return {
      withoutPlural: parts.slice(0, -1).join(CONTEXT_SEPARATOR),
      pluralSuffix: last,
    };
  }

  return { withoutPlural: segment, pluralSuffix: null };
}

/**
 * Attempts to infer semantic context from a key suffix.
 * Example: fields.options.left_direction -> "direction".
 * Plural suffixes are excluded from context inference.
 */
function extractContextFromKey(key, allDefaultKeys) {
  const parts = key.split(".");
  const leaf = parts[parts.length - 1];
  const { withoutPlural } = stripPluralSuffix(leaf);

  if (!withoutPlural.includes(CONTEXT_SEPARATOR)) {
    return null;
  }

  const leafParts = withoutPlural.split(CONTEXT_SEPARATOR);

  for (let i = leafParts.length - 1; i >= 1; i--) {
    const baseLeaf = leafParts.slice(0, i).join(CONTEXT_SEPARATOR);
    const contextSuffix = leafParts.slice(i).join(CONTEXT_SEPARATOR);
    const baseKey = [...parts.slice(0, -1), baseLeaf].join(".");

    if (allDefaultKeys.has(baseKey)) {
      return contextSuffix.replaceAll(CONTEXT_SEPARATOR, " ").trim();
    }
  }

  const fallback = leafParts.slice(1).join(CONTEXT_SEPARATOR).trim();
  if (!fallback || PLURAL_SUFFIXES.has(fallback)) {
    return null;
  }

  return fallback.replaceAll(CONTEXT_SEPARATOR, " ");
}

/**
 * Appends a context marker that is passed to machine translation.
 */
function embedContextInText(text, context) {
  return `${text} ${CONTEXT_MARKER_START}context: ${context}${CONTEXT_MARKER_END}`;
}

/**
 * Removes translation-time context markers from translated output.
 */
function removeEmbeddedContext(text) {
  return text.replace(/\[+.*?\]+/g, "").trim();
}

/**
 * Replaces interpolation placeholders with stable sentinel tokens before MT.
 * This reduces the chance providers translate variable names.
 */
function maskInterpolationVariables(text) {
  let index = 0;
  const variables = [];
  const maskedText = text.replace(INTERPOLATION_REGEX, (match) => {
    const token = `__I18N_VAR_${index}__`;
    variables.push({ token, original: match });
    index += 1;
    return token;
  });

  return { maskedText, variables };
}

/**
 * Restores original interpolation placeholders after MT.
 */
function unmaskInterpolationVariables(text, variables) {
  let output = text;
  for (const { token, original } of variables) {
    output = output.replaceAll(token, original);
  }
  return output;
}

/**
 * Lists locale folders under locales/<type>.
 */
async function getTargetLanguages(type) {
  const dir = path.join(localesDir, type);
  let entries;
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (err) {
    if (err?.code === "ENOENT") {
      console.warn(`Skipping missing locales directory for ${type} at ${dir}.`);
      return [];
    }
    throw err;
  }
  return entries.filter((entry) => entry.isDirectory()).map((dir) => dir.name);
}

/**
 * Translates a single string from English to a target language via Google.
 */
async function translateText(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${defaultLng}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);

  if (!res.ok) {
    throw new Error(
      `Google Translate API error: ${res.status} for text: "${text}"`
    );
  }

  const data = await res.json();
  const translations = data[0];
  if (!translations || !Array.isArray(translations)) {
    throw new Error(
      `No translation received for text=${text} language=${targetLang}`
    );
  }

  const translatedText = translations
    .map(([translated]) => translated)
    .join("");

  return translatedText || text;
}

/**
 * Loads a JSON file and returns {} when missing or invalid.
 */
async function loadJsonSafe(filePath) {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/**
 * Writes JSON with deterministic indentation and trailing newline.
 */
async function saveJson(filePath, data) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

/**
 * Flattens nested objects into dot-delimited key/value pairs.
 */
function flatten(obj, prefix = "") {
  const result = {};
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
 * Rebuilds nested objects from dot-delimited key/value pairs.
 */
function unflatten(obj) {
  const result = {};
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
 * Translates missing keys for all non-primary locales of a translation type.
 */
async function translateFile(type) {
  const defaultPath = path.join(localesDir, type, defaultLng, `${ns}.json`);
  const defaultJson = flatten(await loadJsonSafe(defaultPath));
  const defaultKeySet = new Set(Object.keys(defaultJson));

  for (const lng of await getTargetLanguages(type)) {
    if (lng === defaultLng) {
      console.log(`Skipping default language [${lng}].`);
      continue;
    }

    const targetPath = path.join(localesDir, type, lng, `${ns}.json`);
    const targetJson = flatten(await loadJsonSafe(targetPath));

    const cache = new Map(
      Object.entries(targetJson).map(([k, v]) => [k.trim(), v])
    );
    const keysToTranslate = Object.keys(defaultJson).filter((key) => {
      const val = cache.get(key.trim());
      return val === undefined || val === "";
    });

    if (keysToTranslate.length === 0) {
      console.log(`No missing translations for [${type}/${lng}].`);
      continue;
    }

    console.log(
      `Translating ${keysToTranslate.length} keys for [${type}/${lng}]...`
    );

    let successCount = 0;
    let failCount = 0;

    await Promise.allSettled(
      keysToTranslate.map(async (key) => {
        const english = defaultJson[key];
        const { maskedText, variables } = maskInterpolationVariables(english);
        let translationInput = maskedText;
        const context = extractContextFromKey(key, defaultKeySet);

        if (context) {
          translationInput = embedContextInText(translationInput, context);
        }

        try {
          let translated = await translateText(translationInput, lng);
          if (context) {
            translated = removeEmbeddedContext(translated);
          }
          translated = unmaskInterpolationVariables(translated, variables);
          cache.set(key.trim(), translated);
          successCount++;
          console.log(
            `[${type}/${lng}] ${key}: "${defaultJson[key]}" -> "${translated}"`
          );
        } catch (e) {
          failCount++;
          console.error(`[${lng}] Failed to translate key "${key}":`, e);
        }
      })
    );

    const finalJson = unflatten(Object.fromEntries(cache));
    if (!isDryRun) {
      await saveJson(targetPath, finalJson);
    }

    console.log(
      `[${type}/${lng}] Done. Translated: ${successCount}, Failed: ${failCount}, Saved to: ${targetPath} ${isDryRun ? "(dry run, not written)" : ""}`
    );
  }
}

/**
 * Script entrypoint.
 */
const type = getTypeArg();
translateFile(type).catch((error) => {
  console.error(error);
  process.exit(1);
});
