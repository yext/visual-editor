import { StreamDocument } from "./applyTheme.ts";
import { getIsPrimaryLocale, getPageSetConfig } from "./pageset.ts";

/**
 * Merges a profile object with meta fields from the streamDocument such as __, _pageset, and locale.

 * @param {Object} profile
 * @param {Object} streamDocument
 * @returns {Object}
 */
export function mergeMeta(profile: any, streamDocument: StreamDocument): any {
  const locale: string = profile?.meta?.locale || streamDocument?.locale;

  const pageSetConfig = getPageSetConfig(streamDocument?._pageset);
  const fallbackIsPrimaryLocale = streamDocument.__?.isPrimaryLocale;
  const isPrimaryLocale = getIsPrimaryLocale({
    locale,
    pageSetConfig,
    fallbackIsPrimaryLocale,
  });

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
