import { describe, expect, it } from "vitest";
import { resolveBreadcrumbsFromPathInfo } from "./resolveBreadcrumbsFromPathInfo.ts";
import { StreamDocument } from "../types/StreamDocument.ts";

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

describe("resolveBreadcrumbsFromPathInfo", () => {
  it("builds breadcrumbs from templates for the primary locale without prefix", () => {
    const englishDocument = baseDocument;

    expect(resolveBreadcrumbsFromPathInfo(englishDocument)).toEqual([
      { name: "index.html", slug: "index.html" },
      { name: "US", slug: "US" },
      { name: "TS", slug: "US/TS" },
      { name: "Testville", slug: "US/TS/Testville" },
      { name: "123 Test Rd", slug: "" },
    ]);
  });

  it("prefixes breadcrumbs with locale for non-primary locales", () => {
    const spanishDocument: StreamDocument = {
      ...baseDocument,
      locale: "es",
    };

    expect(resolveBreadcrumbsFromPathInfo(spanishDocument)).toEqual([
      { name: "index.html", slug: "es/index.html" },
      { name: "US", slug: "es/US" },
      { name: "TS", slug: "es/US/TS" },
      { name: "Testville", slug: "es/US/TS/Testville" },
      { name: "123 Test Rd", slug: "" },
    ]);
  });
});
