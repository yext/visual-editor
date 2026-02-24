import { describe, expect, it } from "vitest";
import { defaultRichText, defaultText } from "./defaultContent.ts";
import { TranslatableRichText, TranslatableString } from "../../types/types.ts";

type LocalizedStringMap = { hasLocalizedValue: "true" } & Record<
  string,
  string
>;

type LocalizedRichTextMap = {
  hasLocalizedValue: "true";
} & Record<string, string | { html?: string; json?: string }>;

describe("defaultContent", () => {
  it("builds a translatable string seeded only with en", () => {
    const value = defaultText("componentDefaults.text", "Text");
    const localizedValue = value as Exclude<TranslatableString, string> &
      LocalizedStringMap;

    expect(typeof value).toBe("object");
    expect(localizedValue.hasLocalizedValue).toBe("true");
    expect(localizedValue.en).toBe("Text");
    expect(localizedValue.fr).toBeUndefined();
  });

  it("builds rich text defaults with en html", () => {
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
    expect(enValue.json).toContain("Banner Text");
    expect(localizedValue.fr).toBeUndefined();
  });

  it("preserves provided en rich text object", () => {
    const boldDefault = {
      html: "<p><strong>Banner Text</strong></p>",
      json: '{"root":{}}',
    };
    const value = defaultRichText("componentDefaults.bannerText", boldDefault);
    const localizedValue = value as Exclude<TranslatableRichText, string> &
      LocalizedRichTextMap;
    const enValue = localizedValue.en;

    if (typeof enValue === "string") {
      throw new Error("Expected rich text object for en value.");
    }

    expect(enValue.html).toContain("<strong>Banner Text</strong>");
    expect(enValue.json).toContain('{"root":{}}');
  });
});
