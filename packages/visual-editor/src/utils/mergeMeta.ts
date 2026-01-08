/**
 * Merges a profile object with meta fields from the streamDocument such as __, _pageset, and locale.

 * @param {Object} profile
 * @param {Object} streamDocument
 * @returns {Object}
 */
export function mergeMeta(profile: any, streamDocument: any): any {
  const locale: string = profile?.meta?.locale || streamDocument?.locale;

  // Get primaryLocale from pageset config, defaulting to "en" for backward compatibility
  const pagesetJson =
    typeof streamDocument?._pageset === "string"
      ? JSON.parse(streamDocument._pageset || "{}")
      : streamDocument?._pageset || {};
  const pagesetConfig = pagesetJson?.config || {};
  // Prioritize pageset config primaryLocale, then fall back to legacy profile.meta.isPrimaryLocale
  const isPrimaryLocale =
    locale === pagesetConfig?.primaryLocale || profile?.meta?.isPrimaryLocale;

  return {
    locale: locale,
    ...profile,
    meta: {
      ...streamDocument?.meta,
      ...profile?.meta,
    },
    __: {
      ...streamDocument.__,
      ...profile.__,
      isPrimaryLocale: isPrimaryLocale,
    },
    _pageset: streamDocument._pageset,
  };
}
