import { describe, expect, it } from "vitest";
import { resolveDirectoryListChildren } from "./resolveDirectoryListChildren.ts";
import { StreamDocument } from "../types/StreamDocument.ts";

const child = { slug: "us/va" };

const baseDocument: StreamDocument = {
  locale: "en",
  __: {
    pathInfo: {
      primaryLocale: "en",
      breadcrumbPrefix: "locations",
    },
  },
};

describe("resolveDirectoryListChildren", () => {
  it("uses pathInfo locale and breadcrumb prefix for primary locale when configured", () => {
    const documentWithPathInfo: StreamDocument = {
      ...baseDocument,
      __: {
        pathInfo: {
          ...baseDocument.__?.pathInfo,
          includeLocalePrefixForPrimaryLocale: true,
        },
      },
    };

    expect(resolveDirectoryListChildren(documentWithPathInfo, child)).toBe(
      "en/locations/us/va"
    );
  });

  it("uses pathInfo breadcrumb prefix without locale for primary locale when locale prefix is disabled", () => {
    const documentWithPathInfo: StreamDocument = {
      ...baseDocument,
      __: {
        pathInfo: {
          ...baseDocument.__?.pathInfo,
          includeLocalePrefixForPrimaryLocale: false,
        },
      },
    };

    expect(resolveDirectoryListChildren(documentWithPathInfo, child)).toBe(
      "locations/us/va"
    );
  });

  it("always includes locale for non-primary locales", () => {
    const nonPrimaryLocaleDocument: StreamDocument = {
      ...baseDocument,
      locale: "es",
      __: {
        pathInfo: {
          ...baseDocument.__?.pathInfo,
          includeLocalePrefixForPrimaryLocale: false,
        },
      },
    };

    expect(resolveDirectoryListChildren(nonPrimaryLocaleDocument, child)).toBe(
      "es/locations/us/va"
    );
  });

  it("falls back to child slug when pathInfo does not exist", () => {
    const documentWithoutPathInfo: StreamDocument = {
      ...baseDocument,
      __: {},
    };

    expect(resolveDirectoryListChildren(documentWithoutPathInfo, child)).toBe(
      "us/va"
    );
  });
});
