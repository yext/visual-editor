import path from "path";
import {
  flatten,
  getSubdirectoryNames,
  loadJsonSafe,
  saveJson,
  type FlatTranslations,
  unflatten,
} from "../src/utils/i18n/jsonUtils.ts";

/**
 * Fills missing platform locale values using Google Translate.
 *
 * Behavior:
 * - Reads English source strings from locales/platform/en/visual-editor.json.
 * - Translates only missing/empty keys in non-English platform locale files.
 * - Adds contextual hints to ambiguous keys and removes them after translation.
 * - Preserves nested object JSON shape on disk.
 */
const DEFAULT_LANGUAGE = "en";
const NAMESPACE = "visual-editor";
const LOCALES_DIR = "./locales";
const isDryRun = process.argv.includes("--dry-run");

const CONTEXT_SEPARATOR = "_";
const CONTEXT_MARKER_START = "[[";
const CONTEXT_MARKER_END = "]]";
const PLURAL_SUFFIXES = new Set(["zero", "one", "two", "few", "many", "other"]);
const INTERPOLATION_REGEX = /\{\{\s*([^{}]+?)\s*\}\}/g;

type TranslationType = "platform";

interface MaskedVariable {
  token: string;
  original: string;
}

interface TranslationTarget {
  key: string;
  english: string;
  sourceKey: string;
}

type GoogleTranslationSegment = [translatedText: string, ...rest: unknown[]];
type GoogleTranslateResponse = [GoogleTranslationSegment[], ...rest: unknown[]];

/**
 * Reads and validates the --type argument.
 * This script intentionally supports "platform" only.
 */
const getTypeArg = (): TranslationType => {
  const index = process.argv.findIndex((arg) => arg === "--type");
  const raw = index >= 0 ? process.argv[index + 1] : "platform";

  if (raw !== "platform") {
    throw new Error(
      `Unsupported --type "${raw}". This script only supports "--type platform".`
    );
  }

  return "platform";
};

/**
 * Removes an i18next plural suffix from the final key segment when present.
 */
const stripPluralSuffix = (
  segment: string
): { withoutPlural: string; pluralSuffix: string | null } => {
  const parts = segment.split(CONTEXT_SEPARATOR);
  const last = parts[parts.length - 1];

  if (PLURAL_SUFFIXES.has(last)) {
    return {
      withoutPlural: parts.slice(0, -1).join(CONTEXT_SEPARATOR),
      pluralSuffix: last,
    };
  }

  return { withoutPlural: segment, pluralSuffix: null };
};

/**
 * Returns candidate English fallback keys for locale-specific plural variants.
 * Example:
 * - locationsNear_many -> [locationsNear_other, locationsNear_one, locationsNear]
 */
const getPluralFallbackCandidates = (key: string): string[] => {
  const parts = key.split(".");
  const leaf = parts[parts.length - 1];
  const { withoutPlural, pluralSuffix } = stripPluralSuffix(leaf);

  if (!pluralSuffix) {
    return [];
  }

  const leafCandidates = [
    `${withoutPlural}_other`,
    `${withoutPlural}_one`,
    withoutPlural,
  ];
  const seen = new Set<string>();
  const candidates: string[] = [];

  for (const leafCandidate of leafCandidates) {
    const candidate = [...parts.slice(0, -1), leafCandidate].join(".");
    if (!seen.has(candidate) && candidate !== key) {
      seen.add(candidate);
      candidates.push(candidate);
    }
  }

  return candidates;
};

/**
 * Resolves the English source text for a translation key.
 * For locale-specific plural keys not present in English, falls back to the
 * same key family in English (prefer *_other, then *_one, then base).
 */
const resolveEnglishSource = (
  key: string,
  defaultJson: FlatTranslations
): { sourceKey: string; english: string } | null => {
  if (defaultJson[key] !== undefined) {
    return { sourceKey: key, english: defaultJson[key] };
  }

  for (const candidate of getPluralFallbackCandidates(key)) {
    if (defaultJson[candidate] !== undefined) {
      return { sourceKey: candidate, english: defaultJson[candidate] };
    }
  }

  return null;
};

/**
 * Attempts to infer semantic context from a key suffix.
 * Example: fields.options.left_direction -> "direction".
 * Plural suffixes are excluded from context inference.
 */
