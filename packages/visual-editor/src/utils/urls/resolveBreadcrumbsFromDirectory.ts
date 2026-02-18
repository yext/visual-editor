import { getDirectoryParents } from "../schema/helpers.ts";
import { StreamDocument } from "../types/StreamDocument.ts";
import { BreadcrumbLink } from "./resolveBreadcrumbsFromPathInfo.ts";

export const resolveBreadcrumbsFromDirectory = (
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
