import { assert, describe, it } from "vitest";
import { resolveUrlTemplate } from "./resolveUrlTemplate";
import { StreamDocument } from "./applyTheme";

describe("resolveUrlTemplate", () => {
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
          alternate: "[[locale]]/[[address.region]]/[[address.city]]",
        },
      },
    }),
  };

  it("should resolve the URL using the primary template for a primary locale", () => {
    const result = resolveUrlTemplate(mockStreamDocument, "en");
    assert.equal(result, "ny/new-york/61-9th-ave");
  });

  it("should resolve the URL using the alternate template for a non-primary locale", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      locale: "es",
    };
    const result = resolveUrlTemplate(alternateLocaleDoc, "es");
    assert.equal(result, "es/ny/new-york");
  });

  it("should default to the alternate template if the '__' property is missing", () => {
    // eslint-disable-next-line no-unused-vars
    const { __, ...docWithoutPrimaryInfo } = mockStreamDocument;

    const result = resolveUrlTemplate(docWithoutPrimaryInfo, "en");
    assert.equal(result, "en/ny/new-york");
  });

  it("should return an empty string if _pageset is missing or undefined", () => {
    const docWithoutPageset = {
      ...mockStreamDocument,
      _pageset: undefined,
    };
    const result = resolveUrlTemplate(docWithoutPageset, "en");
    assert.equal(result, "");
  });

  it("should return an empty string if _pageset is an empty string", () => {
    const docWithEmptyPageset = {
      ...mockStreamDocument,
      _pageset: "",
    };
    const result = resolveUrlTemplate(docWithEmptyPageset, "en");
    assert.equal(result, "");
  });

  it("should return an empty string if urlTemplate is missing in the config", () => {
    const docWithoutUrlTemplate = {
      ...mockStreamDocument,
      _pageset: JSON.stringify({
        config: {},
      }),
    };
    const result = resolveUrlTemplate(docWithoutUrlTemplate, "en");
    assert.equal(result, "");
  });

  it("should return an empty string if the primary template is missing for a primary locale", () => {
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
    const result = resolveUrlTemplate(docWithoutPrimaryTemplate, "en");
    assert.equal(result, "");
  });

  it("should return an empty string if the alternate template is missing for an alternate locale", () => {
    const docWithoutAlternateTemplate = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      _pageset: JSON.stringify({
        config: {
          urlTemplate: {
            primary: "[[address.region]]/[[address.city]]/[[address.line1]]",
          },
        },
      }),
    };
    const result = resolveUrlTemplate(docWithoutAlternateTemplate, "es");
    assert.equal(result, "");
  });

  it("should handle unresolvable fields gracefully, replacing them with empty strings", () => {
    const docWithUnresolvableField = {
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
    const result = resolveUrlTemplate(docWithUnresolvableField, "en");
    assert.equal(result, "ny//new-york");
  });

  describe("with relativePrefixToRoot", () => {
    it("should prepend the relativePrefixToRoot to a primary URL", () => {
      const result = resolveUrlTemplate(mockStreamDocument, "en", "../");
      assert.equal(result, "../ny/new-york/61-9th-ave");
    });

    it("should prepend the relativePrefixToRoot to an alternate URL", () => {
      const alternateLocaleDoc = {
        ...mockStreamDocument,
        __: { isPrimaryLocale: false },
        locale: "es",
      };
      const result = resolveUrlTemplate(alternateLocaleDoc, "es", "../../");
      assert.equal(result, "../../es/ny/new-york");
    });

    it("should not add a prefix if the resolved URL is an empty string", () => {
      const docWithoutUrlTemplate = {
        ...mockStreamDocument,
        _pageset: JSON.stringify({ config: {} }),
      };
      const result = resolveUrlTemplate(docWithoutUrlTemplate, "en", "../");
      assert.equal(result, "");
    });

    it("should handle an empty string prefix without changing the URL", () => {
      const result = resolveUrlTemplate(mockStreamDocument, "en", "");
      assert.equal(result, "ny/new-york/61-9th-ave");
    });
  });
});
