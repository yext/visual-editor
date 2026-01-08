import { describe, it, expect } from "vitest";
import { getLocationPath } from "./getLocationPath.ts";

describe("getLocationPath", () => {
  it("returns slug paths", () => {
    // With primaryLocale set to "en", locale === primaryLocale is true, so no prefix
    expect(
      getLocationPath(
        {
          locale: "en",
          slug: "my-slug",
          id: "location1",
          _pageset: JSON.stringify({ config: { primaryLocale: "en" } }),
        },
        ""
      )
    ).toBe("my-slug");

    expect(
      getLocationPath(
        {
          locale: "en",
          slug: "my-slug",
          id: "location1",
          _pageset: JSON.stringify({ config: { primaryLocale: "en" } }),
        },
        ""
      )
    ).toBe("my-slug");

    expect(
      getLocationPath(
        {
          locale: "en",
          slug: "my-slug",
          id: "location1",
          _pageset: JSON.stringify({ config: { primaryLocale: "en" } }),
        },
        "../../"
      )
    ).toBe("../../my-slug");
  });

  it("returns address-based paths", () => {
    // With primaryLocale set to "en", locale === primaryLocale is true, so no prefix
    expect(
      getLocationPath(
        {
          locale: "en",
          address: {
            line1: "1101 Wilson Blvd",
            city: "Arlington",
            region: "VA",
            countryCode: "US",
            postalCode: "22209",
          },
          id: "location1",
          _pageset: JSON.stringify({ config: { primaryLocale: "en" } }),
        },
        ""
      )
    ).toBe("va/arlington/1101-wilson-blvd");

    expect(
      getLocationPath(
        {
          locale: "es",
          address: {
            line1: "1101 Wilson Blvd",
            city: "Arlington",
            region: "VA",
            countryCode: "US",
            postalCode: "22209",
          },
          id: "location1",
          __: {
            isPrimaryLocale: false,
          },
        },
        ""
      )
    ).toBe("es/va/arlington/1101-wilson-blvd");

    expect(
      getLocationPath(
        {
          __: {
            isPrimaryLocale: false,
          },
          locale: "en",
          address: {
            line1: "1101 Wilson Blvd",
            city: "Arlington",
            region: "VA",
            countryCode: "US",
            postalCode: "22209",
          },
          id: "location1",
        },
        "../"
      )
    ).toBe("../en/va/arlington/1101-wilson-blvd");
  });

  it("returns id-based paths", () => {
    // With primaryLocale set to "en", locale === primaryLocale is true, so no prefix
    expect(
      getLocationPath(
        {
          id: "location1",
          locale: "en",
          _pageset: JSON.stringify({ config: { primaryLocale: "en" } }),
        },
        ""
      )
    ).toBe("location1");

    // No pageset config, so falls back to legacy __.isPrimaryLocale (undefined = falsy), adds prefix
    expect(getLocationPath({ locale: "es", id: "location1" }, "")).toBe(
      "es/location1"
    );

    // With primaryLocale set to "en", locale === primaryLocale is true, so no prefix
    expect(
      getLocationPath(
        {
          id: "location1",
          locale: "en",
          _pageset: JSON.stringify({ config: { primaryLocale: "en" } }),
        },
        "../../../"
      )
    ).toBe("../../../location1");

    // Legacy __.isPrimaryLocale: false takes precedence when no primaryLocale is set
    expect(
      getLocationPath(
        { id: "location1", locale: "en", __: { isPrimaryLocale: false } },
        "../../../"
      )
    ).toBe("../../../en/location1");
  });

  it("handles empty values", () => {
    // @ts-expect-error
    expect(() => getLocationPath({}, {}, "")).toThrow();

    // @ts-expect-error
    expect(() => getLocationPath(undefined, {}, "")).toThrow();
  });

  describe("with pagesetConfig", () => {
    it("applies locale prefix to slug when includeLocalePrefixForPrimaryLocale is true", () => {
      // Slug should get locale prefix when config says so
      expect(
        getLocationPath(
          {
            locale: "en",
            slug: "locator-page",
            id: "location1",
            __: { isPrimaryLocale: true },
            _pageset: JSON.stringify({
              config: {
                primaryLocale: "en",
                includeLocalePrefixForPrimaryLocale: true,
              },
            }),
          },
          ""
        )
      ).toBe("en/locator-page");

      // Non-primary locale should get prefix even if slug already has it (allows double prefix)
      expect(
        getLocationPath(
          {
            locale: "es",
            slug: "es/locator-page",
            id: "location1",
            __: { isPrimaryLocale: false },
            _pageset: JSON.stringify({
              config: {
                primaryLocale: "en",
                includeLocalePrefixForPrimaryLocale: false,
              },
            }),
          },
          ""
        )
      ).toBe("es/es/locator-page");
    });

    it("uses custom primary_locale", () => {
      // Spanish as primary locale
      expect(
        getLocationPath(
          {
            locale: "es",
            address: {
              line1: "1101 Wilson Blvd",
              city: "Arlington",
              region: "VA",
              countryCode: "US",
              postalCode: "22209",
            },
            id: "location1",
            __: {
              isPrimaryLocale: true,
            },
            _pageset: JSON.stringify({
              config: { primaryLocale: "es" },
            }),
          },
          ""
        )
      ).toBe("va/arlington/1101-wilson-blvd");

      // English should get prefix when Spanish is primary
      expect(
        getLocationPath(
          {
            locale: "en",
            address: {
              line1: "1101 Wilson Blvd",
              city: "Arlington",
              region: "VA",
              countryCode: "US",
              postalCode: "22209",
            },
            id: "location1",
            __: {
              isPrimaryLocale: false,
            },
            _pageset: JSON.stringify({
              config: { primaryLocale: "es" },
            }),
          },
          ""
        )
      ).toBe("en/va/arlington/1101-wilson-blvd");
    });

    it("respects include_locale_prefix_for_primary_locale: true", () => {
      // Primary locale should get prefix when include_locale_prefix_for_primary_locale is true
      expect(
        getLocationPath(
          {
            locale: "en",
            address: {
              line1: "1101 Wilson Blvd",
              city: "Arlington",
              region: "VA",
              countryCode: "US",
              postalCode: "22209",
            },
            id: "location1",
            __: {
              isPrimaryLocale: true,
            },
            _pageset: JSON.stringify({
              config: {
                primaryLocale: "en",
                includeLocalePrefixForPrimaryLocale: true,
              },
            }),
          },
          ""
        )
      ).toBe("en/va/arlington/1101-wilson-blvd");

      // ID-based path with prefix for primary locale
      expect(
        getLocationPath(
          {
            id: "location1",
            locale: "en",
            __: { isPrimaryLocale: true },
            _pageset: JSON.stringify({
              config: {
                primaryLocale: "en",
                includeLocalePrefixForPrimaryLocale: true,
              },
            }),
          },
          ""
        )
      ).toBe("en/location1");
    });

    it("respects include_locale_prefix_for_primary_locale: false (default)", () => {
      // Primary locale should NOT get prefix when include_locale_prefix_for_primary_locale is false
      expect(
        getLocationPath(
          {
            locale: "en",
            address: {
              line1: "1101 Wilson Blvd",
              city: "Arlington",
              region: "VA",
              countryCode: "US",
              postalCode: "22209",
            },
            id: "location1",
            __: {
              isPrimaryLocale: true,
            },
            _pageset: JSON.stringify({
              config: {
                primaryLocale: "en",
                includeLocalePrefixForPrimaryLocale: false,
              },
            }),
          },
          ""
        )
      ).toBe("va/arlington/1101-wilson-blvd");

      // Non-primary locale should still get prefix
      expect(
        getLocationPath(
          {
            locale: "es",
            address: {
              line1: "1101 Wilson Blvd",
              city: "Arlington",
              region: "VA",
              countryCode: "US",
              postalCode: "22209",
            },
            id: "location1",
            __: {
              isPrimaryLocale: false,
            },
            _pageset: JSON.stringify({
              config: {
                primaryLocale: "en",
                includeLocalePrefixForPrimaryLocale: false,
              },
            }),
          },
          ""
        )
      ).toBe("es/va/arlington/1101-wilson-blvd");
    });

    it("works with custom primary_locale and include_locale_prefix_for_primary_locale", () => {
      // French as primary with prefix enabled
      expect(
        getLocationPath(
          {
            locale: "fr",
            id: "location1",
            __: { isPrimaryLocale: true },
            _pageset: JSON.stringify({
              config: {
                primaryLocale: "fr",
                includeLocalePrefixForPrimaryLocale: true,
              },
            }),
          },
          ""
        )
      ).toBe("fr/location1");

      // French as primary with prefix disabled
      expect(
        getLocationPath(
          {
            locale: "fr",
            id: "location1",
            __: { isPrimaryLocale: true },
            _pageset: JSON.stringify({
              config: {
                primaryLocale: "fr",
                includeLocalePrefixForPrimaryLocale: false,
              },
            }),
          },
          ""
        )
      ).toBe("location1");

      // English (non-primary) should get prefix
      expect(
        getLocationPath(
          {
            locale: "en",
            id: "location1",
            __: { isPrimaryLocale: false },
            _pageset: JSON.stringify({
              config: {
                primaryLocale: "fr",
                includeLocalePrefixForPrimaryLocale: false,
              },
            }),
          },
          ""
        )
      ).toBe("en/location1");
    });

    it("maintains backward compatibility when pagesetConfig is not provided", () => {
      // Should default to "en" as primary locale
      expect(
        getLocationPath(
          {
            locale: "en",
            id: "location1",
            __: { isPrimaryLocale: true },
          },
          ""
        )
      ).toBe("location1");

      expect(
        getLocationPath(
          {
            locale: "es",
            id: "location1",
            __: { isPrimaryLocale: false },
          },
          ""
        )
      ).toBe("es/location1");
    });
  });
});
