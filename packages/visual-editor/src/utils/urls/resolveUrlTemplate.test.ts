import { describe, expect, it } from "vitest";
import {
  resolveUrlTemplate,
  resolveUrlTemplateOfChild,
} from "./resolveUrlTemplate.ts";
import { StreamDocument } from "../types/StreamDocument.ts";

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

const mockDMCityDocument: StreamDocument = {
  name: "Arlington",
  id: "arlington-va",
  locale: "en",
  __: {
    pathInfo: {
      template: "directory/[[id]]",
      primaryLocale: "en",
      sourceEntityPageSetTemplate:
        "[[address.region]]/[[address.city]]/[[address.line1]]",
    },
  },
  _pageset: JSON.stringify({
    type: "DIRECTORY",
  }),
};

const mockChildProfile = {
  id: "child-profile-1",
  locale: "en",
  address: {
    line1: "2000 University Dr",
    city: "Fairfax",
    region: "VA",
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

describe("resolveUrlTemplate", () => {
  it.each(matrixCases)(
    "prefers pathInfo template matrix case: breadcrumbPrefix=$breadcrumbPrefix locale=$locale includeLocalePrefixForPrimaryLocale=$includeLocalePrefixForPrimaryLocale",
    ({
      breadcrumbPrefix,
      locale,
      includeLocalePrefixForPrimaryLocale,
      expected,
    }) => {
      const template = breadcrumbPrefix
        ? `${breadcrumbPrefix}/[[id]]`
        : "[[id]]";

      const documentWithPathInfo: StreamDocument = {
        ...mockStreamDocument,
        locale,
        __: {
          ...mockStreamDocument.__,
          pathInfo: {
            template,
            primaryLocale: "en",
            includeLocalePrefixForPrimaryLocale,
          },
        },
      };

      expect(resolveUrlTemplate(documentWithPathInfo, "")).toBe(expected);
    }
  );

  it("falls back to page set template when pathInfo is missing", () => {
    expect(resolveUrlTemplate(mockStreamDocument, "")).toBe(
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

    expect(resolveUrlTemplate(alternateLocaleDoc, "")).toBe(
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

    expect(resolveUrlTemplate(alternateLocaleDoc, "")).toBe(
      "zh-hans-hk/ny/new-york/61-9th-ave"
    );
  });

  it("falls back to location path when no templates are available", () => {
    const documentWithoutTemplates: StreamDocument = {
      id: "location1",
      locale: "en",
    };

    expect(resolveUrlTemplate(documentWithoutTemplates, "")).toBe("location1");
  });

  it("throws error when no resolver succeeds", () => {
    expect(() => resolveUrlTemplate({} as StreamDocument, "")).toThrowError();
  });
});

describe("resolveUrlTemplateOfChild", () => {
  it("uses sourceEntityPageSetTemplate for child URL", () => {
    expect(
      resolveUrlTemplateOfChild(mockChildProfile, mockDMCityDocument, "")
    ).toBe("va/fairfax/2000-university-dr");
  });
});
