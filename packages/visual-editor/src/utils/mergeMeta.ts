/**
 * Merges a profile object with meta fields from the streamDocument such as __, _pageset, and locale.

 * @param {Object} profile
 * @param {Object} streamDocument
 * @returns {Object}
 */
export function mergeMeta(profile: any, streamDocument: any): any {
  const locale: string = profile?.meta?.locale || streamDocument?.locale;

  let isPrimaryLocale: boolean;
  if (profile?.meta?.isPrimaryLocale === true) {
    isPrimaryLocale = true;
  } else if (profile?.meta?.isPrimaryLocale === false) {
    isPrimaryLocale = false;
  } else {
    isPrimaryLocale = locale === "en";
  }

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
