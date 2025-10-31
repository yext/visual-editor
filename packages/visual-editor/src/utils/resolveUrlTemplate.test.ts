import { assert, describe, it, expect } from "vitest";
import { resolveUrlTemplate } from "./resolveUrlTemplate";
import { StreamDocument } from "./applyTheme";
import { normalizeSlug } from "./slugifier";

const mockStreamDocument: StreamDocument = {
  name: "Yext",
  id: "123",
  locale: "en",
  address: {
    line1: "61 9th Ave",
    city: "New York",
    region: "NY",
    country: "USA",
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

const mockDirectoryMergedDocument: StreamDocument = {
  name: "Yext",
  id: "123",
  locale: "en",
  address: {
    line1: "61 9th Ave",
    city: "New York",
    region: "NY",
    country: "USA",
  },
  __: {
    isPrimaryLocale: true,
    codeTemplate: "directory",
    entityPageSetUrlTemplates: JSON.stringify({
      primary: "[[address.region]]/page/[[id]]",
      alternate: "[[locale]]/[[address.region]]/page/[[id]]",
    }),
  },
  _pageset: JSON.stringify({}),
};

const mockLocatorMergedDocument: StreamDocument = {
  name: "Yext",
  id: "123",
  locale: "en",
  address: {
    line1: "61 9th Ave",
    city: "New York",
    region: "NY",
    country: "USA",
  },
  __: {
    isPrimaryLocale: true,
    codeTemplate: "locator",
    entityPageSetUrlTemplates: JSON.stringify({
      primary: "[[address.region]]/location/[[id]]",
      alternate: "[[locale]]/[[address.region]]/location/[[id]]",
    }),
  },
  _pageset: JSON.stringify({}),
};

describe("resolveUrlTemplate", () => {
  it("resolves primary template for primary locale", () => {
    const result = resolveUrlTemplate(mockStreamDocument, "");
    assert.equal(result, "ny/new-york/61-9th-ave");
  });

  it("resolves alternate template for non-primary locale", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      locale: "es",
    };
    const result = resolveUrlTemplate(alternateLocaleDoc, "");
    assert.equal(result, "es/ny/new-york/61-9th-ave");
  });

  it("resolves alternate template for non-primary locale when locale format is bad", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      locale: "Zh_HANS-hk",
      __: {
        isPrimaryLocale: false,
      },
    };

    assert.equal(
      resolveUrlTemplate(alternateLocaleDoc, ""),
      "zh-hans-hk/ny/new-york/61-9th-ave"
    );
  });

  it("defaults to primary template if '__' is missing", () => {
    // eslint-disable-next-line no-unused-vars
    const { __, ...docWithoutPrimaryInfo } = mockStreamDocument;
    const result = resolveUrlTemplate(docWithoutPrimaryInfo, "");
    assert.equal(result, "ny/new-york/61-9th-ave");
  });

  it("gracefully resolves empty fields", () => {
    const docWithMissingField = {
      ...mockStreamDocument,
      _pageset: JSON.stringify({
        config: {
          urlTemplate: {
            primary:
              "[[address.region]]/[[address.postalCode]]/[[address.city]]",
          },
        },
      }),
    };
    const result = resolveUrlTemplate(docWithMissingField, "");
    assert.equal(result, "ny/new-york");
  });

  it("gracefully resolves empty fields and hardcoded strings", () => {
    const docWithMissingField = {
      ...mockStreamDocument,
      _pageset: JSON.stringify({
        config: {
          urlTemplate: {
            primary:
              "foo/[[address.postalCode]]/[[address.region]]/[[address.city]]",
          },
        },
      }),
    };
    const result = resolveUrlTemplate(docWithMissingField, "");
    assert.equal(result, "foo/ny/new-york");
  });

  it("prepends relativePrefixToRoot to primary URL", () => {
    const result = resolveUrlTemplate(mockStreamDocument, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("prepends relativePrefixToRoot to alternate URL", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      locale: "es",
    };
    const result = resolveUrlTemplate(alternateLocaleDoc, "../../");
    assert.equal(result, "../../es/ny/new-york/61-9th-ave");
  });

  it("handles empty string prefix without altering URL", () => {
    const result = resolveUrlTemplate(mockStreamDocument, "");
    assert.equal(result, "ny/new-york/61-9th-ave");
  });

  it("use fallback if _pageset is undefined", () => {
    const docWithoutPageset = { ...mockStreamDocument, _pageset: undefined };
    const result = resolveUrlTemplate(docWithoutPageset, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use fallback if _pageset is an empty string", () => {
    const docWithoutPageset = { ...mockStreamDocument, _pageset: "" };
    const result = resolveUrlTemplate(docWithoutPageset, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use fallback if urlTemplate is missing in config", () => {
    const docWithoutUrlTemplate = {
      ...mockStreamDocument,
      _pageset: JSON.stringify({ config: {} }),
    };
    const result = resolveUrlTemplate(docWithoutUrlTemplate, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use alternate if primary template is missing for primary locale", () => {
    const docWithoutPrimaryTemplate = {
      ...mockStreamDocument,
      _pageset: JSON.stringify({
        config: {
          urlTemplate: {
            alternate: "[[locale]]/[[address.region]]/[[address.city]]",
          },
        },
      }),
    };
    const result = resolveUrlTemplate(docWithoutPrimaryTemplate, "../");
    assert.equal(result, "../en/ny/new-york");
  });

  it("use primary template if alternate template is missing for alternate locale", () => {
    const docWithoutAlternateTemplate = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      locale: "es",
      _pageset: JSON.stringify({
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    };
    const result = resolveUrlTemplate(docWithoutAlternateTemplate, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use fallback if all templates are missing", () => {
    const docWithoutAlternateTemplate = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      locale: "es",
      _pageset: JSON.stringify({
        config: {
          urlTemplate: {},
        },
      }),
    };
    const result = resolveUrlTemplate(docWithoutAlternateTemplate, "../");
    assert.equal(result, "../es/ny/new-york/61-9th-ave");
  });

  it("use primary if isPrimaryLocale field is missing", () => {
    const docWithoutAlternateTemplate = {
      ...mockStreamDocument,
      __: {},
      locale: "fr",
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
    const result = resolveUrlTemplate(docWithoutAlternateTemplate, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use alternateFunction when provided to resolve URL template", () => {
    const alternateFunction = (
      streamDocument: StreamDocument,
      relativePrefixToRoot: string
    ) => {
      return (
        relativePrefixToRoot +
        normalizeSlug(
          `custom-url-for-${streamDocument.name}-${streamDocument?.locale || streamDocument?.meta?.locale}`
        )
      );
    };

    const result = resolveUrlTemplate(
      mockStreamDocument,
      "../",
      alternateFunction
    );

    assert.equal(result, "../custom-url-for-yext-en");
  });

  it("throw error when locale cannot be determined", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      locale: undefined,
      __: { isPrimaryLocale: false },
    };
    expect(() => resolveUrlTemplate(alternateLocaleDoc, "")).toThrowError();
  });

  it("handles primary url template on directory pages", () => {
    expect(resolveUrlTemplate(mockDirectoryMergedDocument, "")).toBe(
      "ny/page/123"
    );
  });

  it("handles alternate url templates on directory pages", () => {
    expect(
      resolveUrlTemplate(
        {
          ...mockDirectoryMergedDocument,
          __: { ...mockDirectoryMergedDocument.__, isPrimaryLocale: false },
          locale: "es",
        },
        ""
      )
    ).toBe("es/ny/page/123");
  });

  it("handles primary url template on locator pages", () => {
    expect(resolveUrlTemplate(mockLocatorMergedDocument, "")).toBe(
      "ny/location/123"
    );
  });

  it("handles alternate url templates on locator pages", () => {
    expect(
      resolveUrlTemplate(
        {
          ...mockLocatorMergedDocument,
          __: { ...mockLocatorMergedDocument.__, isPrimaryLocale: false },
          locale: "es",
        },
        ""
      )
    ).toBe("es/ny/location/123");
  });

  it("uses base entity template by default for directory pages (backward compatibility)", () => {
    const directoryDocWithBothTemplates = {
      ...mockDirectoryMergedDocument,
      _pageset: JSON.stringify({
        config: {
          urlTemplate: {
            primary: "directory/[[address.city]]/[[id]]",
            alternate: "[[locale]]/directory/[[address.city]]/[[id]]",
          },
        },
      }),
    };

    // Should use entityPageSetUrlTemplates by default
    const result = resolveUrlTemplate(directoryDocWithBothTemplates, "");

    expect(result).toBe("ny/page/123");
  });
});

describe("resolvePageSetUrlTemplate", () => {
  // Need to import the function first
  const { resolvePageSetUrlTemplate } = require("./resolveUrlTemplate");

  it("uses current page set template for directory pages", () => {
    const directoryDocWithPageSetTemplate = {
      ...mockDirectoryMergedDocument,
      _pageset: JSON.stringify({
        config: {
          urlTemplate: {
            primary: "directory/[[address.city]]/[[id]]",
            alternate: "[[locale]]/directory/[[address.city]]/[[id]]",
          },
        },
      }),
    };

    const result = resolvePageSetUrlTemplate(
      directoryDocWithPageSetTemplate,
      ""
    );

    expect(result).toBe("directory/new-york/123");
  });

  it("uses current page set template for alternate locale", () => {
    const directoryDocWithPageSetTemplate = {
      ...mockDirectoryMergedDocument,
      __: { ...mockDirectoryMergedDocument.__, isPrimaryLocale: false },
      locale: "es",
      _pageset: JSON.stringify({
        config: {
          urlTemplate: {
            primary: "directory/[[address.city]]/[[id]]",
            alternate: "[[locale]]/directory/[[address.city]]/[[id]]",
          },
        },
      }),
    };

    const result = resolvePageSetUrlTemplate(
      directoryDocWithPageSetTemplate,
      ""
    );

    expect(result).toBe("es/directory/new-york/123");
  });

  it("uses page set template for locator pages", () => {
    const locatorDocWithPageSetTemplate = {
      ...mockLocatorMergedDocument,
      _pageset: JSON.stringify({
        config: {
          urlTemplate: {
            primary: "locator/[[address.city]]",
            alternate: "[[locale]]/locator/[[address.city]]",
          },
        },
      }),
    };

    const result = resolvePageSetUrlTemplate(locatorDocWithPageSetTemplate, "");

    expect(result).toBe("locator/new-york");
  });

  it("uses page set template for regular entity pages", () => {
    const result = resolvePageSetUrlTemplate(mockStreamDocument, "");
    expect(result).toBe("ny/new-york/61-9th-ave");
  });

  it("resolves with relativePrefixToRoot for page set templates", () => {
    const result = resolvePageSetUrlTemplate(mockStreamDocument, "../");
    expect(result).toBe("../ny/new-york/61-9th-ave");
  });

  it("uses alternateFunction when provided for page set templates", () => {
    const alternateFunction = (
      streamDocument: StreamDocument,
      relativePrefixToRoot: string
    ) => {
      return (
        relativePrefixToRoot +
        normalizeSlug(
          `custom-pageset-url-for-${streamDocument.name}-${streamDocument?.locale || streamDocument?.meta?.locale}`
        )
      );
    };

    const result = resolvePageSetUrlTemplate(
      mockStreamDocument,
      "../",
      alternateFunction
    );

    expect(result).toBe("../custom-pageset-url-for-yext-en");
  });
});
