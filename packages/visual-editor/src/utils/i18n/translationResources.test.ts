import { afterEach, describe, expect, it, vi } from "vitest";
import { i18nPlatformInstance } from "./platform.ts";
import { loadVEPlatformTranslations } from "./platformLoader.ts";
import {
  loadTranslationDictionary,
  mergeTranslationDictionaries,
} from "./translationResources.ts";

afterEach(() => {
  vi.restoreAllMocks();
  i18nPlatformInstance.removeResourceBundle("en", "visual-editor");
});

describe("mergeTranslationDictionaries", () => {
  it("deeply merges repo translations and reports only shape collisions", () => {
    const onShapeCollision = vi.fn();

    const merged = mergeTranslationDictionaries(
      {
        actions: { save: "Save", cancel: "Cancel" },
        heading: "Heading",
        unchanged: "Built in",
      },
      {
        actions: { save: "Store" },
        heading: { label: "Repo heading" },
        custom: "Custom",
      },
      onShapeCollision
    );

    expect(merged).toEqual({
      actions: { save: "Store", cancel: "Cancel" },
      heading: { label: "Repo heading" },
      unchanged: "Built in",
      custom: "Custom",
    });
    expect(onShapeCollision).toHaveBeenCalledTimes(1);
    expect(onShapeCollision).toHaveBeenCalledWith({
      path: "heading",
      builtInType: "string",
      repoType: "object",
    });
  });
});

describe("built-in translation loaders", () => {
  it("loads platform translations", async () => {
    await loadVEPlatformTranslations("en");
    expect(
      i18nPlatformInstance.getResource(
        "en",
        "visual-editor",
        "actions.copyToClipboard"
      )
    ).toBe("Copy to Clipboard");
  });
});

describe("complete translation loaders", () => {
  it.each([
    ["en-GB", "en-GB"],
    ["en_GB", "en-GB"],
    ["EN_gb", "en-GB"],
    ["zh-Hant-HK", "zh-TW"],
    ["zh_Hant_HK", "zh-TW"],
    ["fr-CA", "fr"],
  ])("normalizes %s to %s", async (locale, expectedLocale) => {
    const loader = vi.fn(async () => ({ locale: expectedLocale }));

    await expect(
      loadTranslationDictionary(locale, { [expectedLocale]: loader })
    ).resolves.toEqual({ locale: expectedLocale });
    expect(loader).toHaveBeenCalledOnce();
  });

  it("falls back to English when the requested loader is missing", async () => {
    const error = vi.spyOn(console, "error").mockImplementation(() => {});
    const englishLoader = vi.fn(async () => ({ greeting: "Hello" }));

    await expect(
      loadTranslationDictionary("ko", { en: englishLoader })
    ).resolves.toEqual({ greeting: "Hello" });
    expect(englishLoader).toHaveBeenCalledOnce();
    expect(error).toHaveBeenCalledWith(
      expect.stringContaining("Falling back to en"),
      expect.any(Error)
    );
  });

  it("returns an empty dictionary when English also fails", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    await expect(
      loadTranslationDictionary("fr", {
        fr: vi.fn(async () => {
          throw new Error("French failed");
        }),
        en: vi.fn(async () => {
          throw new Error("English failed");
        }),
      })
    ).resolves.toEqual({});
  });
});
