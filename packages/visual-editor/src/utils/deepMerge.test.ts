import { deepMerge } from "./deepMerge.ts";
import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  convertToTailwindConfig,
  themeResolver,
} from "../components/migrations/themeData.ts";
import {
  testDeveloperTailwindConfig,
  testMarketerTailwindConfig as testDefaultTailwindConfig,
  testMergedConfig,
  testThemeConfig,
} from "./testData.ts";

describe("deepMerge and legacy theme conversion", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("convert theme config to tailwind config", () => {
    const result = convertToTailwindConfig(testThemeConfig);
    expect(result).toEqual(testDefaultTailwindConfig);
  });

  test("merge marketer and developer tailwind configs, prioritizing developer config", () => {
    const result = deepMerge(
      testDeveloperTailwindConfig,
      testDefaultTailwindConfig
    );
    expect(result).toEqual(testMergedConfig);
  });

  test(
    "restructures theme config and merges with developer-specified tailwind config, " +
      "prioritizing developer config",
    () => {
      const result = themeResolver(
        testDeveloperTailwindConfig,
        testThemeConfig
      );
      expect(result).toEqual(testMergedConfig);
    }
  );
});
