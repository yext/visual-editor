import fs from "fs/promises";
import fetch from "node-fetch";
import pLimit from "p-limit";

const defaultLng = "en";

// languages codes from Yext account settings
const targetLngs = [
  "zh_CN",
  "zh_TW",
  "hr_HR",
  "cs_CZ",
  "da_DK",
  "nl",
  "en_GB",
  "en_US",
  "et_EE",
  "fi_FI",
  "fr_FR",
  "de_DE",
  "hu_HU",
  "it_IT",
  "ja_JP",
  "lv_LV",
  "lt_LT",
  "nb_NO",
  "pl_PL",
  "pt_PT",
  "ro_RO",
  "sk_SK",
  "es_ES",
  "sv_SE",
  "tr_TR",
];

// translates Yext locales to Google translate compatible locales
const localeToGoogleTranslateMap = {
  zh_CN: "zh-CN",
  zh_TW: "zh-TW",
  hr_HR: "hr",
  cs_CZ: "cs",
  da_DK: "da",
  nl: "nl",
  en_GB: "en",
  en_US: "en",
  et_EE: "et",
  fi_FI: "fi",
  fr_FR: "fr",
  de_DE: "de",
  hu_HU: "hu",
  it_IT: "it",
  ja_JP: "ja",
  lv_LV: "lv",
  lt_LT: "lt",
  nb_NO: "no",
  pl_PL: "pl",
  pt_PT: "pt",
  ro_RO: "ro",
  sk_SK: "sk",
  es_ES: "es",
  sv_SE: "sv",
  tr_TR: "tr",
};

function toGoogleTranslateLang(locale) {
  return localeToGoogleTranslateMap[locale] || locale.split("_")[0];
}

const ns = "translation";
const localesDir = "./locales";

// concurrency limit for simultaneous API calls
const CONCURRENCY_LIMIT = 5;

async function translateText(text, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${defaultLng}&tl=${toGoogleTranslateLang(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data = await res.json();
  return data?.[0]?.[0]?.[0] || text;
}

async function loadJsonSafe(path) {
  try {
    const raw = await fs.readFile(path, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveJson(path, data) {
  await fs.mkdir(path.substring(0, path.lastIndexOf("/")), { recursive: true });
  await fs.writeFile(path, JSON.stringify(data, null, 2), "utf-8");
}

async function translateFile() {
  // Load default language translations
  const defaultPath = `${localesDir}/${defaultLng}/${ns}.json`;
  const defaultJson = await loadJsonSafe(defaultPath);

  // For each target language
  for (const lng of targetLngs) {
    const targetPath = `${localesDir}/${lng}/${ns}.json`;
    const targetJson = await loadJsonSafe(targetPath);

    // Use a cache map for quick lookup (normalize keys with trim)
    const cache = new Map(
      Object.entries(targetJson).map(([k, v]) => [k.trim(), v])
    );

    // Prepare tasks for missing or empty translations
    const keysToTranslate = Object.keys(defaultJson).filter((key) => {
      const val = cache.get(key.trim());
      return !val || val === "";
    });

    if (keysToTranslate.length === 0) {
      console.log(`No missing translations for [${lng}]. Skipping.`);
      continue;
    }

    console.log(`Translating ${keysToTranslate.length} keys for [${lng}]...`);

    const limit = pLimit(CONCURRENCY_LIMIT);

    const translateTasks = keysToTranslate.map((key) =>
      limit(async () => {
        const english = defaultJson[key];
        try {
          const translated = await translateText(english, lng);
          cache.set(key.trim(), translated);
          console.log(`[${lng}] ${key} → ${translated}`);
        } catch (e) {
          console.error(`[${lng}] Failed to translate key "${key}":`, e);
          // fallback to english on error
          cache.set(key.trim(), english);
        }
      })
    );

    // Await all translations with concurrency limit
    await Promise.all(translateTasks);

    // Write back updated translations
    const finalJson = {};
    for (const [key, val] of cache.entries()) {
      finalJson[key] = val;
    }
    await saveJson(targetPath, finalJson);
    console.log(`✅ Saved translations for [${lng}] to ${targetPath}`);
  }
}

translateFile().catch(console.error);
