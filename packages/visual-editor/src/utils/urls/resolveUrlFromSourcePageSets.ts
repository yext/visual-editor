import {
  LocatorSourcePageSetInfo,
  StreamDocument,
} from "../types/StreamDocument.ts";
import { resolveUrlFromPathInfo } from "./resolveUrlFromPathInfo.ts";
import { mergeMeta } from "./resolveUrlTemplate.ts";

/**
 * Resolves the URL for an entity in the search API response using the URL template of the
 * source page set that contains the entity. Source page sets are read from the
 * __.locatorSourcePageSets field of the stream document.
 */
export function resolveUrlFromSourcePageSets(
  profile: any,
  streamDocument: StreamDocument,
  relativePrefixToRoot: string = ""
) {
  const sourcePageSetsString = streamDocument?.__?.locatorSourcePageSets;
  if (!sourcePageSetsString) {
    return;
  }
  let sourcePageSets: LocatorSourcePageSetInfo[];
  try {
    sourcePageSets = Object.values(JSON.parse(sourcePageSetsString));
  } catch (error) {
    console.error("Failed to parse locatorSourcePageSets:", error);
    return;
  }

  const entityTypeApiName = profile?.type;
  if (!sourcePageSets || sourcePageSets.length === 0 || !entityTypeApiName) {
    return;
  }
  // contains the internal saved search IDs that apply to the entity; if no saved search IDs
  // apply, the property is not included in the search response
  const savedFiltersForEntity: string[] = profile?.savedFilters ?? [];

  console.log(
    "sourcePageSets",
    sourcePageSets,
    "savedFiltersForEntity",
    savedFiltersForEntity
  );
  const sourceEntityPageSet = sourcePageSets.find(
    (pageSetInfo: LocatorSourcePageSetInfo) =>
      pageSetIncludesEntity(
        savedFiltersForEntity,
        entityTypeApiName,
        pageSetInfo
      )
  );
  if (!sourceEntityPageSet || !sourceEntityPageSet?.pathInfo) {
    return;
  }

  const docWithPathInfo = {
    ...streamDocument,
    __: {
      ...streamDocument.__,
      pathInfo: sourceEntityPageSet.pathInfo,
    },
  };
  return resolveUrlFromPathInfo(
    mergeMeta(profile, docWithPathInfo),
    relativePrefixToRoot,
    false
  );
}

/** Returns true if the entity type scope includes the entity. */
const pageSetIncludesEntity = (
  savedFiltersForEntity: string[],
  entityTypeApiName: string,
  pageSetInfo: LocatorSourcePageSetInfo
): boolean => {
  return (
    pageSetInfo?.entityType === entityTypeApiName &&
    // savedFilter is not present => scope includes all entities of this type
    // savedFilter is present => entity's savedFilterIds must contain the scope's savedFilter
    (!pageSetInfo?.internalSavedFilterId ||
      savedFiltersForEntity.includes(
        pageSetInfo.internalSavedFilterId.toString()
      ))
  );
};
