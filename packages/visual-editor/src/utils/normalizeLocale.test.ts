import { describe, it, expect } from "vitest";
import { normalizeLocale, normalizeLocalesInObject } from "./normalizeLocale";

const pageSet =
  '{"name":"accounts/123/sites/456/pagesets/location-pages","uid":"019765a4-b3fd-7d4b-a78c-e3f196eb444c","codeTemplate":"main","assignments":["global"],"createTime":"2025-06-12T19:36:22Z","updateTime":"2025-07-15T16:05:51Z","scope":{"locales":["en","fr_ca","zH_hAnS-Hk"],"entityTypes":["location"]},"defaultLayout":"accounts/123/sites/456/layouts/location-pages-default-layout","displayName":"Location Pages","writebackUrlField":"pgs_locationPages_locationPages_ea8a0_Url","type":"ENTITY","typeConfig":{"entityConfig":{"rootDirectory":"accounts/123/sites/456/pagesets/location-pages-directory-root","directoryManagerId":"123456","locator":"accounts/123/sites/456/pagesets/location-pages-locator","contentEndpointId":"location-pagesContent"}}}';
const normalizedPageSet =
  '{"name":"accounts/123/sites/456/pagesets/location-pages","uid":"019765a4-b3fd-7d4b-a78c-e3f196eb444c","codeTemplate":"main","assignments":["global"],"createTime":"2025-06-12T19:36:22Z","updateTime":"2025-07-15T16:05:51Z","scope":{"locales":["en","fr-CA","zh-Hans-HK"],"entityTypes":["location"]},"defaultLayout":"accounts/123/sites/456/layouts/location-pages-default-layout","displayName":"Location Pages","writebackUrlField":"pgs_locationPages_locationPages_ea8a0_Url","type":"ENTITY","typeConfig":{"entityConfig":{"rootDirectory":"accounts/123/sites/456/pagesets/location-pages-directory-root","directoryManagerId":"123456","locator":"accounts/123/sites/456/pagesets/location-pages-locator","contentEndpointId":"location-pagesContent"}}}';

describe("normalizeLocale", () => {
  it("lowercases language code", () => {
    expect(normalizeLocale("EN")).toBe("en");
    expect(normalizeLocale("Fr")).toBe("fr");
  });

  it("uppercases region code", () => {
    expect(normalizeLocale("en_us")).toBe("en-US");
    expect(normalizeLocale("fr_ca")).toBe("fr-CA");
    expect(normalizeLocale("es-419")).toBe("es-419");
  });

  it("title-cases script code", () => {
    expect(normalizeLocale("zh_hans_cn")).toBe("zh-Hans-CN");
    expect(normalizeLocale("sr_latn_rs")).toBe("sr-Latn-RS");
    expect(normalizeLocale("sr_Latn_ME")).toBe("sr-Latn-ME");
  });

  it("handles variants and preserves them", () => {
    expect(normalizeLocale("en_US_POSIX")).toBe("en-US-POSIX");
    expect(normalizeLocale("sl_rozdvojeni")).toBe("sl-rozdvojeni");
  });

  it("handles already normalized locales", () => {
    expect(normalizeLocale("de-DE")).toBe("de-DE");
    expect(normalizeLocale("ja-Jpan-JP")).toBe("ja-Jpan-JP");
  });

  it("handles mixed delimiters and casing", () => {
    expect(normalizeLocale("EN-latn_us")).toBe("en-Latn-US");
    expect(normalizeLocale("fr_latn_CA")).toBe("fr-Latn-CA");
    expect(normalizeLocale("EN_US_POSIX")).toBe("en-US-POSIX");
  });

  it("handles edge cases", () => {
    expect(normalizeLocale("")).toBe("");
    expect(normalizeLocale("en")).toBe("en");
    expect(normalizeLocale("und")).toBe("und");
  });

  it("normalizes document locales", () => {
    const doc = {
      _env: {
        YEXT_CLOUD_CHOICE: "GLOBAL-MULTI",
        YEXT_CLOUD_REGION: "US",
      },
      _pageset: pageSet,
      _schema: {
        "@graph": [
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            address: {
              "@type": "PostalAddress",
              addressCountry: "CA",
              addressLocality: "Montréal",
              addressRegion: "QC",
            },
          },
        ],
      },
      locale: "en_us",
    };
    const normalized = {
      _env: {
        YEXT_CLOUD_CHOICE: "GLOBAL-MULTI",
        YEXT_CLOUD_REGION: "US",
      },
      _pageset: normalizedPageSet,
      _schema: {
        "@graph": [
          {
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            address: {
              "@type": "PostalAddress",
              addressCountry: "CA",
              addressLocality: "Montréal",
              addressRegion: "QC",
            },
          },
        ],
      },
      locale: "en-US",
    };
    expect(normalizeLocalesInObject(doc)).toEqual(normalized);
  });

  it("normalizes top-level locales array", () => {
    const input = {
      locales: ["en_us", "fr_ca", "zh_hans-HK"],
    };
    const expected = {
      locales: ["en-US", "fr-CA", "zh-Hans-HK"],
    };
    expect(normalizeLocalesInObject(input)).toEqual(expected);
  });

  it("normalizes nested locale inside array of objects", () => {
    const input = {
      widgets: [
        { name: "A", locale: "es_mx" },
        { name: "B", locale: "de_de" },
      ],
    };
    const expected = {
      widgets: [
        { name: "A", locale: "es-MX" },
        { name: "B", locale: "de-DE" },
      ],
    };
    expect(normalizeLocalesInObject(input)).toEqual(expected);
  });

  it("does not modify large numeric strings", () => {
    const input = {
      id: "846759736121983207",
      uid: "12345678901234567890",
    };
    expect(normalizeLocalesInObject(input)).toEqual(input);
  });

  it("skips malformed JSON strings", () => {
    const input = {
      brokenJson: '{"locale": "en_us"', // missing closing }
    };
    expect(normalizeLocalesInObject(input)).toEqual(input);
  });

  it("leaves plain strings untouched", () => {
    const input = {
      title: "Welcome to Montréal!",
      note: "locale is en_us but not a key",
    };
    expect(normalizeLocalesInObject(input)).toEqual(input);
  });

  it("normalizes deeply nested locale fields", () => {
    const input = {
      meta: {
        config: {
          settings: {
            fallback: {
              locale: "pt_br",
            },
          },
        },
      },
    };
    const expected = {
      meta: {
        config: {
          settings: {
            fallback: {
              locale: "pt-BR",
            },
          },
        },
      },
    };
    expect(normalizeLocalesInObject(input)).toEqual(expected);
  });

  it("handles null and undefined safely", () => {
    const input = {
      locale: null,
      locales: undefined,
      misc: false,
    };
    const expected = {
      locale: null,
      locales: undefined,
      misc: false,
    };
    expect(normalizeLocalesInObject(input)).toEqual(expected);
  });
});
