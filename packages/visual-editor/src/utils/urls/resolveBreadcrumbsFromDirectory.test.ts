import { beforeEach, describe, expect, it, vi, type Mock } from "vitest";
import { resolveBreadcrumbsFromDirectory } from "./resolveBreadcrumbsFromDirectory.ts";
import { StreamDocument } from "../types/StreamDocument.ts";
import { getDirectoryParents } from "../schema/helpers.ts";

vi.mock("../schema/helpers.ts", () => ({
  getDirectoryParents: vi.fn(),
}));

const mockedGetDirectoryParents = getDirectoryParents as unknown as Mock;

const baseDocument: StreamDocument = {
  name: "123 Test Rd",
};

beforeEach(() => {
  mockedGetDirectoryParents.mockReset();
});

describe("resolveBreadcrumbsFromDirectory", () => {
  it("returns directory parents plus the current page", () => {
    mockedGetDirectoryParents.mockReturnValue([
      { name: "Directory Root", slug: "index.html" },
      { name: "US", slug: "us" },
    ]);

    expect(resolveBreadcrumbsFromDirectory(baseDocument)).toEqual([
      { name: "Directory Root", slug: "index.html" },
      { name: "US", slug: "us" },
      { name: "123 Test Rd", slug: "" },
    ]);
  });

  it("returns the current page when children exist but parents are missing", () => {
    mockedGetDirectoryParents.mockReturnValue(undefined);

    const documentWithChildren: StreamDocument = {
      ...baseDocument,
      dm_directoryChildren: [{}],
    };

    expect(resolveBreadcrumbsFromDirectory(documentWithChildren)).toEqual([
      { name: "123 Test Rd", slug: "" },
    ]);
  });

  it("filters out breadcrumb entries that have no name", () => {
    mockedGetDirectoryParents.mockReturnValue([
      { name: "", slug: "invalid" },
      { name: "US", slug: "us" },
      { slug: "missing-name" },
    ]);

    expect(resolveBreadcrumbsFromDirectory(baseDocument)).toEqual([
      { name: "US", slug: "us" },
      { name: "123 Test Rd", slug: "" },
    ]);
  });

  it("returns undefined when no parents or children are present", () => {
    mockedGetDirectoryParents.mockReturnValue([]);

    expect(resolveBreadcrumbsFromDirectory(baseDocument)).toBeUndefined();
  });

  it("returns undefined when children exist but no breadcrumb names survive filtering", () => {
    mockedGetDirectoryParents.mockReturnValue([]);

    const documentWithoutName: StreamDocument = {
      ...baseDocument,
      name: undefined,
      dm_directoryChildren: [{}],
    };

    expect(
      resolveBreadcrumbsFromDirectory(documentWithoutName)
    ).toBeUndefined();
  });
});
