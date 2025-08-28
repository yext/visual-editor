/**
 * Merges a profile object with meta fields from the streamDocument such as __, _pageset, and locale.

 * @param {Object} profile
 * @param {Object} streamDocument
 * @returns {Object}
 */
export function mergeMeta(profile: any, streamDocument: any): any {
  return {
    locale: streamDocument?.locale,
    ...profile,
    meta: {
      ...streamDocument?.meta,
      ...profile?.meta,
    },
    __: {
      ...streamDocument.__,
      ...profile.__,
    },
    _pageset: streamDocument._pageset,
  };
}
