import { describe, expect, it } from "vitest";
import { resolveBreadcrumbsFromPathInfo } from "./resolveBreadcrumbsFromPathInfo.ts";
import { StreamDocument } from "../types/StreamDocument.ts";

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

describe("resolveBreadcrumbsFromPathInfo", () => {
  it("builds breadcrumbs from templates for the primary locale without prefix", () => {
    const documentWithTemplates: StreamDocument = {
      ...baseDocument,
      __: {
        pathInfo: {
          primaryLocale: "en",
          breadcrumbTemplates: ["stores/[[id]]/overview"],
        },
      },
    };

    expect(resolveBreadcrumbsFromPathInfo(documentWithTemplates)).toEqual([
      { name: "overview", slug: "stores/123/overview" },
    ]);
  });

  it("prefixes breadcrumbs with locale for non-primary locales", () => {
    const spanishDocument: StreamDocument = {
      ...baseDocument,
      locale: "es",
      __: {
        pathInfo: {
          primaryLocale: "en",
          breadcrumbTemplates: ["stores///[[id]]"],
        },
      },
    };

    expect(resolveBreadcrumbsFromPathInfo(spanishDocument)).toEqual([
      { name: "123", slug: "es/stores/123" },
    ]);
  });
});