const extractContextFromKey = (
  key: string,
  allDefaultKeys: Set<string>
): string | null => {
  const parts = key.split(".");
  const leaf = parts[parts.length - 1];
  const { withoutPlural } = stripPluralSuffix(leaf);

  if (!withoutPlural.includes(CONTEXT_SEPARATOR)) {
    return null;
  }

  const leafParts = withoutPlural.split(CONTEXT_SEPARATOR);

  for (let i = leafParts.length - 1; i >= 1; i -= 1) {
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
};

/**
 * Appends a context marker that is passed to machine translation.
 */
const embedContextInText = (text: string, context: string): string => {
  return `${text} ${CONTEXT_MARKER_START}context: ${context}${CONTEXT_MARKER_END}`;
};

/**
 * Removes translation-time context markers from translated output.
 */
const removeEmbeddedContext = (text: string): string => {
  return text.replace(/\s*\[\[\s*context:\s*[\s\S]*?\]\]/gi, "").trim();
};

/**
 * Replaces interpolation placeholders with stable sentinel tokens before MT.
 * This reduces the chance providers translate variable names.
 */
const maskInterpolationVariables = (
  text: string
): { maskedText: string; variables: MaskedVariable[] } => {
  let index = 0;
  const variables: MaskedVariable[] = [];
  const maskedText = text.replace(INTERPOLATION_REGEX, (match) => {
    const token = `__I18N_VAR_${index}__`;
    variables.push({ token, original: match });
    index += 1;
    return token;
  });

  return { maskedText, variables };
};

/**
 * Restores original interpolation placeholders after MT.
 */
const unmaskInterpolationVariables = (
  text: string,
  variables: MaskedVariable[]
): string => {
  let output = text;
  for (const { token, original } of variables) {
    output = output.replaceAll(token, original);
  }
  return output;
};

/**
 * Lists locale folders under locales/<type>.
 */
const getTargetLanguages = async (type: TranslationType): Promise<string[]> => {
  const dir = path.join(LOCALES_DIR, type);
  const entries = await getSubdirectoryNames(dir, { suppressMissing: true });

  if (entries.length === 0) {
    console.warn(
      `Skipping missing or empty locales directory for ${type} at ${dir}.`
    );
  }

  return entries;
};

/**
 * Translates a single string from English to a target language via Google.
 */
const translateText = async (
  text: string,
  targetLang: string
): Promise<string> => {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${DEFAULT_LANGUAGE}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(
      `Google Translate API error: ${response.status} for text: "${text}"`
    );
  }

  const data = (await response.json()) as GoogleTranslateResponse;
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
};

/**
 * Translates missing keys for all non-primary locales of a translation type.
 */
const translateFile = async (type: TranslationType): Promise<void> => {
  const defaultPath = path.join(
    LOCALES_DIR,
    type,
    DEFAULT_LANGUAGE,
    `${NAMESPACE}.json`
  );
  const defaultJson = flatten(await loadJsonSafe(defaultPath));
  const defaultKeySet = new Set(Object.keys(defaultJson));

  for (const locale of await getTargetLanguages(type)) {
    if (locale === DEFAULT_LANGUAGE) {
      console.log(`Skipping default language [${locale}].`);
      continue;
    }

    const targetPath = path.join(
      LOCALES_DIR,
      type,
      locale,
      `${NAMESPACE}.json`
    );
    const targetJson = flatten(await loadJsonSafe(targetPath));

    const cache = new Map<string, string>(
      Object.entries(targetJson).map(([key, value]) => [key.trim(), value])
    );
    const candidateKeys = new Set<string>([
      ...Object.keys(defaultJson),
      ...Object.keys(targetJson),
    ]);
    const translationTargets: TranslationTarget[] = [];

    for (const key of candidateKeys) {
      const value = cache.get(key.trim());
      if (value !== undefined && value !== "") {
        continue;
      }

      const source = resolveEnglishSource(key, defaultJson);
      if (!source || source.english.trim() === "") {
        continue;
      }

      translationTargets.push({
        key,
        english: source.english,
        sourceKey: source.sourceKey,
      });
    }

    if (translationTargets.length === 0) {
      console.log(`No missing translations for [${type}/${locale}].`);
      continue;
    }

    console.log(
      `Translating ${translationTargets.length} keys for [${type}/${locale}]...`
    );

    let successCount = 0;
    let failCount = 0;

    await Promise.allSettled(
      translationTargets.map(async ({ key, english, sourceKey }) => {
        const { maskedText, variables } = maskInterpolationVariables(english);
        let translationInput = maskedText;
        const context = extractContextFromKey(key, defaultKeySet);

        if (context) {
          translationInput = embedContextInText(translationInput, context);
        }

        try {
          let translated = await translateText(translationInput, locale);
          if (context) {
            translated = removeEmbeddedContext(translated);
          }
          translated = unmaskInterpolationVariables(translated, variables);

          cache.set(key.trim(), translated);
          successCount += 1;
          console.log(
            `[${type}/${locale}] ${key} (source: ${sourceKey}): "${english}" -> "${translated}"`
          );
        } catch (error) {
          failCount += 1;
          console.error(`[${locale}] Failed to translate key "${key}":`, error);
        }
      })
    );

    const finalJson = unflatten(Object.fromEntries(cache) as FlatTranslations);
    if (!isDryRun) {
      await saveJson(targetPath, finalJson);
    }

    console.log(
      `[${type}/${locale}] Done. Translated: ${successCount}, Failed: ${failCount}, Saved to: ${targetPath} ${isDryRun ? "(dry run, not written)" : ""}`
    );
  }
};

/**
 * Script entrypoint.
 */
const type = getTypeArg();
translateFile(type).catch((error) => {
  console.error(error);
  process.exit(1);
});
