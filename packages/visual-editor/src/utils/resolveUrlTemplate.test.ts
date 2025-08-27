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

describe("resolveUrlTemplate", () => {
  it("resolves primary template for primary locale", () => {
    const result = resolveUrlTemplate(mockStreamDocument, "en", "");
    assert.equal(result, "ny/new-york/61-9th-ave");
  });

  it("resolves alternate template for non-primary locale", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      locale: "es",
    };
    const result = resolveUrlTemplate(alternateLocaleDoc, "es", "");
    assert.equal(result, "es/ny/new-york/61-9th-ave");
  });

  it("resolves alternate template for non-primary locale when document.locale is missing and isPrimaryLocale is a string", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      locale: undefined,
      __: { isPrimaryLocale: "false" },
      meta: {
        locale: "zh_hans_hk",
      },
    };

    assert.equal(
      resolveUrlTemplate(alternateLocaleDoc, "", ""),
      "zh-hans-hk/ny/new-york/61-9th-ave"
    );
  });

  it("defaults to alternate template if '__' is missing", () => {
    // eslint-disable-next-line no-unused-vars
    const { __, ...docWithoutPrimaryInfo } = mockStreamDocument;
    const result = resolveUrlTemplate(docWithoutPrimaryInfo, "en", "");
    assert.equal(result, "en/ny/new-york/61-9th-ave");
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
    const result = resolveUrlTemplate(docWithMissingField, "en", "");
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
    const result = resolveUrlTemplate(docWithMissingField, "en", "");
    assert.equal(result, "foo/ny/new-york");
  });

  it("prepends relativePrefixToRoot to primary URL", () => {
    const result = resolveUrlTemplate(mockStreamDocument, "en", "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("prepends relativePrefixToRoot to alternate URL", () => {
    const alternateLocaleDoc = {
      ...mockStreamDocument,
      __: { isPrimaryLocale: false },
      locale: "es",
    };
    const result = resolveUrlTemplate(alternateLocaleDoc, "es", "../../");
    assert.equal(result, "../../es/ny/new-york/61-9th-ave");
  });

  it("handles empty string prefix without altering URL", () => {
    const result = resolveUrlTemplate(mockStreamDocument, "en", "");
    assert.equal(result, "ny/new-york/61-9th-ave");
  });

  it("use fallback if _pageset is undefined", () => {
    const docWithoutPageset = { ...mockStreamDocument, _pageset: undefined };
    const result = resolveUrlTemplate(docWithoutPageset, "en", "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use fallback if _pageset is an empty string", () => {
    const docWithoutPageset = { ...mockStreamDocument, _pageset: "" };
    const result = resolveUrlTemplate(docWithoutPageset, "en", "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use fallback if urlTemplate is missing in config", () => {
    const docWithoutUrlTemplate = {
      ...mockStreamDocument,
      _pageset: JSON.stringify({ config: {} }),
    };
    const result = resolveUrlTemplate(docWithoutUrlTemplate, "en", "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use fallback if primary template is missing for primary locale", () => {
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
    const result = resolveUrlTemplate(docWithoutPrimaryTemplate, "en", "../");
    assert.equal(result, "../ny/new-york/61-9th-ave");
  });

  it("use fallback if alternate template is missing for alternate locale", () => {
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
    const result = resolveUrlTemplate(docWithoutAlternateTemplate, "es", "../");
    assert.equal(result, "../es/ny/new-york/61-9th-ave");
  });

  it("use alternateFunction when provided to resolve URL template", () => {
    const alternateFunction = (
      streamDocument: StreamDocument,
      locale: string,
      relativePrefixToRoot: string
    ) => {
      return (
        relativePrefixToRoot +
        normalizeSlug(`custom-url-for-${streamDocument.name}-${locale}`)
      );
    };

    const result = resolveUrlTemplate(
      mockStreamDocument,
      "en",
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
    expect(() => resolveUrlTemplate(alternateLocaleDoc, "", "")).toThrowError();
  });
});
