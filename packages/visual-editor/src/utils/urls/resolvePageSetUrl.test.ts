import { describe, expect, it, vi } from "vitest";
import { resolvePageSetUrl } from "./resolvePageSetUrl";
import { StreamDocument } from "../types/StreamDocument";

const mockStreamDocument: StreamDocument = {
  id: "123",
  locale: "en",
  address: {
    line1: "61 9th Ave",
    city: "New York",
    region: "NY",
  },
  __: {
    isPrimaryLocale: true,
  },
  _pageset: JSON.stringify({
    config: {
      urlTemplate: {
        primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
        alternate:
          "[[locale]]/[[address.region]]/[[address.city]]/[[address.line1]]",
      },
    },
  }),
};

describe("resolvePageSetUrl", () => {
  it("uses pathInfo template before page set template", () => {
    const documentWithPathInfo: StreamDocument = {
      ...mockStreamDocument,
      __: {
        ...mockStreamDocument.__,
        pathInfo: JSON.stringify({
          template: "stores/[[id]]",
          primaryLocale: "en",
        }),
      },
    };

    expect(resolvePageSetUrl(documentWithPathInfo, "")).toBe("stores/123");
  });

  it("falls back to page set template when pathInfo is missing", () => {
    expect(resolvePageSetUrl(mockStreamDocument, "")).toBe(
      "ny/new-york/61-9th-ave"
    );
  });

  it("uses alternate page set template for non-primary locale", () => {
    const alternateLocaleDoc: StreamDocument = {
      ...mockStreamDocument,
      locale: "es",
      __: {
        ...mockStreamDocument.__,
        isPrimaryLocale: false,
      },
    };

    expect(resolvePageSetUrl(alternateLocaleDoc, "")).toBe(
      "es/ny/new-york/61-9th-ave"
    );
  });

  it("normalizes locale before resolving page set templates", () => {
    const alternateLocaleDoc: StreamDocument = {
      ...mockStreamDocument,
      locale: "Zh_HANS-hk",
      __: {
        ...mockStreamDocument.__,
        isPrimaryLocale: false,
      },
    };

    expect(resolvePageSetUrl(alternateLocaleDoc, "")).toBe(
      "zh-hans-hk/ny/new-york/61-9th-ave"
    );
  });

  it("uses alternateFunction when provided with pathInfo template", () => {
    const documentWithPathInfo: StreamDocument = {
      ...mockStreamDocument,
      __: {
        ...mockStreamDocument.__,
        pathInfo: JSON.stringify({
          template: "stores/[[id]]",
          primaryLocale: "en",
        }),
      },
    };
    const alternateFunction = (
      streamDocument: StreamDocument,
      relativePrefixToRoot: string
    ) => `${relativePrefixToRoot}alt/${streamDocument.id}`;

    expect(
      resolvePageSetUrl(documentWithPathInfo, "../", alternateFunction)
    ).toBe("../alt/123");
  });

  it("uses alternateFunction when pathInfo is missing", () => {
    const alternateFunction = (
      streamDocument: StreamDocument,
      relativePrefixToRoot: string
    ) => `${relativePrefixToRoot}alt/${streamDocument.id}`;

    expect(resolvePageSetUrl(mockStreamDocument, "", alternateFunction)).toBe(
      "alt/123"
    );
  });

  it("resolves without locale prefix when pathInfo template exists and locale is missing", () => {
    const documentWithPathInfo: StreamDocument = {
      ...mockStreamDocument,
      locale: undefined,
      __: {
        ...mockStreamDocument.__,
        pathInfo: JSON.stringify({
          template: "stores/[[id]]",
        }),
      },
    };

    expect(resolvePageSetUrl(documentWithPathInfo, "")).toBe("stores/123");
  });

  it("includes locale prefix for primary locale when pathInfo requires it", () => {
    const documentWithPathInfo: StreamDocument = {
      ...mockStreamDocument,
      __: {
        ...mockStreamDocument.__,
        pathInfo: JSON.stringify({
          template: "stores/[[id]]",
          primaryLocale: "en",
          includeLocalePrefixForPrimaryLocale: true,
        }),
      },
    };

    expect(resolvePageSetUrl(documentWithPathInfo, "")).toBe("en/stores/123");
  });

  it("includes locale prefix for non-primary locale when pathInfo sets primaryLocale", () => {
    const documentWithPathInfo: StreamDocument = {
      ...mockStreamDocument,
      locale: "es",
      __: {
        ...mockStreamDocument.__,
        pathInfo: JSON.stringify({
          template: "stores/[[id]]",
          primaryLocale: "en",
        }),
      },
    };

    expect(resolvePageSetUrl(documentWithPathInfo, "")).toBe("es/stores/123");
  });

  it("falls back to page set template when pathInfo JSON is invalid", () => {
    const documentWithInvalidPathInfo: StreamDocument = {
      ...mockStreamDocument,
      __: {
        ...mockStreamDocument.__,
        pathInfo: "{",
      },
    };

    expect(resolvePageSetUrl(documentWithInvalidPathInfo, "")).toBe(
      "ny/new-york/61-9th-ave"
    );
  });

  it("falls back to location path when no templates are available", () => {
    const documentWithoutTemplates: StreamDocument = {
      id: "location1",
      locale: "en",
    };

    expect(resolvePageSetUrl(documentWithoutTemplates, "")).toBe("location1");
  });

  it("returns empty string and logs when no resolver succeeds", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(resolvePageSetUrl({} as StreamDocument, "")).toBe("");
    expect(consoleSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith("failed to resolve url");

    consoleSpy.mockRestore();
  });
});
