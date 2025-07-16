import { describe, it, expect } from "vitest";
import { normalizeLocale, normalizeLocalesInObject } from "./normalizeLocale";

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
      _pageset:
        '{"name":"accounts/123/sites/456/pagesets/location-pages","uid":"019765a4-b3fd-7d4b-a78c-e3f196eb444c","codeTemplate":"main","assignments":["global"],"createTime":"2025-06-12T19:36:22Z","updateTime":"2025-07-15T16:05:51Z","scope":{"locales":["en","fr_ca","zH_hAnS-Hk"],"entityTypes":["location"]},"defaultLayout":"accounts/123/sites/456/layouts/location-pages-default-layout","displayName":"Location Pages","writebackUrlField":"pgs_locationPages_locationPages_ea8a0_Url","type":"ENTITY","typeConfig":{"entityConfig":{"rootDirectory":"accounts/123/sites/456/pagesets/location-pages-directory-root","directoryManagerId":"123456","locator":"accounts/123/sites/456/pagesets/location-pages-locator","contentEndpointId":"location-pagesContent"}}}',
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
      _pageset:
        '{"name":"accounts/123/sites/456/pagesets/location-pages","uid":"019765a4-b3fd-7d4b-a78c-e3f196eb444c","codeTemplate":"main","assignments":["global"],"createTime":"2025-06-12T19:36:22Z","updateTime":"2025-07-15T16:05:51Z","scope":{"locales":["en","fr-CA","zh-Hans-HK"],"entityTypes":["location"]},"defaultLayout":"accounts/123/sites/456/layouts/location-pages-default-layout","displayName":"Location Pages","writebackUrlField":"pgs_locationPages_locationPages_ea8a0_Url","type":"ENTITY","typeConfig":{"entityConfig":{"rootDirectory":"accounts/123/sites/456/pagesets/location-pages-directory-root","directoryManagerId":"123456","locator":"accounts/123/sites/456/pagesets/location-pages-locator","contentEndpointId":"location-pagesContent"}}}',
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
});
