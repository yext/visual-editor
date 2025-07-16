/**
 * Transforms a locale into BCP-47 language format, ex "zh-Hans-HK"
 * @param locale
 */
export function normalizeLocale(locale: string): string {
  return locale
    .replace(/_/g, "-") // convert underscores to hyphens
    .split("-")
    .map((part, index) => {
      if (index === 0) {
        return part.toLowerCase(); // language
      } else if (part.length === 4) {
        return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(); // script
      } else if (part.length === 2 || part.length === 3) {
        return part.toUpperCase(); // region
      } else {
        return part; // variant or other
      }
    })
    .join("-");
}

/**
 * Transforms all locales in object into a BCP-47 language format, ex "zh-Hans-HK"
 * @param obj
 */
export function normalizeLocalesInObject(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(normalizeLocalesInObject);
  } else if (obj && typeof obj === "object") {
    const result: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (key === "locale" && typeof value === "string") {
        result[key] = normalizeLocale(value);
      } else if (key === "locales" && Array.isArray(value)) {
        result[key] = value.map(normalizeLocale);
      } else if (typeof value === "string") {
        // try parsing as JSON and normalize any locales inside
        result[key] = tryNormalizeLocalesInString(value);
      } else {
        result[key] = normalizeLocalesInObject(value);
      }
    }
    return result;
  } else {
    return obj;
  }
}

function tryParseJSON(str: string): any | undefined {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}

function tryNormalizeLocalesInString(str: string): string {
  const parsed = tryParseJSON(str);
  if (!parsed) return str;

  const normalized = normalizeLocalesInObject(parsed);
  return JSON.stringify(normalized);
}
