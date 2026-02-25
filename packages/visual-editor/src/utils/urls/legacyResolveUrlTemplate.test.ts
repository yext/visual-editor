import { assert, describe, it, expect } from "vitest";
import { legacyResolveUrlTemplate } from "./legacyResolveUrlTemplate.ts";
import { StreamDocument } from "../types/StreamDocument.ts";

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
    type: "ENTITY",
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
  _pageset: JSON.stringify({
    type: "DIRECTORY",
  }),
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
  _pageset: JSON.stringify({
    type: "LOCATOR",
  }),
};

const mockNewLocatorMergedDocument: StreamDocument = {
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
    codeTemplate: "locator",
    entityPageSetUrlTemplates: JSON.stringify({
      primary: "[[address.region]]/location/[[id]]",
      includePrimaryLocalePrefixForPrimaryLocale: true,
      primaryLocale: "en",
    }),
  },
  _pageset: JSON.stringify({
    type: "LOCATOR",
  }),
};

describe("legacyResolveUrlTemplate with isChild flag", () => {
  it("handles primary url template on directory pages", () => {
    expect(
      legacyResolveUrlTemplate(mockDirectoryMergedDocument, "", true)
    ).toBe("ny/page/123");
  });

  it("handles alternate url templates on directory pages", () => {
    expect(
      legacyResolveUrlTemplate(
        {
          ...mockDirectoryMergedDocument,
          __: { ...mockDirectoryMergedDocument.__, isPrimaryLocale: false },
          locale: "es",
        },
        "",
        true
      )
    ).toBe("es/ny/page/123");
  });

  it("handles primary url template on locator pages", () => {
    expect(legacyResolveUrlTemplate(mockLocatorMergedDocument, "", true)).toBe(
      "ny/location/123"
    );
  });

  it("handles alternate url templates on locator pages", () => {
    expect(
      legacyResolveUrlTemplate(
        {
          ...mockLocatorMergedDocument,
          __: { ...mockLocatorMergedDocument.__, isPrimaryLocale: false },
          locale: "es",
        },
        "",
        true
      )
    ).toBe("es/ny/location/123");
  });

  it("handles primary locale on new locator pages", () => {
    expect(
      legacyResolveUrlTemplate(mockNewLocatorMergedDocument, "", true)
    ).toBe("ny/location/123");
  });

  it("handles primary locale on new locator pages", () => {
    expect(
      legacyResolveUrlTemplate(
        { ...mockNewLocatorMergedDocument, locale: "es" },
        "",
        true
      )
    ).toBe("es/ny/location/123");
  });

  it("uses base entity template (entityPageSetUrlTemplates) for directory pages", () => {
    const directoryDocWithBothTemplates = {
      ...mockDirectoryMergedDocument,
      _pageset: JSON.stringify({
        type: "DIRECTORY",
        config: {
          urlTemplate: {
            primary: "directory/[[address.city]]/[[id]]",
            alternate: "[[locale]]/directory/[[address.city]]/[[id]]",
          },
        },
      }),
    };

    // Should use entityPageSetUrlTemplates, not _pageset urlTemplate
    const result = legacyResolveUrlTemplate(
      directoryDocWithBothTemplates,
      "",
      true
    );

    expect(result).toBe("ny/page/123");
  });

  it("returns undefined when locale cannot be determined", () => {
    const alternateLocaleDoc = {
      ...mockDirectoryMergedDocument,
      locale: undefined,
      __: { ...mockDirectoryMergedDocument.__, isPrimaryLocale: false },
    };
    expect(
      legacyResolveUrlTemplate(alternateLocaleDoc, "", true)
    ).toBeUndefined();
  });
});

describe("legacyResolveUrlTemplate", () => {
  it("resolves primary template for primary locale", () => {
    const result = legacyResolveUrlTemplate(mockStreamDocument, "");
    assert.equal(result, "ny/new-york/61-9th-ave");
  });

  it("resolves alternate template for non-primary locale", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      locale: "es",
    };
    const result = legacyResolveUrlTemplate(alternateLocaleDoc, "");
    assert.equal(result, "es/ny/new-york/61-9th-ave");
  });

  it("defaults to primary template if '__' is missing", () => {
    // eslint-disable-next-line no-unused-vars
    const { __, ...docWithoutPrimaryInfo } = mockStreamDocument;
    const result = legacyResolveUrlTemplate(docWithoutPrimaryInfo, "");
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
    const result = legacyResolveUrlTemplate(docWithMissingField, "");
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
    const result = legacyResolveUrlTemplate(docWithMissingField, "");
    assert.equal(result, "foo/ny/new-york");
  });

  it("prepends relativePrefixToRoot to primary URL", () => {
    const result = legacyResolveUrlTemplate(mockStreamDocument, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("prepends relativePrefixToRoot to alternate URL", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      locale: "es",
    };
    const result = legacyResolveUrlTemplate(alternateLocaleDoc, "../../");
    assert.equal(result, "../../es/ny/new-york/61-9th-ave");
  });

  it("handles empty string prefix without altering URL", () => {
    const result = legacyResolveUrlTemplate(mockStreamDocument, "");
    assert.equal(result, "ny/new-york/61-9th-ave");
  });

  it("use fallback if _pageset is undefined", () => {
    const docWithoutPageset = { ...mockStreamDocument, _pageset: undefined };
    const result = legacyResolveUrlTemplate(docWithoutPageset, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use fallback if _pageset is an empty string", () => {
    const docWithoutPageset = { ...mockStreamDocument, _pageset: "" };
    const result = legacyResolveUrlTemplate(docWithoutPageset, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use fallback if urlTemplate is missing in config", () => {
    const docWithoutUrlTemplate = {
      ...mockStreamDocument,
      _pageset: JSON.stringify({ config: {} }),
    };
    const result = legacyResolveUrlTemplate(docWithoutUrlTemplate, "../");
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
    const result = legacyResolveUrlTemplate(docWithoutPrimaryTemplate, "../");
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
    const result = legacyResolveUrlTemplate(docWithoutAlternateTemplate, "../");
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
    const result = legacyResolveUrlTemplate(docWithoutAlternateTemplate, "../");
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
    const result = legacyResolveUrlTemplate(docWithoutAlternateTemplate, "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("returns undefined when locale cannot be determined", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      locale: undefined,
      __: { isPrimaryLocale: false },
    };
    expect(legacyResolveUrlTemplate(alternateLocaleDoc, "")).toBeUndefined();
  });

  it("uses page set template for regular entity pages", () => {
    const result = legacyResolveUrlTemplate(mockStreamDocument, "");
    expect(result).toBe("ny/new-york/61-9th-ave");
  });

  it("resolves with relativePrefixToRoot for page set templates", () => {
    const result = legacyResolveUrlTemplate(mockStreamDocument, "../");
    expect(result).toBe("../ny/new-york/61-9th-ave");
  });
});
