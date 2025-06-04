import fs from "fs/promises";
import path from "path";
import pLimit from "p-limit";

const defaultLng = "en";
const ns = "visual-editor";
const localesDir = "./locales";
const CONCURRENCY_LIMIT = 5;

const isDryRun = process.argv.includes("--dry-run");

const targetLngs: string[] = [
  "zh_CN",
  "zh_TW",
  "hr_HR",
  "cs_CZ",
  "da_DK",
  "nl",
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

const localeToGoogleTranslateMap: Record<string, string> = {
  zh_CN: "zh-CN",
  zh_TW: "zh-TW",
  hr_HR: "hr",
  cs_CZ: "cs",
  da_DK: "da",
  nl: "nl",
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

function toGoogleTranslateLang(locale: string): string {
  return localeToGoogleTranslateMap[locale] || locale.split("_")[0];
}

async function translateText(
  text: string,
  targetLang: string
): Promise<string> {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${defaultLng}&tl=${toGoogleTranslateLang(targetLang)}&dt=t&q=${encodeURIComponent(text)}`;
  const res = await fetch(url);
  const data: any = await res.json();
  return data?.[0]?.[0]?.[0] || text;
}

async function loadJsonSafe(filePath: string): Promise<Record<string, any>> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

async function saveJson(
  filePath: string,
  data: Record<string, string>
): Promise<void> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2), "utf-8");
}

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

async function translateFile(): Promise<void> {
  const defaultPath = path.join(localesDir, defaultLng, `${ns}.json`);
  const defaultJson = flatten(await loadJsonSafe(defaultPath));

  for (const lng of targetLngs) {
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

    const limit = pLimit(CONCURRENCY_LIMIT);
    let successCount = 0;
    let failCount = 0;

    const translateTasks = keysToTranslate.map((key) =>
      limit(async () => {
        const english = defaultJson[key];
        try {
          const translated = await translateText(english, lng);
          cache.set(key.trim(), translated);
          successCount++;
          console.log(`[${lng}] ${key}: "${english}" → "${translated}"`);
        } catch (e) {
          failCount++;
          console.error(`[${lng}] ❌ Failed to translate key "${key}":`, e);
          cache.set(key.trim(), english); // fallback to English
        }
      })
    );

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

translateFile().catch(console.error);
