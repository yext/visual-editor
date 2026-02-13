import { describe, expect, it } from "vitest";
import { resolveBreadcrumbsFromPathInfo } from "./resolveBreadcrumbsFromPathInfo.ts";
import { StreamDocument } from "../types/StreamDocument.ts";

const baseDocument: StreamDocument = {
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
  locale: "en",
  __: {
    pathInfo: {
      primaryLocale: "en",
      breadcrumbPrefix: "locations",
    },
  },
};

describe("resolveBreadcrumbsFromPathInfo", () => {
  it("builds breadcrumbs from breadcrumbPrefix for the primary locale without locale prefix", () => {
    const englishDocument = baseDocument;

    expect(resolveBreadcrumbsFromPathInfo(englishDocument)).toEqual([
      { name: "Directory Root", slug: "locations/index.html" },
      { name: "US", slug: "locations/us" },
      { name: "TS", slug: "locations/ts" },
      { name: "Testville", slug: "locations/testville" },
      { name: "123 Test Rd", slug: "" },
    ]);
  });

  it("prefixes breadcrumbs with locale for non-primary locales", () => {
    const spanishDocument: StreamDocument = {
      ...baseDocument,
      locale: "es",
    };

    expect(resolveBreadcrumbsFromPathInfo(spanishDocument)).toEqual([
      { name: "Directory Root", slug: "es/locations/index.html" },
      { name: "US", slug: "es/locations/us" },
      { name: "TS", slug: "es/locations/ts" },
      { name: "Testville", slug: "es/locations/testville" },
      { name: "123 Test Rd", slug: "" },
    ]);
  });

  it("omits the breadcrumb prefix separator when breadcrumbPrefix is empty", () => {
    const documentWithEmptyPrefix: StreamDocument = {
      ...baseDocument,
      __: {
        pathInfo: {
          ...baseDocument.__?.pathInfo,
          breadcrumbPrefix: "",
        },
      },
    };

    expect(resolveBreadcrumbsFromPathInfo(documentWithEmptyPrefix)).toEqual([
      { name: "Directory Root", slug: "index.html" },
      { name: "US", slug: "us" },
      { name: "TS", slug: "ts" },
      { name: "Testville", slug: "testville" },
      { name: "123 Test Rd", slug: "" },
    ]);
  });
});
