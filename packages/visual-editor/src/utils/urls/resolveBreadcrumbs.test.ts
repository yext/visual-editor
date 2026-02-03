import { describe, expect, it, vi, beforeEach, type Mock } from "vitest";
import { resolveBreadcrumbs } from "./resolveBreadcrumbs.ts";
import { StreamDocument } from "../types/StreamDocument.ts";
import { getDirectoryParents } from "@yext/visual-editor";

vi.mock("@yext/visual-editor", () => ({
  getDirectoryParents: vi.fn(),
}));

const mockedGetDirectoryParents = getDirectoryParents as unknown as Mock;

const baseDocument: StreamDocument = {
  id: "123",
  name: "Current",
  locale: "en",
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
  it("prefers pathInfo breadcrumbs over directory parents", () => {
    const documentWithBreadcrumbs: StreamDocument = {
      ...baseDocument,
      __: {
        pathInfo: {
          primaryLocale: "en",
          breadcrumbTemplates: ["stores/[[id]]", "stores/[[id]]/team"],
        },
      },
    };

    mockedGetDirectoryParents.mockReturnValue([
      { name: "Directory Parent", slug: "directory-parent" },
    ]);

    expect(resolveBreadcrumbs(documentWithBreadcrumbs)).toEqual([
      { name: "123", slug: "stores/123" },
      { name: "team", slug: "stores/123/team" },
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
      { name: "Current", slug: "" },
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
      { name: "Current", slug: "" },
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
