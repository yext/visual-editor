import { describe, expect, it } from "vitest";
import { resolveUrlFromPathInfo } from "./resolveUrlFromPathInfo.ts";
import { StreamDocument } from "../types/StreamDocument.ts";

const baseDocument: StreamDocument = {
  id: "123",
  name: "Yext",
  locale: "en",
  __: {
    isPrimaryLocale: true,
  },
};

const matrixCases = [
  {
    breadcrumbPrefix: "stores",
    locale: "en",
    includeLocalePrefixForPrimaryLocale: true,
    expected: "en/stores/123",
  },
  {
    breadcrumbPrefix: "stores",
    locale: "en",
    includeLocalePrefixForPrimaryLocale: false,
    expected: "stores/123",
  },
  {
    breadcrumbPrefix: "stores",
    locale: "es",
    includeLocalePrefixForPrimaryLocale: true,
    expected: "es/stores/123",
  },
  {
    breadcrumbPrefix: "stores",
    locale: "es",
    includeLocalePrefixForPrimaryLocale: false,
    expected: "es/stores/123",
  },
  {
    breadcrumbPrefix: "",
    locale: "en",
    includeLocalePrefixForPrimaryLocale: true,
    expected: "en/123",
  },
  {
    breadcrumbPrefix: "",
    locale: "en",
    includeLocalePrefixForPrimaryLocale: false,
    expected: "123",
  },
  {
    breadcrumbPrefix: "",
    locale: "es",
    includeLocalePrefixForPrimaryLocale: true,
    expected: "es/123",
  },
  {
    breadcrumbPrefix: "",
    locale: "es",
    includeLocalePrefixForPrimaryLocale: false,
    expected: "es/123",
  },
] as const;

describe("resolveUrlFromPathInfo", () => {
  it("returns undefined when pathInfo template is missing", () => {
    expect(resolveUrlFromPathInfo(baseDocument, "")).toBeUndefined();
  });

  it.each(matrixCases)(
    "resolves url for matrix case: breadcrumbPrefix=$breadcrumbPrefix locale=$locale includeLocalePrefixForPrimaryLocale=$includeLocalePrefixForPrimaryLocale",
    ({
      breadcrumbPrefix,
      locale,
      includeLocalePrefixForPrimaryLocale,
      expected,
    }) => {
      const template = breadcrumbPrefix
        ? `${breadcrumbPrefix}/[[id]]`
        : "[[id]]";

      const docWithPathInfo: StreamDocument = {
        ...baseDocument,
        locale,
        __: {
          ...baseDocument.__,
          pathInfo: {
            template,
            primaryLocale: "en",
            includeLocalePrefixForPrimaryLocale,
          },
        },
      };

      expect(resolveUrlFromPathInfo(docWithPathInfo, "")).toBe(expected);
    }
  );

  it("uses meta.locale when locale is missing", () => {
    const docWithPathInfo: StreamDocument = {
      ...baseDocument,
      locale: undefined,
      meta: {
        locale: "en",
      },
      __: {
        ...baseDocument.__,
        pathInfo: {
          template: "stores/[[id]]",
          primaryLocale: "en",
        },
      },
    };

    expect(resolveUrlFromPathInfo(docWithPathInfo, "")).toBe("stores/123");
  });
});
