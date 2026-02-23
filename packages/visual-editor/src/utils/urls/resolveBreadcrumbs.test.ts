import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { resolveBreadcrumbs } from "./resolveBreadcrumbs.ts";
import { StreamDocument } from "../types/StreamDocument.ts";
import { getDirectoryParents } from "../schema/helpers.ts";

vi.mock("../schema/helpers.ts", () => ({
  getDirectoryParents: vi.fn(),
}));

const mockedGetDirectoryParents = getDirectoryParents as unknown as Mock;

const baseDocument: Omit<StreamDocument, "undefined"> = {
  name: "123 Test Rd",
  dm_directoryParents_123_locations: [
    { name: "Directory Root", slug: "index.html" },
    { name: "US", slug: "us" },
    { name: "TS", slug: "ts" },
    { name: "Testville", slug: "testville" },
  ],
  address: {
    line1: "123 Test Rd",
    city: "Testville",
    region: "TS",
    postalCode: "12345",
    countryCode: "US",
  },
  locale: "es",
  __: {
    pathInfo: {
      primaryLocale: "en",
    },
  },
};

beforeEach(() => {
  mockedGetDirectoryParents.mockReset();
});

describe("resolveBreadcrumbs", () => {
  it("uses pathInfo resolver when available", () => {
    const documentWithBreadcrumbs: StreamDocument = baseDocument;

    mockedGetDirectoryParents.mockReturnValue([
      { name: "Directory Root", slug: "index.html" },
      { name: "US", slug: "us" },
      { name: "TS", slug: "ts" },
      { name: "Testville", slug: "testville" },
    ]);

    expect(resolveBreadcrumbs(documentWithBreadcrumbs)).toEqual([
      { name: "Directory Root", slug: "es/index.html" },
      { name: "US", slug: "es/us" },
      { name: "TS", slug: "es/ts" },
      { name: "Testville", slug: "es/testville" },
      { name: "123 Test Rd", slug: "" },
    ]);
  });

  it("uses pathInfo resolver with prefix", () => {
    const documentWithBreadcrumbs: StreamDocument = {
      ...baseDocument,
      __: {
        pathInfo: { ...baseDocument.__.pathInfo, breadcrumbPrefix: "prefix" },
      },
    };

    mockedGetDirectoryParents.mockReturnValue([
      { name: "Directory Root", slug: "index.html" },
      { name: "US", slug: "us" },
      { name: "TS", slug: "ts" },
      { name: "Testville", slug: "testville" },
    ]);

    expect(resolveBreadcrumbs(documentWithBreadcrumbs)).toEqual([
      { name: "Directory Root", slug: "es/prefix/index.html" },
      { name: "US", slug: "es/prefix/us" },
      { name: "TS", slug: "es/prefix/ts" },
      { name: "Testville", slug: "es/prefix/testville" },
      { name: "123 Test Rd", slug: "" },
    ]);
  });

  it("falls back to directory parents when pathInfo breadcrumbs are missing", () => {
    const documentWithoutPathInfo: StreamDocument = {
      ...baseDocument,
      __: {},
    };

    mockedGetDirectoryParents.mockReturnValue([
      { name: "Directory Parent", slug: "directory-parent" },
    ]);

    expect(resolveBreadcrumbs(documentWithoutPathInfo)).toEqual([
      { name: "Directory Parent", slug: "directory-parent" },
      { name: "123 Test Rd", slug: "" },
    ]);
  });

  it("uses the current page when directory parents are missing but children are present", () => {
    const documentWithChildren: StreamDocument = {
      ...baseDocument,
      __: {},
      dm_directoryChildren: [{}],
    };

    mockedGetDirectoryParents.mockReturnValue(undefined);

    expect(resolveBreadcrumbs(documentWithChildren)).toEqual([
      { name: "123 Test Rd", slug: "" },
    ]);
  });

  it("returns an empty array when no resolver yields breadcrumbs", () => {
    const documentWithoutNames: StreamDocument = {
      ...baseDocument,
      name: undefined,
      __: {},
    };

    mockedGetDirectoryParents.mockReturnValue([
      { name: "", slug: "directory-parent" },
    ]);

    expect(resolveBreadcrumbs(documentWithoutNames)).toEqual([]);
  });
});
