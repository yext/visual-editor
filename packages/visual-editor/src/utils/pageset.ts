// based on Config in https://gerrit.yext.com/plugins/gitiles/alpha/+/refs/heads/master/src/com/yext/publish/pagesets/resource.proto#173
export type PageSetConfig = {
  primaryLocale?: string;
  urlTemplate?: {
    primary?: string;
    alternate?: string;
  };
  includeLocalePrefixForPrimaryLocale?: boolean;
  [key: string]: any; // allow any other fields
};

// Parses _pageset (string or object) and returns the config object.
export const getPageSetConfig = (pageset: any): PageSetConfig => {
  const pageSetJson =
    typeof pageset === "string"
      ? JSON.parse(pageset || "{}")
      : (pageset as { config?: PageSetConfig }) || {};
  return pageSetJson?.config || {};
};

// Determines if the locale is primary, falling back if needed.
export const getIsPrimaryLocale = ({
  locale,
  pageSetConfig,
  fallbackIsPrimaryLocale = false,
}: {
  locale?: string;
  pageSetConfig?: PageSetConfig;
  fallbackIsPrimaryLocale?: boolean;
}): boolean => {
  return !!pageSetConfig?.primaryLocale
    ? locale === pageSetConfig.primaryLocale
    : fallbackIsPrimaryLocale;
};

/**
 * Returns the locale prefix based on pageset locale, isPrimaryLocale, and includeLocalePrefixForPrimaryLocale.
 * If the locale is not primary, always includes the locale prefix.
 * If the locale is primary, includes the locale prefix only if includeLocalePrefixForPrimaryLocale is true.
 */
export const getLocalePrefix = ({
  locale,
  isPrimaryLocale,
  includeLocalePrefixForPrimaryLocale,
}: {
  locale: string;
  isPrimaryLocale?: boolean;
  includeLocalePrefixForPrimaryLocale?: boolean;
}): string => {
  return !isPrimaryLocale || includeLocalePrefixForPrimaryLocale
    ? `${locale}/`
    : "";
};
