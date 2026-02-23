import { StreamDocument } from "../types/StreamDocument.ts";
import { resolveBreadcrumbsFromDirectory } from "./resolveBreadcrumbsFromDirectory.ts";
import {
  resolveBreadcrumbsFromPathInfo,
  BreadcrumbLink,
} from "./resolveBreadcrumbsFromPathInfo.ts";

type BreadcrumbResolver = (
  streamDocument: StreamDocument
) => BreadcrumbLink[] | undefined;

const resolvers: BreadcrumbResolver[] = [
  (streamDocument) => resolveBreadcrumbsFromPathInfo(streamDocument),
  (streamDocument) => resolveBreadcrumbsFromDirectory(streamDocument),
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
