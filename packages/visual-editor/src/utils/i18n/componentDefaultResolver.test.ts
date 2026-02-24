import { beforeEach, describe, expect, it, vi } from "vitest";
import { getDefaultRTF } from "../../editor/TranslatableRichTextField.tsx";

const loadResolver = async () => import("./componentDefaultResolver.ts");

describe("componentDefaultResolver", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("returns false when asked to preload an unsupported locale", async () => {
    const { preloadComponentDefaultTranslations } = await loadResolver();
    await expect(preloadComponentDefaultTranslations("zz")).resolves.toBe(
      false
    );
  });

  it("resolves localized text after preloading a locale", async () => {
    const {
      preloadComponentDefaultTranslations,
      resolveLocalizedComponentDefaultValue,
    } = await loadResolver();

    await preloadComponentDefaultTranslations("fr");

    expect(resolveLocalizedComponentDefaultValue("fr", "Button")).toBe(
      "Bouton"
    );
  });

  it("resolves regional locales to supported base locale defaults", async () => {
    const {
      preloadComponentDefaultTranslations,
      resolveLocalizedComponentDefaultValue,
    } = await loadResolver();

    await preloadComponentDefaultTranslations("fr-CA");

    expect(resolveLocalizedComponentDefaultValue("fr-CA", "Button")).toBe(
      "Bouton"
    );
  });

  it("resolves recognized rich text defaults", async () => {
    const {
      preloadComponentDefaultTranslations,
      resolveLocalizedComponentDefaultValue,
    } = await loadResolver();

    await preloadComponentDefaultTranslations("fr");

    const localized = resolveLocalizedComponentDefaultValue(
      "fr",
      getDefaultRTF("Banner Text")
    );

    if (!localized || typeof localized === "string") {
      throw new Error("Expected localized rich text object.");
    }

    expect(localized.html).toContain("Texte de la bannière");
    expect(localized.json).toContain("Texte de la bannière");
  });

  it("skips rich text defaults with unsupported html shape", async () => {
    const {
      preloadComponentDefaultTranslations,
      resolveLocalizedComponentDefaultValue,
    } = await loadResolver();

    await preloadComponentDefaultTranslations("fr");

    expect(
      resolveLocalizedComponentDefaultValue("fr", {
        html: "<p><strong>Banner Text</strong></p>",
        json: "{}",
      })
    ).toBeUndefined();
  });
});
