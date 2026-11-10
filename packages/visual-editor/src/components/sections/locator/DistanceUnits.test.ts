import { describe, expect, it } from "vitest";
import {
  getDistanceUnit,
  getMapboxCountryCode,
  type DistanceUnit,
  type DistanceUnitOption,
} from "./DistanceUnits.ts";

describe("locator distance units", () => {
  const cases: Array<{
    name: string;
    option?: DistanceUnitOption;
    visitorCountryCode?: string;
    browserLanguage?: string;
    pageLanguage: string;
    expected: DistanceUnit;
  }> = [
    {
      name: "uses explicit miles",
      option: "mile",
      visitorCountryCode: "CA",
      browserLanguage: "en-CA",
      pageLanguage: "fr-CA",
      expected: "mile",
    },
    {
      name: "uses explicit kilometers",
      option: "kilometer",
      visitorCountryCode: "US",
      browserLanguage: "en-US",
      pageLanguage: "en-GB",
      expected: "kilometer",
    },
    {
      name: "uses miles for a US visitor",
      option: "auto",
      visitorCountryCode: "us",
      browserLanguage: "en-CA",
      pageLanguage: "fr-CA",
      expected: "mile",
    },
    {
      name: "uses kilometers for a Canadian visitor",
      option: "auto",
      visitorCountryCode: "ca",
      browserLanguage: "en-US",
      pageLanguage: "en-GB",
      expected: "kilometer",
    },
    {
      name: "uses miles for a British visitor",
      option: "auto",
      visitorCountryCode: "GB",
      browserLanguage: "fr-CA",
      pageLanguage: "fr-CA",
      expected: "mile",
    },
    {
      name: "uses the browser region when location is unavailable",
      option: "auto",
      browserLanguage: "en_US",
      pageLanguage: "fr-CA",
      expected: "mile",
    },
    {
      name: "uses the page language when the browser has no region",
      option: "auto",
      browserLanguage: "en",
      pageLanguage: "en-GB",
      expected: "mile",
    },
    {
      name: "uses the page language when the browser locale is invalid",
      option: "auto",
      browserLanguage: "invalid_locale_name",
      pageLanguage: "fr-CA",
      expected: "kilometer",
    },
    {
      name: "preserves page-language behavior for an absent option",
      visitorCountryCode: "US",
      browserLanguage: "en-US",
      pageLanguage: "fr-CA",
      expected: "kilometer",
    },
    {
      name: "uses page language when selected",
      option: "locale",
      visitorCountryCode: "CA",
      browserLanguage: "en-CA",
      pageLanguage: "en-GB",
      expected: "mile",
    },
  ];

  it.each(cases)("$name", (testCase) => {
    expect(
      getDistanceUnit(
        testCase.option,
        testCase.visitorCountryCode,
        testCase.browserLanguage,
        testCase.pageLanguage
      )
    ).toBe(testCase.expected);
  });

  it("reads the country code from a Mapbox country result", () => {
    expect(
      getMapboxCountryCode({
        features: [{ properties: { short_code: "ca" } }],
      })
    ).toBe("ca");
  });
});
