/**
 * Transforms a locale into BCP-47 language format, e.g., "zh-Hans-HK"
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
    .join("-")
    .trim();
}

/**
 * Safely transforms all "locale" and "locales" fields in an object to BCP-47 format.
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
        result[key] = value.map((v) =>
          typeof v === "string" ? normalizeLocale(v) : v
        );
      } else if (typeof value === "string" && looksLikeJson(value)) {
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

/**
 * Returns parsed JSON or undefined.
 */
function tryParseJSON(str: string): any | undefined {
  try {
    return JSON.parse(str);
  } catch {
    return undefined;
  }
}

/**
 * Normalizes any locales inside a JSON string, if it's an object or array.
 */
function tryNormalizeLocalesInString(str: string): string {
  const parsed = tryParseJSON(str);
  if (parsed && (Array.isArray(parsed) || typeof parsed === "object")) {
    const normalized = normalizeLocalesInObject(parsed);
    return JSON.stringify(normalized);
  }
  return str;
}

/**
 * Returns true if a string looks like a JSON object or array.
 */
function looksLikeJson(str: string): boolean {
  const trimmed = str.trim();
  return (
    (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
    (trimmed.startsWith("[") && trimmed.endsWith("]"))
  );
}
