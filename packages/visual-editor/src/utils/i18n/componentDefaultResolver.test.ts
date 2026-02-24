import { describe, expect, it } from "vitest";
import { getDefaultRTF } from "../../editor/TranslatableRichTextField.tsx";
import { getTranslations } from "./getTranslations.ts";
import {
  getComponentDefaultsFromTranslations,
  normalizeComponentDefaultLocale,
  resolveLocalizedComponentDefaultValue,
} from "./componentDefaultResolver.ts";

describe("componentDefaultResolver", () => {
  it("normalizes and validates component default locales", () => {
    expect(normalizeComponentDefaultLocale("fr-CA")).toBe("fr-CA");
    expect(normalizeComponentDefaultLocale("")).toBeUndefined();
    expect(normalizeComponentDefaultLocale("zz")).toBeUndefined();
  });

  it("extracts flattened component defaults from translations", async () => {
    const translations = await getTranslations("fr", "components");
    const defaults = getComponentDefaultsFromTranslations(translations);
    expect(defaults["componentDefaults.button"]).toBe("Bouton");
    expect(defaults["componentDefaults.bannerText"]).toBe(
      "Texte de la bannière"
    );
  });

  it("resolves localized text using provided component defaults", async () => {
    const translations = await getTranslations("fr", "components");
    const defaults = getComponentDefaultsFromTranslations(translations);
    expect(resolveLocalizedComponentDefaultValue("Button", defaults)).toBe(
      "Bouton"
    );
  });

  it("resolves recognized rich text defaults", async () => {
    const translations = await getTranslations("fr", "components");
    const defaults = getComponentDefaultsFromTranslations(translations);

    const localized = resolveLocalizedComponentDefaultValue(
      getDefaultRTF("Banner Text"),
      defaults
    );

    if (!localized || typeof localized === "string") {
      throw new Error("Expected localized rich text object.");
    }

    expect(localized.html).toContain("Texte de la bannière");
    expect(localized.json).toContain("Texte de la bannière");
  });

  it("returns undefined when localized defaults are missing", () => {
    expect(resolveLocalizedComponentDefaultValue("Button", {})).toBeUndefined();
  });

  it("skips rich text defaults with unsupported html shape", async () => {
    const translations = await getTranslations("fr", "components");
    const defaults = getComponentDefaultsFromTranslations(translations);

    expect(
      resolveLocalizedComponentDefaultValue(
        {
          html: "<p><strong>Banner Text</strong></p>",
          json: "{}",
        },
        defaults
      )
    ).toBeUndefined();
  });
});
