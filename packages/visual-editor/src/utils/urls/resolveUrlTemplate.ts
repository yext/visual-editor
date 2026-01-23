import { normalizeLocalesInObject } from "../normalizeLocale";
import { StreamDocument } from "../types/StreamDocument";
import { getLocationPath, LocationDocument } from "./getLocationPath";
import { resolveUrlFromPathInfo } from "./resolveUrlFromPathInfo";
import {
  legacyResolveUrlTemplate,
  legacyResolveUrlTemplateOfChild,
} from "./legacyResolveUrlTemplate";

type urlResolverProps = {
  streamDocument: StreamDocument;
  relativePrefixToRoot: string;
};

// Order of resolvers to attempt for resolving the PageSet's url
// 1. resolveUrlFromPathInfo
// 2. legacyResolveUrlTemplate
// 3. getLocationPath
const resolvers: Array<
  ({
    streamDocument,
    relativePrefixToRoot,
  }: urlResolverProps) => string | undefined
> = [
  ({ streamDocument, relativePrefixToRoot }) =>
    resolveUrlFromPathInfo(streamDocument, relativePrefixToRoot),
  ({ streamDocument, relativePrefixToRoot }) =>
    legacyResolveUrlTemplate(streamDocument, relativePrefixToRoot),
  ({ streamDocument, relativePrefixToRoot }) =>
    getLocationPath(streamDocument as LocationDocument, relativePrefixToRoot),
];

// Resolves the URL for a PageSet entity using new or legacy methods
export const resolveUrlTemplate = (
  streamDocument: StreamDocument,
  relativePrefixToRoot: string
): string => {
  streamDocument = normalizeLocalesInObject(streamDocument);

  for (const resolve of resolvers) {
    try {
      const result = resolve({
        streamDocument,
        relativePrefixToRoot,
      });
      if (result) {
        return result;
      }
    } catch {
      // Continue to the next resolver in the array
    }
  }
  throw new Error("Could not resolve url.");
};

const childResolvers: Array<
  ({
    streamDocument,
    relativePrefixToRoot,
  }: urlResolverProps) => string | undefined
> = [
  ({ streamDocument, relativePrefixToRoot }) =>
    resolveUrlFromPathInfo(streamDocument, relativePrefixToRoot),
  ({ streamDocument, relativePrefixToRoot }) =>
    legacyResolveUrlTemplateOfChild(streamDocument, relativePrefixToRoot),
];

// Resolves the URL for a PageSet's child using new or legacy methods
export const resolveUrlTemplateOfChild = (
  profile: any,
  streamDocument: StreamDocument,
  relativePrefixToRoot?: string
): string => {
  // Merge the child profile with streamDocument metadata
  streamDocument = mergeMeta(profile, streamDocument);
  streamDocument = normalizeLocalesInObject(streamDocument);

  for (const resolve of childResolvers) {
    try {
      const result = resolve({
        streamDocument,
        relativePrefixToRoot: relativePrefixToRoot ?? "",
      });
      if (result) {
        return result;
      }
    } catch {
      // Continue to the next resolver in the array
    }
  }

  throw new Error("Could not resolve url for child entity.");
};

export const mergeMeta = (
  profile: any,
  streamDocument: StreamDocument
): StreamDocument => {
  const locale: string = profile?.meta?.locale || streamDocument?.locale;

  // Determine isPrimaryLocale value, prioritizing profile meta over streamDocument
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
      isPrimaryLocale, // deprecated, use pathInfo.primaryLocale instead
    },
    _pageset: streamDocument._pageset,
  };
};
