import { assert, describe, it, vi } from "vitest";
import { resolveUrlTemplate } from "./resolveUrlTemplate";
import { StreamDocument } from "./applyTheme";

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

  it("uses alternateDataSource if provided", () => {
    const result = resolveUrlTemplate(mockStreamDocument, "en", "../", {
      address: {
        region: "alternate-region",
        city: "alternate-city",
        line1: "alternate-line1",
      },
    });
    assert.equal(result, "../alternate-region/alternate-city/alternate-line1");
  });

  it("does not add prefix if URL resolves to empty string", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const docWithoutUrlTemplate = {
      ...mockStreamDocument,
      _pageset: JSON.stringify({ config: {} }),
    };
    const result = resolveUrlTemplate(docWithoutUrlTemplate, "en", "../");
    assert.equal(result, "");
    assert.isTrue(
      consoleSpy.mock.calls[0][0].includes("No URL template found")
    );
    consoleSpy.mockRestore();
  });

  it("handles empty string prefix without altering URL", () => {
    const result = resolveUrlTemplate(mockStreamDocument, "en", "");
    assert.equal(result, "ny/new-york/61-9th-ave");
  });

  it("returns empty string and errors if _pageset is undefined", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const docWithoutPageset = {
      ...mockStreamDocument,
      _pageset: undefined,
    };
    const result = resolveUrlTemplate(docWithoutPageset, "en", "../");
    assert.equal(result, "");
    assert.isTrue(
      consoleSpy.mock.calls[0][0].includes("No URL template found")
    );
    consoleSpy.mockRestore();
  });

  it("returns empty string and errors if _pageset is an empty string", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const docWithEmptyPageset = {
      ...mockStreamDocument,
      _pageset: "",
    };
    const result = resolveUrlTemplate(docWithEmptyPageset, "en", "../");
    assert.equal(result, "");
    assert.isTrue(
      consoleSpy.mock.calls[0][0].includes("No URL template found")
    );
    consoleSpy.mockRestore();
  });

  it("returns empty string and errors if urlTemplate is missing", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const docWithoutUrlTemplate = {
      ...mockStreamDocument,
      _pageset: JSON.stringify({
        config: {},
      }),
    };
    const result = resolveUrlTemplate(docWithoutUrlTemplate, "en", "../");
    assert.equal(result, "");
    assert.isTrue(
      consoleSpy.mock.calls[0][0].includes("No URL template found")
    );
    consoleSpy.mockRestore();
  });

  it("returns empty string and errors if primary template is missing for primary locale", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
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
    assert.equal(result, "");
    assert.isTrue(
      consoleSpy.mock.calls[0][0].includes("No URL template found")
    );
    consoleSpy.mockRestore();
  });

  it("returns empty string and errors if alternate template is missing for alternate locale", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
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
    assert.equal(result, "");
    assert.isTrue(
      consoleSpy.mock.calls[0][0].includes("No URL template found")
    );
    consoleSpy.mockRestore();
  });
});
