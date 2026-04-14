import { StreamDocument } from "../types/StreamDocument.ts";
import { resolveBreadcrumbsFromDirectory } from "./resolveBreadcrumbsFromDirectory.ts";
import { resolveBreadcrumbsFromPathInfo } from "./resolveBreadcrumbsFromPathInfo.ts";

export type BreadcrumbLink = {
  /** The display name of the DM parent. */
  name: string;
  /** The relative url path to the DM parent. */
  slug: string;
};

type BreadcrumbResolver = (
  streamDocument: StreamDocument
) => BreadcrumbLink[] | undefined;

const resolvers: BreadcrumbResolver[] = [
  (streamDocument) => resolveBreadcrumbsFromPathInfo(streamDocument),
  (streamDocument) => resolveBreadcrumbsFromDirectory(streamDocument),
];

/**
 * Reads the first valid dm_directoryParents field from the stream document.
 * Extracts the parents' display name and resolves the url path based on pathInfo (with dm slug fallback).
 */
export const resolveBreadcrumbs = (
  streamDocument: StreamDocument
): BreadcrumbLink[] => {
  for (const resolve of resolvers) {
    try {
      const result = resolve(streamDocument);
      if (result && result.length) {
        return result;
      }
    } catch {
      // continue to next resolver
    }
  }
  return [];
};
