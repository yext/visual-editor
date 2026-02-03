import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { resolveBreadcrumbs } from "./resolveBreadcrumbs.ts";
import { StreamDocument } from "../types/StreamDocument.ts";
import { getDirectoryParents } from "@yext/visual-editor";

vi.mock("@yext/visual-editor", () => ({
  getDirectoryParents: vi.fn(),
}));

const mockedGetDirectoryParents = getDirectoryParents as unknown as Mock;

const baseDocument: StreamDocument = {
  name: "123 Test Rd",
  address: {
    line1: "123 Test Rd",
    city: "Testville",
    region: "TS",
    postalCode: "12345",
    countryCode: "US",
  },
  locale: "en",
  __: {
    pathInfo: {
      primaryLocale: "en",
      breadcrumbTemplates: [
        "index.html",
        "[[address.countryCode]]",
        "[[address.countryCode]]/[[address.region]]",
        "[[address.countryCode]]/[[address.region]]/[[address.city]]",
      ],
    },
  },
};

beforeEach(() => {
  mockedGetDirectoryParents.mockReset();
});

describe("resolveBreadcrumbs", () => {
  it("prefers pathInfo breadcrumbs over directory parents", () => {
    const documentWithBreadcrumbs: StreamDocument = baseDocument;

    mockedGetDirectoryParents.mockReturnValue([
      { name: "Directory Parent", slug: "directory-parent" },
    ]);

    expect(resolveBreadcrumbs(documentWithBreadcrumbs)).toEqual([
      { name: "index.html", slug: "index.html" },
      { name: "US", slug: "us" },
      { name: "TS", slug: "us/ts" },
      { name: "Testville", slug: "us/ts/testville" },
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
