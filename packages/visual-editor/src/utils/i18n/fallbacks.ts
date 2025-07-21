type Fallback = {
  from: string;
  to: string;
};

export const defaultI18nFallbacks: Fallback[] = [
  {
    from: "zh-Hans",
    to: "zh",
  },
  {
    from: "zh-Hant",
    to: "zh-TW",
  },
];

/**
 * Applies language fallbacks to i18n resources
 * ex: "zh-Hans" to "zh" and "zh-Hant" to "zh-TW"
 *
 * These fallbacks occur BEFORE fallbackLng in
 * i18n configuration
 * @param resources the resources to modify
 * @param fallbacks map of fallback languages
 */
export const applyI18nFallbacks = (
  resources: Record<string, any>,
  fallbacks: Fallback[]
) => {
  fallbacks.forEach(({ from, to }: Fallback) => {
    if (!!resources[from]) {
      return;
    }
    if (!resources[to]) {
      return;
    }
    resources[from] = resources[to];
  });
};
