import { EntityTypeScope, StreamDocument } from "../types/StreamDocument.ts";
import { resolveUrlFromSourcePageSets } from "./resolveUrlFromSourcePageSets.ts";
import { resolveUrlTemplateOfChild } from "./resolveUrlTemplate.ts";

/**
 * Resolves the URL for a locator result from the stream document.
 */
export function resolveLocatorResultUrl(
  profile: any,
  streamDocument: StreamDocument,
  relativePrefixToRoot: string = ""
) {
  if (streamDocument?.__?.locatorSourcePageSets) {
    return resolveUrlFromSourcePageSets(
      profile,
      streamDocument,
      relativePrefixToRoot
    );
  }
  // if an entity type scope is present but not locatorSourcePageSets, this is a standalone locator
  // without any backing page sets for search results
  if (hasEntityTypeScopes(streamDocument)) {
    return undefined;
  }
  return resolveUrlTemplateOfChild(
    profile,
    streamDocument,
    relativePrefixToRoot
  );
}

/** Returns true if the locator is configured with independent entity type scopes. */
const hasEntityTypeScopes = (document: StreamDocument): boolean => {
  let entityTypeScopes: EntityTypeScope[] | undefined;
  try {
    entityTypeScopes = JSON.parse(document?._pageset ?? "{}")?.typeConfig
      ?.locatorConfig?.entityTypeScope;
  } catch {
    return false;
  }

  if (entityTypeScopes) {
    return entityTypeScopes.length > 0;
  }
  return false;
};
