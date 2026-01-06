import { assert, describe, it, expect } from "vitest";
import {
  resolveUrlTemplateOfChild,
  resolvePageSetUrlTemplate,
} from "./resolveUrlTemplate";
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

describe("resolveUrlTemplateOfChild", () => {
  it("handles primary url template on directory pages", () => {
    expect(resolveUrlTemplateOfChild(mockDirectoryMergedDocument, "")).toBe(
      "ny/page/123"
    );
  });

  it("handles alternate url templates on directory pages", () => {
    expect(
      resolveUrlTemplateOfChild(
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
    expect(resolveUrlTemplateOfChild(mockLocatorMergedDocument, "")).toBe(
      "ny/location/123"
    );
  });

  it("handles alternate url templates on locator pages", () => {
    expect(
      resolveUrlTemplateOfChild(
        {
          ...mockLocatorMergedDocument,
          __: { ...mockLocatorMergedDocument.__, isPrimaryLocale: false },
          locale: "es",
        },
        ""
      )
    ).toBe("es/ny/location/123");
  });

  it("uses base entity template (entityPageSetUrlTemplates) for directory pages", () => {
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

    // Should use entityPageSetUrlTemplates, not _pageset urlTemplate
    const result = resolveUrlTemplateOfChild(directoryDocWithBothTemplates, "");

    expect(result).toBe("ny/page/123");
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

    const result = resolveUrlTemplateOfChild(
      mockDirectoryMergedDocument,
      "../",
      alternateFunction
    );

    assert.equal(result, "../custom-url-for-yext-en");
  });

  it("throw error when locale cannot be determined", () => {
    const alternateLocaleDoc = {
      ...mockDirectoryMergedDocument,
      locale: undefined,
      __: { ...mockDirectoryMergedDocument.__, isPrimaryLocale: false },
    };
    expect(() =>
      resolveUrlTemplateOfChild(alternateLocaleDoc, "")
    ).toThrowError();
  });
});

describe("resolvePageSetUrlTemplate", () => {
  it("resolves primary template for primary locale", () => {
    const result = resolvePageSetUrlTemplate(mockStreamDocument, "");
    assert.equal(result, "ny/new-york/61-9th-ave");
  });

  it("resolves alternate template for non-primary locale", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      locale: "es",
    };
    const result = resolvePageSetUrlTemplate(alternateLocaleDoc, "");
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
      resolvePageSetUrlTemplate(alternateLocaleDoc, ""),
      "zh-hans-hk/ny/new-york/61-9th-ave"
    );
  });

  it("defaults to primary template if '__' is missing", () => {
    // eslint-disable-next-line no-unused-vars
    const { __, ...docWithoutPrimaryInfo } = mockStreamDocument;
    const result = resolvePageSetUrlTemplate(docWithoutPrimaryInfo, "");
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
    const result = resolvePageSetUrlTemplate(docWithMissingField, "");
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
    const result = resolvePageSetUrlTemplate(docWithMissingField, "");
    assert.equal(result, "foo/ny/new-york");
  });

  it("prepends relativePrefixToRoot to primary URL", () => {
    const result = resolvePageSetUrlTemplate(mockStreamDocument, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("prepends relativePrefixToRoot to alternate URL", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      locale: "es",
    };
    const result = resolvePageSetUrlTemplate(alternateLocaleDoc, "../../");
    assert.equal(result, "../../es/ny/new-york/61-9th-ave");
  });

  it("handles empty string prefix without altering URL", () => {
    const result = resolvePageSetUrlTemplate(mockStreamDocument, "");
    assert.equal(result, "ny/new-york/61-9th-ave");
  });

  it("use fallback if _pageset is undefined", () => {
    const docWithoutPageset = { ...mockStreamDocument, _pageset: undefined };
    const result = resolvePageSetUrlTemplate(docWithoutPageset, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use fallback if _pageset is an empty string", () => {
    const docWithoutPageset = { ...mockStreamDocument, _pageset: "" };
    const result = resolvePageSetUrlTemplate(docWithoutPageset, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use fallback if urlTemplate is missing in config", () => {
    const docWithoutUrlTemplate = {
      ...mockStreamDocument,
      _pageset: JSON.stringify({ config: {} }),
    };
    const result = resolvePageSetUrlTemplate(docWithoutUrlTemplate, "../");
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
    const result = resolvePageSetUrlTemplate(docWithoutPrimaryTemplate, "../");
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
    const result = resolvePageSetUrlTemplate(
      docWithoutAlternateTemplate,
      "../"
    );
    // Non-primary locale using primary template should get locale prefix
    assert.equal(result, "../es/ny/new-york/61-9th-ave");
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
    const result = resolvePageSetUrlTemplate(
      docWithoutAlternateTemplate,
      "../"
    );
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
    const result = resolvePageSetUrlTemplate(
      docWithoutAlternateTemplate,
      "../"
    );
    // When isPrimaryLocale is missing, it defaults to checking locale === primaryLocale
    // Since "fr" !== "en" (default primary), it's treated as non-primary and gets prefix
    assert.equal(result, "../fr/ny/new-york/61-9th-ave");
  });

  it("throw error when locale cannot be determined", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      locale: undefined,
      __: { isPrimaryLocale: false },
    };
    expect(() =>
      resolvePageSetUrlTemplate(alternateLocaleDoc, "")
    ).toThrowError();
  });

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

  describe("with primary_locale and include_locale_prefix_for_primary_locale", () => {
    it("uses custom primary_locale from pageset config", () => {
      const docWithCustomPrimaryLocale = {
        ...mockStreamDocument,
        locale: "es",
        __: { isPrimaryLocale: true },
        _pageset: JSON.stringify({
          config: {
            primary_locale: "es",
            urlTemplate: {
              primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
              alternate:
                "[[locale]]/[[address.region]]/[[address.city]]/[[address.line1]]",
            },
          },
        }),
      };

      // Spanish is primary, so should use primary template without prefix
      const result = resolvePageSetUrlTemplate(docWithCustomPrimaryLocale, "");
      expect(result).toBe("ny/new-york/61-9th-ave");
    });

    it("adds prefix for non-primary locale when primary_locale is custom", () => {
      const docWithCustomPrimaryLocale = {
        ...mockStreamDocument,
        locale: "en",
        __: { isPrimaryLocale: false },
        _pageset: JSON.stringify({
          config: {
            primary_locale: "es",
            urlTemplate: {
              primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
              alternate:
                "[[locale]]/[[address.region]]/[[address.city]]/[[address.line1]]",
            },
          },
        }),
      };

      // English is not primary (Spanish is), so should get prefix
      const result = resolvePageSetUrlTemplate(docWithCustomPrimaryLocale, "");
      expect(result).toBe("en/ny/new-york/61-9th-ave");
    });

    it("respects include_locale_prefix_for_primary_locale: true for primary template", () => {
      const docWithPrefixForPrimary = {
        ...mockStreamDocument,
        locale: "en",
        __: { isPrimaryLocale: true },
        _pageset: JSON.stringify({
          config: {
            primary_locale: "en",
            include_locale_prefix_for_primary_locale: true,
            urlTemplate: {
              primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
              alternate:
                "[[locale]]/[[address.region]]/[[address.city]]/[[address.line1]]",
            },
          },
        }),
      };

      // Primary locale with include_locale_prefix_for_primary_locale: true should get prefix
      const result = resolvePageSetUrlTemplate(docWithPrefixForPrimary, "");
      expect(result).toBe("en/ny/new-york/61-9th-ave");
    });

    it("respects include_locale_prefix_for_primary_locale: false (default) for primary template", () => {
      const docWithoutPrefixForPrimary = {
        ...mockStreamDocument,
        locale: "en",
        __: { isPrimaryLocale: true },
        _pageset: JSON.stringify({
          config: {
            primary_locale: "en",
            include_locale_prefix_for_primary_locale: false,
            urlTemplate: {
              primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
              alternate:
                "[[locale]]/[[address.region]]/[[address.city]]/[[address.line1]]",
            },
          },
        }),
      };

      // Primary locale with include_locale_prefix_for_primary_locale: false should NOT get prefix
      const result = resolvePageSetUrlTemplate(docWithoutPrefixForPrimary, "");
      expect(result).toBe("ny/new-york/61-9th-ave");
    });

    it("does not double-prefix when alternate template already includes [[locale]]", () => {
      const docWithAlternateTemplate = {
        ...mockStreamDocument,
        locale: "es",
        __: { isPrimaryLocale: false },
        _pageset: JSON.stringify({
          config: {
            primary_locale: "en",
            include_locale_prefix_for_primary_locale: false,
            urlTemplate: {
              primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
              alternate:
                "[[locale]]/[[address.region]]/[[address.city]]/[[address.line1]]",
            },
          },
        }),
      };

      // Alternate template already includes [[locale]], so should not add additional prefix
      const result = resolvePageSetUrlTemplate(docWithAlternateTemplate, "");
      expect(result).toBe("es/ny/new-york/61-9th-ave");
    });

    it("works with custom primary_locale and include_locale_prefix_for_primary_locale: true", () => {
      const docWithFrenchPrimary = {
        ...mockStreamDocument,
        locale: "fr",
        __: { isPrimaryLocale: true },
        _pageset: JSON.stringify({
          config: {
            primary_locale: "fr",
            include_locale_prefix_for_primary_locale: true,
            urlTemplate: {
              primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
              alternate:
                "[[locale]]/[[address.region]]/[[address.city]]/[[address.line1]]",
            },
          },
        }),
      };

      // French is primary with prefix enabled, should get prefix
      const result = resolvePageSetUrlTemplate(docWithFrenchPrimary, "");
      expect(result).toBe("fr/ny/new-york/61-9th-ave");
    });

    it("maintains backward compatibility when pageset config fields are missing", () => {
      // Should default to "en" as primary and false for include_locale_prefix_for_primary_locale
      const result = resolvePageSetUrlTemplate(mockStreamDocument, "");
      expect(result).toBe("ny/new-york/61-9th-ave");
    });

    it("handles primary template with include_locale_prefix_for_primary_locale and relativePrefixToRoot", () => {
      const docWithPrefixForPrimary = {
        ...mockStreamDocument,
        locale: "en",
        __: { isPrimaryLocale: true },
        _pageset: JSON.stringify({
          config: {
            primary_locale: "en",
            include_locale_prefix_for_primary_locale: true,
            urlTemplate: {
              primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
              alternate:
                "[[locale]]/[[address.region]]/[[address.city]]/[[address.line1]]",
            },
          },
        }),
      };

      const result = resolvePageSetUrlTemplate(docWithPrefixForPrimary, "../");
      expect(result).toBe("../en/ny/new-york/61-9th-ave");
    });
  });
});
