const pluralSuffixes = new Set(["zero", "one", "two", "few", "many", "other"]);

export const getPluralBase = (key: string): string | undefined => {
  const separator = key.lastIndexOf("_");
  if (separator === -1 || !pluralSuffixes.has(key.slice(separator + 1))) {
    return undefined;
  }
  return key.slice(0, separator);
};

export const expandKeysForLocale = (
  sourceKeys: string[],
  locale: string
): Set<string> => {
  const pluralBases = new Set(
    sourceKeys.map(getPluralBase).filter((key): key is string => Boolean(key))
  );
  const result = new Set(sourceKeys.filter((key) => !getPluralBase(key)));
  const categories = new Intl.PluralRules(locale).resolvedOptions()
    .pluralCategories;
  for (const base of pluralBases) {
    for (const category of categories) {
      result.add(`${base}_${category}`);
    }
  }
  return result;
};

export const findSourceValue = (
  key: string,
  source: Record<string, string>
): string | undefined => {
  if (source[key] !== undefined) {
    return source[key];
  }
  const base = getPluralBase(key);
  if (!base) {
    return undefined;
  }
  return source[`${base}_other`] ?? source[`${base}_one`] ?? source[base];
};
