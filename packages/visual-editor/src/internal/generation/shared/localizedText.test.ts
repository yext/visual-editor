// @vitest-environment node
import { describe, expect, it } from "vitest";
import { z } from "zod";
import { localizedTextState, normalizeGeneratedText } from "./localizedText.ts";

describe("generation locale policy", () => {
  const localized = z
    .object({
      defaultValue: z.string().optional(),
      hasLocalizedValue: z.literal("true").optional(),
    })
    .catchall(z.string().optional());
  const text = z.union([z.string(), localized]);

  it("stores translatable strings in defaultValue and removes inherited translations", () => {
    expect(normalizeGeneratedText("Hello", text)).toEqual({
      defaultValue: "Hello",
    });
    const value = {
      defaultValue: "Hello",
      en: "Hello",
      fr: "Bonjour",
      hasLocalizedValue: "true",
    };
    expect(normalizeGeneratedText(value, text)).toEqual({
      defaultValue: "Hello",
      hasLocalizedValue: "true",
    });
    expect(
      normalizeGeneratedText(value, text, undefined, true, ["en", "fr"])
    ).toEqual(value);
    expect(value.fr).toBe("Bonjour");
    expect(normalizeGeneratedText("A regular property", z.string())).toBe(
      "A regular property"
    );
  });

  it("normalizes direct and localized rich text without modifying its representations", () => {
    const rich = z.object({ html: z.string(), json: z.string() });
    const schema = z.union([
      z.string(),
      rich,
      z.object({ defaultValue: rich }).catchall(rich),
    ]);
    const value = { html: "<p>Hello</p>", json: "serialized document" };
    expect(normalizeGeneratedText(value, schema)).toEqual({
      defaultValue: value,
    });
    expect(
      normalizeGeneratedText(
        {
          defaultValue: value,
          fr: { html: "<p>Bonjour</p>", json: "translated document" },
        },
        schema
      )
    ).toEqual({ defaultValue: value });
  });

  it("rejects locale-only generation instead of silently losing its text", () => {
    expect(() => normalizeGeneratedText({ en: "Hello" }, text)).toThrow(
      "requires defaultValue"
    );
  });

  it("walks arrays while excluding native slots, read-only fields and unrelated object branches", () => {
    const rows = z.array(z.object({ "a/b": text }));
    const config = {
      generation: {
        props: z.object({
          rows,
          protectedRows: rows,
          children: z.array(z.unknown()),
          choice: z.union([z.object({ label: z.string() }), localized]),
        }),
      },
      fields: { children: { type: "slot" as const } },
    };
    const row = { "a/b": { defaultValue: "Hello", fr: "Bonjour" } };
    const props = {
      rows: [row],
      protectedRows: [row],
      children: [{ text: row }],
      choice: { label: "Not localized", fr: "Metadata" },
    };
    expect(
      localizedTextState(props, config, ["fr"], { protectedRows: true })
    ).toEqual([{ path: "/rows/0/a~1b", overrideLocales: ["fr"] }]);
  });

  it("lists every saved override without inferring intent from fallback equality", () => {
    const props = {
      heading: { defaultValue: "Hello", en: "Hello", fr: "Bonjour" },
      manual: { en: "Manually entered" },
    };
    const config = {
      generation: { props: z.object({ heading: text, manual: text }) },
    };
    expect(localizedTextState(props, config, ["en", "fr"])).toEqual([
      { path: "/heading", overrideLocales: ["en", "fr"] },
      { path: "/manual", overrideLocales: ["en"] },
    ]);
    expect(
      localizedTextState(props, config, ["en", "fr"], { heading: true })
    ).toEqual([{ path: "/manual", overrideLocales: ["en"] }]);
    expect(
      localizedTextState(
        props,
        {
          generation: {
            props: z.object({
              heading: z.object({ defaultValue: z.string() }),
            }),
          },
        },
        ["en", "fr"]
      )
    ).toEqual([]);
  });
});
