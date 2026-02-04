import { getDirectoryParents } from "../schema/helpers.ts";
import { StreamDocument } from "../types/StreamDocument.ts";
import {
  resolveBreadcrumbsFromPathInfo,
  BreadcrumbLink,
} from "./resolveBreadcrumbsFromPathInfo.ts";

type BreadcrumbResolver = (
  streamDocument: StreamDocument
) => BreadcrumbLink[] | undefined;

const resolvers: BreadcrumbResolver[] = [
  (streamDocument) => resolveBreadcrumbsFromPathInfo(streamDocument),
  (streamDocument) => buildBreadcrumbsFromDirectory(streamDocument),
];

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

const buildBreadcrumbsFromDirectory = (
  streamDocument: StreamDocument
): BreadcrumbLink[] | undefined => {
  const directoryParents = getDirectoryParents(streamDocument) || [];

  if (directoryParents.length > 0 || streamDocument.dm_directoryChildren) {
    // append the current and filter out missing or malformed data
    const breadcrumbs = [
      ...directoryParents,
      { name: streamDocument.name, slug: "" },
    ].filter((b) => b.name);

    return breadcrumbs.length ? breadcrumbs : undefined;
  }

  return undefined;
};
