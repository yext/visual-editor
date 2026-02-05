import fs from "fs/promises";
import path from "path";

const NAMESPACE = "visual-editor.json";
const ROOT = path.resolve(process.cwd(), "locales");
const PLATFORM_DIR = path.join(ROOT, "platform");
const COMPONENTS_DIR = path.join(ROOT, "components");
const COMPONENTS_EN_PATH = path.join(COMPONENTS_DIR, "en", NAMESPACE);

async function loadJsonSafe(filePath) {
  try {
    return JSON.parse(await fs.readFile(filePath, "utf-8"));
  } catch {
    return {};
  }
}

function flatten(obj, prefix = "") {
  const result = {};
  for (const key of Object.keys(obj)) {
    const value = obj[key];
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value && typeof value === "object" && !Array.isArray(value)) {
      Object.assign(result, flatten(value, fullKey));
    } else {
      result[fullKey] = String(value ?? "");
    }
  }
  return result;
}

function unflatten(flat) {
  const result = {};
  for (const key of Object.keys(flat)) {
    const parts = key.split(".");
    let cursor = result;
    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === parts.length - 1) {
        cursor[part] = flat[key];
      } else {
        cursor[part] ??= {};
        cursor = cursor[part];
      }
    }
  }
  return result;
}

function sortObject(obj) {
  if (!obj || typeof obj !== "object" || Array.isArray(obj)) {
    return obj;
  }

  return Object.keys(obj)
    .sort()
    .reduce((acc, key) => {
      acc[key] = sortObject(obj[key]);
      return acc;
    }, {});
}

async function getLocales(baseDir) {
  const entries = await fs.readdir(baseDir, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
}

async function propagateLocale(locale, allowedKeys) {
  const platformPath = path.join(PLATFORM_DIR, locale, NAMESPACE);
  const componentsPath = path.join(COMPONENTS_DIR, locale, NAMESPACE);

  const platformFlat = flatten(await loadJsonSafe(platformPath));
  const existingComponentsFlat = flatten(await loadJsonSafe(componentsPath));
  const nextComponentsFlat = {};

  for (const key of allowedKeys) {
    if (platformFlat[key] !== undefined) {
      nextComponentsFlat[key] = platformFlat[key];
    } else {
      nextComponentsFlat[key] = existingComponentsFlat[key] ?? "";
      console.warn(
        `[${locale}] Missing key "${key}" in platform. Preserving existing components value.`
      );
    }
  }

  const sorted = sortObject(unflatten(nextComponentsFlat));
  await fs.mkdir(path.dirname(componentsPath), { recursive: true });
  await fs.writeFile(
    componentsPath,
    `${JSON.stringify(sorted, null, 2)}\n`,
    "utf-8"
  );
  console.log(`Synced components locale from platform: ${locale}`);
}

async function run() {
  const componentsEn = flatten(await loadJsonSafe(COMPONENTS_EN_PATH));
  const allowedKeys = Object.keys(componentsEn);

  if (allowedKeys.length === 0) {
    throw new Error(
      `No keys found in ${COMPONENTS_EN_PATH}. Run extraction before propagation.`
    );
  }

  const locales = await getLocales(PLATFORM_DIR);
  for (const locale of locales) {
    await propagateLocale(locale, allowedKeys);
  }
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
