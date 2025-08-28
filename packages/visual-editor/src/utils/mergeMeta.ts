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
