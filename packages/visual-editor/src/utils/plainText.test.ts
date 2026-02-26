import { describe, expect, it } from "vitest";
import {
  getLocalizedPlainText,
  isRichText,
  richTextHtmlToPlainText,
  richTextToPlainText,
  translatableToPlainText,
} from "./plainText.ts";
import {
  RichText,
  TranslatableRichText,
  TranslatableString,
} from "../types/types.ts";

describe("isRichText", () => {
  it("returns true for rich text objects", () => {
    expect(isRichText({ html: "<p>Hello</p>" })).toBe(true);
  });

  it("returns false for non-rich-text values", () => {
    expect(isRichText("hello")).toBe(false);
    expect(isRichText(null)).toBe(false);
    expect(isRichText({})).toBe(false);
  });
});

describe("richTextHtmlToPlainText", () => {
  it("returns empty string for missing html", () => {
    expect(richTextHtmlToPlainText()).toBe("");
  });

  it("converts html into plain text with normalized whitespace", () => {
    const html =
      "<p>Hello&nbsp;<strong>World</strong></p><div>Second line &amp; more</div><ul><li>One</li><li>Two</li></ul>";

    expect(richTextHtmlToPlainText(html)).toBe(
      "Hello World\nSecond line & more\nOne\nTwo"
    );
  });

  it("decodes original named and numeric replacements", () => {
    const html =
      "<p>Tom &amp; Jerry &#39;quote&#39; &quot;double&quot; &lt;3 &gt;2</p>";

    expect(richTextHtmlToPlainText(html)).toBe(
      `Tom & Jerry 'quote' "double" <3 >2`
    );
  });

  it("decodes common extended named entities", () => {
    const html =
      "<p>&apos;x&apos; &copy; &reg; &trade; &ndash; &mdash; &hellip; &lsquo;y&rsquo; &ldquo;z&rdquo;</p>";

    expect(richTextHtmlToPlainText(html)).toBe(`'x' © ® ™ – — … ‘y’ “z”`);
  });

  it("preserves uncommon unicode characters in rich text", () => {
    const html = "<p>© ® é —</p>";

    expect(richTextHtmlToPlainText(html)).toBe("© ® é —");
  });
});

describe("richTextToPlainText", () => {
  it("returns empty string for undefined", () => {
    expect(richTextToPlainText(undefined)).toBe("");
  });

  it("passes through plain strings", () => {
    expect(richTextToPlainText("Hello")).toBe("Hello");
  });

  it("converts rich text objects to plain text", () => {
    const value: RichText = { html: "<p>Hello <em>there</em></p>" };
    expect(richTextToPlainText(value)).toBe("Hello there");
  });
});

describe("translatableToPlainText", () => {
  it("returns undefined for undefined input", () => {
    expect(translatableToPlainText(undefined)).toBeUndefined();
  });

  it("converts direct rich text input to plain text", () => {
    const value: TranslatableRichText = {
      html: "<p>Bold <strong>text</strong></p>",
    };
    expect(translatableToPlainText(value)).toBe("Bold text");
  });

  it("converts translatable rich text locale values to plain strings", () => {
    const value: TranslatableRichText = {
      hasLocalizedValue: "true",
      en: { html: "<p>Hello [[name]]</p>" },
      fr: "Bonjour",
    };

    expect(translatableToPlainText(value)).toEqual({
      hasLocalizedValue: "true",
      en: "Hello [[name]]",
      fr: "Bonjour",
    });
  });

  it("preserves hasLocalizedValue while converting null and rich text values", () => {
    const value = {
      hasLocalizedValue: "true",
      en: { html: "<p>Hello</p>" },
      es: null,
    } as unknown as TranslatableString;

    expect(translatableToPlainText(value)).toEqual({
      hasLocalizedValue: "true",
      en: "Hello",
      es: "",
    });
  });
});

describe("getLocalizedPlainText", () => {
  it("handles direct string and rich text values", () => {
    expect(getLocalizedPlainText("Hello", "en")).toBe("Hello");
    expect(getLocalizedPlainText({ html: "<p>Hello</p>" }, "en")).toBe("Hello");
  });

  it("returns localized plain text for translatable string", () => {
    const value: TranslatableString = {
      hasLocalizedValue: "true",
      en: "Hello",
      fr: "Bonjour",
    };
    expect(getLocalizedPlainText(value, "fr")).toBe("Bonjour");
  });

  it("returns localized plain text for translatable rich text", () => {
    const value: TranslatableRichText = {
      hasLocalizedValue: "true",
      en: { html: "<p>Hello</p>" },
      fr: { html: "<p>Bonjour <strong>toi</strong></p>" },
    };

    expect(getLocalizedPlainText(value, "fr")).toBe("Bonjour toi");
  });

  it("returns empty string when locale is missing", () => {
    const value: TranslatableString = {
      hasLocalizedValue: "true",
      en: "Hello",
    };

    expect(getLocalizedPlainText(value, "de")).toBe("");
  });
});
