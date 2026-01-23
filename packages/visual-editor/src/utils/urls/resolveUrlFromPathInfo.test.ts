import { describe, expect, it } from "vitest";
import { resolveUrlFromPathInfo } from "./resolveUrlFromPathInfo";
import { StreamDocument } from "../types/StreamDocument";

const baseDocument: StreamDocument = {
  id: "123",
  name: "Yext",
  locale: "en",
  __: {
    isPrimaryLocale: true,
  },
};

describe("resolveUrlFromPathInfo", () => {
  it("returns undefined when pathInfo template is missing", () => {
    expect(resolveUrlFromPathInfo(baseDocument, "")).toBeUndefined();
  });

  it("omits locale prefix for primary locale by default", () => {
    const docWithPathInfo: StreamDocument = {
      ...baseDocument,
      __: {
        ...baseDocument.__,
        pathInfo: JSON.stringify({
          template: "stores/[[id]]",
          primaryLocale: "en",
        }),
      },
    };

    expect(resolveUrlFromPathInfo(docWithPathInfo, "")).toBe("stores/123");
  });

  it("includes locale prefix for primary locale when configured", () => {
    const docWithPathInfo: StreamDocument = {
      ...baseDocument,
      __: {
        ...baseDocument.__,
        pathInfo: JSON.stringify({
          template: "stores/[[id]]",
          primaryLocale: "en",
          includeLocalePrefixForPrimaryLocale: true,
        }),
      },
    };

    expect(resolveUrlFromPathInfo(docWithPathInfo, "")).toBe("en/stores/123");
  });

  it("includes locale prefix for non-primary locale when primaryLocale is set", () => {
    const docWithPathInfo: StreamDocument = {
      ...baseDocument,
      locale: "es",
      __: {
        ...baseDocument.__,
        pathInfo: JSON.stringify({
          template: "stores/[[id]]",
          primaryLocale: "en",
        }),
      },
    };

    expect(resolveUrlFromPathInfo(docWithPathInfo, "")).toBe("es/stores/123");
  });

  it("uses meta.locale when locale is missing", () => {
    const docWithPathInfo: StreamDocument = {
      ...baseDocument,
      locale: undefined,
      meta: {
        locale: "en",
      },
      __: {
        ...baseDocument.__,
        pathInfo: JSON.stringify({
          template: "stores/[[id]]",
          primaryLocale: "en",
        }),
      },
    };

    expect(resolveUrlFromPathInfo(docWithPathInfo, "")).toBe("stores/123");
  });

  it("gracefully handles invalid pathInfo JSON", () => {
    const docWithInvalidPathInfo: StreamDocument = {
      ...baseDocument,
      __: {
        ...baseDocument.__,
        pathInfo: "{",
      },
    };

    expect(resolveUrlFromPathInfo(docWithInvalidPathInfo, "")).toBeUndefined();
  });
});
