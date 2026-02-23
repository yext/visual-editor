import { describe, expect, it } from "vitest";
import { defaultRichText, defaultText } from "./defaultContent.ts";
import { componentDefaultRegistry } from "./componentDefaultRegistry.ts";
import { locales } from "./locales.ts";
import { TranslatableRichText, TranslatableString } from "../../types/types.ts";

type LocalizedStringMap = { hasLocalizedValue: "true" } & Record<
  string,
  string
>;

type LocalizedRichTextMap = {
  hasLocalizedValue: "true";
} & Record<string, string | { html?: string; json?: string }>;

describe("defaultContent", () => {
  it("builds a localized TranslatableString across all supported locales", () => {
    const value = defaultText("componentDefaults.text", "Text");
    const localizedValue = value as Exclude<TranslatableString, string> &
      LocalizedStringMap;

    expect(typeof value).toBe("object");
    expect(localizedValue.hasLocalizedValue).toBe("true");
    for (const locale of locales) {
      expect(typeof localizedValue[locale]).toBe("string");
    }
  });

  it("builds localized rich text defaults with html fallback", () => {
    const value = defaultRichText(
      "componentDefaults.bannerText",
      "Banner Text"
    );
    const localizedValue = value as Exclude<TranslatableRichText, string> &
      LocalizedRichTextMap;

    expect(localizedValue.hasLocalizedValue).toBe("true");
    const enValue = localizedValue.en;
    if (typeof enValue === "string") {
      throw new Error("Expected rich text object for en value.");
    }
    expect(enValue.html).toContain("Banner Text");
  });

  it("keeps localized rich text html and json in sync", () => {
    const value = defaultRichText(
      "componentDefaults.bannerText",
      "Banner Text"
    );
    const localizedValue = value as Exclude<TranslatableRichText, string> &
      LocalizedRichTextMap;
    const frValue = localizedValue.fr;
    const expectedFrText =
      componentDefaultRegistry.fr["componentDefaults.bannerText"];

    if (typeof frValue === "string") {
      throw new Error("Expected rich text object for fr value.");
    }

    expect(frValue.html).toContain(expectedFrText);
    expect(frValue.json).toContain(expectedFrText);
  });

  it("does not force bold formatting when enDefault rich text is bold", () => {
    const boldDefault = {
      html: "<p><strong>Banner Text</strong></p>",
      json: "",
    };
    const value = defaultRichText("componentDefaults.bannerText", boldDefault);
    const localizedValue = value as Exclude<TranslatableRichText, string> &
      LocalizedRichTextMap;
    const frValue = localizedValue.fr;

    if (typeof frValue === "string") {
      throw new Error("Expected rich text object for fr value.");
    }

    expect(frValue.html).not.toContain("<strong>");
  });
});
