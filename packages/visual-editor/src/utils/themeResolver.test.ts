import { describe, test, expect, vi, beforeEach } from "vitest";
import {
  convertToTailwindConfig,
  deepMerge,
  themeResolver,
} from "./themeResolver.ts";
import {
  testDeveloperTailwindConfig,
  testMarketerTailwindConfig,
  testMergedConfig,
  testThemeConfig,
} from "./testData.ts";

describe("themeResolver", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  test("convert theme config to tailwind config", () => {
    const result = convertToTailwindConfig(testThemeConfig);
    expect(result).toEqual(testMarketerTailwindConfig);
  });

  test("merge marketer and developer tailwind configs, prioritizing theme.config specifications", () => {
    const consoleSpy = vi.spyOn(console, "warn");
    const result = deepMerge(
      testDeveloperTailwindConfig,
      testMarketerTailwindConfig
    );
    expect(result).toEqual(testMergedConfig);
    expect(consoleSpy).toHaveBeenLastCalledWith(
      "Both theme.config.ts and tailwind.config.ts provided a value for button-primary. Using the value from theme.config.ts (var(--colors-button-primary))"
    );
  });

  test(
    "restructures theme config and merges with developer-specified tailwind config, " +
      "prioritizing theme.config",
    () => {
      const consoleSpy = vi.spyOn(console, "warn");
      const result = themeResolver(
        testDeveloperTailwindConfig,
        testThemeConfig
      );
      expect(result).toEqual(testMergedConfig);
      expect(consoleSpy).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenLastCalledWith(
        "Both theme.config.ts and tailwind.config.ts provided a value for button-primary. Using the value from theme.config.ts (var(--colors-button-primary))"
      );
    }
  );
});
