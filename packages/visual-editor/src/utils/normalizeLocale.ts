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

export function normalizeLocales(locales?: string[]): string[] | undefined {
  if (!locales) {
    return undefined;
  }
  return locales.map(normalizeLocale);
}
