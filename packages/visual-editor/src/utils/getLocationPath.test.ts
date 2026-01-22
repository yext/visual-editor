import { describe, it, expect } from "vitest";
import { getLocationPath } from "./getLocationPath.ts";

const address = {
  line1: "1101 Wilson Blvd",
  city: "Arlington",
  region: "VA",
  countryCode: "US",
  postalCode: "22209",
};

describe("getLocationPath", () => {
  it.each([
    [
      "returns slug paths without prefix",
      {
        locale: "en",
        slug: "my-slug",
        id: "location1",
        _pageset: JSON.stringify({ config: { primaryLocale: "en" } }),
      },
      "",
      "my-slug",
    ],
    [
      "returns slug paths with prefix",
      {
        locale: "en",
        slug: "my-slug",
        id: "location1",
        _pageset: JSON.stringify({ config: { primaryLocale: "en" } }),
      },
      "../../",
      "../../my-slug",
    ],
  ])("%s", (_label, location, prefix, expected) => {
    expect(getLocationPath(location, prefix)).toBe(expected);
  });

  it.each([
    [
      "returns address-based paths without prefix",
      {
        locale: "en",
        address: address,
        id: "location1",
        _pageset: JSON.stringify({ config: { primaryLocale: "en" } }),
      },
      "",
      "va/arlington/1101-wilson-blvd",
    ],
    [
      "returns address-based paths with locale prefix",
      {
        locale: "es",
        address: address,
        id: "location1",
        __: { isPrimaryLocale: false },
      },
      "",
      "es/va/arlington/1101-wilson-blvd",
    ],
    [
      "returns address-based paths with relative prefix",
      {
        __: { isPrimaryLocale: false },
        locale: "en",
        address: address,
        id: "location1",
      },
      "../",
      "../en/va/arlington/1101-wilson-blvd",
    ],
  ])("%s", (_label, location, prefix, expected) => {
    expect(getLocationPath(location, prefix)).toBe(expected);
  });

  it.each([
    [
      "returns id-based paths without prefix",
      {
        id: "location1",
        locale: "en",
        _pageset: JSON.stringify({ config: { primaryLocale: "en" } }),
      },
      "",
      "location1",
    ],
    [
      "returns id-based paths with locale prefix fallback",
      { locale: "es", id: "location1" },
      "",
      "es/location1",
    ],
    [
      "returns id-based paths with relative prefix",
      {
        id: "location1",
        locale: "en",
        _pageset: JSON.stringify({ config: { primaryLocale: "en" } }),
      },
      "../../../",
      "../../../location1",
    ],
    [
      "returns id-based paths with legacy __.isPrimaryLocale override",
      { id: "location1", locale: "en", __: { isPrimaryLocale: false } },
      "../../../",
      "../../../en/location1",
    ],
  ])("%s", (_label, location, prefix, expected) => {
    expect(getLocationPath(location, prefix)).toBe(expected);
  });

  describe("with pagesetConfig", () => {
    it.each([
      [
        "returns slug as-is without locale prefix logic",
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
        "locator-page",
      ],
      [
        "returns slug as-is for non-primary locale",
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
        "es/locator-page",
      ],
    ])("%s", (_label, location, expected) => {
      expect(getLocationPath(location, "")).toBe(expected);
    });

    it.each([
      [
        "uses custom primary_locale: es",
        {
          locale: "es",
          address: address,
          id: "location1",
          __: { isPrimaryLocale: true },
          _pageset: JSON.stringify({ config: { primaryLocale: "es" } }),
        },
        "va/arlington/1101-wilson-blvd",
      ],
      [
        "adds prefix for non-primary when primary_locale is es",
        {
          locale: "en",
          address: address,
          id: "location1",
          __: { isPrimaryLocale: false },
          _pageset: JSON.stringify({ config: { primaryLocale: "es" } }),
        },
        "en/va/arlington/1101-wilson-blvd",
      ],
    ])("%s", (_label, location, expected) => {
      expect(getLocationPath(location, "")).toBe(expected);
    });

    it.each([
      [
        "prefixes primary locale when include_locale_prefix_for_primary_locale is true",
        {
          locale: "en",
          address: address,
          id: "location1",
          __: { isPrimaryLocale: true },
          _pageset: JSON.stringify({
            config: {
              primaryLocale: "en",
              includeLocalePrefixForPrimaryLocale: true,
            },
          }),
        },
        "en/va/arlington/1101-wilson-blvd",
      ],
      [
        "prefixes primary locale id paths when include_locale_prefix_for_primary_locale is true",
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
        "en/location1",
      ],
      [
        "does not prefix primary locale when include_locale_prefix_for_primary_locale is false",
        {
          locale: "en",
          address: address,
          id: "location1",
          __: { isPrimaryLocale: true },
          _pageset: JSON.stringify({
            config: {
              primaryLocale: "en",
              includeLocalePrefixForPrimaryLocale: false,
            },
          }),
        },
        "va/arlington/1101-wilson-blvd",
      ],
      [
        "prefixes non-primary locale when include_locale_prefix_for_primary_locale is false",
        {
          locale: "es",
          address: address,
          id: "location1",
          __: { isPrimaryLocale: false },
          _pageset: JSON.stringify({
            config: {
              primaryLocale: "en",
              includeLocalePrefixForPrimaryLocale: false,
            },
          }),
        },
        "es/va/arlington/1101-wilson-blvd",
      ],
      [
        "works with custom primary_locale and prefix enabled",
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
        "fr/location1",
      ],
      [
        "works with custom primary_locale and prefix disabled",
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
        "location1",
      ],
      [
        "prefixes non-primary locale with custom primary_locale",
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
        "en/location1",
      ],
    ])("%s", (_label, location, expected) => {
      expect(getLocationPath(location, "")).toBe(expected);
    });

    it.each([
      [
        "maintains backward compatibility when pagesetConfig is not provided",
        {
          locale: "en",
          id: "location1",
          __: { isPrimaryLocale: true },
        },
        "location1",
      ],
      [
        "adds prefix for non-primary when pagesetConfig is not provided",
        {
          locale: "es",
          id: "location1",
          __: { isPrimaryLocale: false },
        },
        "es/location1",
      ],
    ])("%s", (_label, location, expected) => {
      expect(getLocationPath(location, "")).toBe(expected);
    });
  });
});
