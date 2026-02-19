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

const matrixCases = [
  {
    breadcrumbPrefix: "locations",
    locale: "en",
    includeLocalePrefixForPrimaryLocale: true,
    expected: [
      { name: "Directory Root", slug: "en/locations/index.html" },
      { name: "US", slug: "en/locations/us" },
      { name: "TS", slug: "en/locations/ts" },
      { name: "Testville", slug: "en/locations/testville" },
      { name: "123 Test Rd", slug: "" },
    ],
  },
  {
    breadcrumbPrefix: "locations",
    locale: "en",
    includeLocalePrefixForPrimaryLocale: false,
    expected: [
      { name: "Directory Root", slug: "locations/index.html" },
      { name: "US", slug: "locations/us" },
      { name: "TS", slug: "locations/ts" },
      { name: "Testville", slug: "locations/testville" },
      { name: "123 Test Rd", slug: "" },
    ],
  },
  {
    breadcrumbPrefix: "locations",
    locale: "es",
    includeLocalePrefixForPrimaryLocale: true,
    expected: [
      { name: "Directory Root", slug: "es/locations/index.html" },
      { name: "US", slug: "es/locations/us" },
      { name: "TS", slug: "es/locations/ts" },
      { name: "Testville", slug: "es/locations/testville" },
      { name: "123 Test Rd", slug: "" },
    ],
  },
  {
    breadcrumbPrefix: "locations",
    locale: "es",
    includeLocalePrefixForPrimaryLocale: false,
    expected: [
      { name: "Directory Root", slug: "es/locations/index.html" },
      { name: "US", slug: "es/locations/us" },
      { name: "TS", slug: "es/locations/ts" },
      { name: "Testville", slug: "es/locations/testville" },
      { name: "123 Test Rd", slug: "" },
    ],
  },
  {
    breadcrumbPrefix: "",
    locale: "en",
    includeLocalePrefixForPrimaryLocale: true,
    expected: [
      { name: "Directory Root", slug: "en/index.html" },
      { name: "US", slug: "en/us" },
      { name: "TS", slug: "en/ts" },
      { name: "Testville", slug: "en/testville" },
      { name: "123 Test Rd", slug: "" },
    ],
  },
  {
    breadcrumbPrefix: "",
    locale: "en",
    includeLocalePrefixForPrimaryLocale: false,
    expected: [
      { name: "Directory Root", slug: "index.html" },
      { name: "US", slug: "us" },
      { name: "TS", slug: "ts" },
      { name: "Testville", slug: "testville" },
      { name: "123 Test Rd", slug: "" },
    ],
  },
  {
    breadcrumbPrefix: "",
    locale: "es",
    includeLocalePrefixForPrimaryLocale: true,
    expected: [
      { name: "Directory Root", slug: "es/index.html" },
      { name: "US", slug: "es/us" },
      { name: "TS", slug: "es/ts" },
      { name: "Testville", slug: "es/testville" },
      { name: "123 Test Rd", slug: "" },
    ],
  },
  {
    breadcrumbPrefix: "",
    locale: "es",
    includeLocalePrefixForPrimaryLocale: false,
    expected: [
      { name: "Directory Root", slug: "es/index.html" },
      { name: "US", slug: "es/us" },
      { name: "TS", slug: "es/ts" },
      { name: "Testville", slug: "es/testville" },
      { name: "123 Test Rd", slug: "" },
    ],
  },
] as const;

describe("resolveBreadcrumbsFromPathInfo", () => {
  it.each(matrixCases)(
    "resolves breadcrumbs matrix case: breadcrumbPrefix=$breadcrumbPrefix locale=$locale includeLocalePrefixForPrimaryLocale=$includeLocalePrefixForPrimaryLocale",
    ({
      breadcrumbPrefix,
      locale,
      includeLocalePrefixForPrimaryLocale,
      expected,
    }) => {
      const doc: StreamDocument = {
        ...baseDocument,
        locale,
        __: {
          pathInfo: {
            ...baseDocument.__?.pathInfo,
            breadcrumbPrefix,
            includeLocalePrefixForPrimaryLocale,
          },
        },
      };

      expect(resolveBreadcrumbsFromPathInfo(doc)).toEqual(expected);
    }
  );
});
