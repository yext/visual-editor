import { describe, expect, it } from "vitest";
import { type TranslatableCTA } from "../types/types.ts";
import { resolveLocalizedCtas } from "./resolveLocalizedCtas.ts";

const createCta = (
  label: TranslatableCTA["label"],
  link: TranslatableCTA["link"]
): TranslatableCTA => ({
  linkType: "URL",
  label,
  link,
});

describe("resolveLocalizedCtas", () => {
  it.each([
    {
      name: "active-locale values",
      cta: createCta(
        { defaultValue: "Default", fr: "Français" },
        { defaultValue: "/default", fr: "/francais" }
      ),
      expected: { label: "Français", link: "/francais" },
    },
    {
      name: "default values when the active locale is missing",
      cta: createCta({ defaultValue: "Default" }, { defaultValue: "/default" }),
      expected: { label: "Default", link: "/default" },
    },
    {
      name: "legacy string values",
      cta: createCta("Legacy", "/legacy"),
      expected: { label: "Legacy", link: "/legacy" },
    },
  ])("resolves $name", ({ cta, expected }) => {
    expect(resolveLocalizedCtas([cta], "fr")).toMatchObject([expected]);
  });

  it.each([
    {
      name: "empty localized label",
      cta: createCta(
        { defaultValue: "Default", fr: "" },
        { defaultValue: "/default", fr: "/francais" }
      ),
    },
    {
      name: "empty localized link",
      cta: createCta(
        { defaultValue: "Default", fr: "Français" },
        { defaultValue: "/default", fr: "" }
      ),
    },
    {
      name: "whitespace-only localized values",
      cta: createCta(
        { defaultValue: "Default", fr: "  " },
        { defaultValue: "/default", fr: "\t" }
      ),
    },
  ])("omits a CTA with an $name", ({ cta }) => {
    expect(resolveLocalizedCtas([cta], "fr")).toEqual([]);
  });
});
