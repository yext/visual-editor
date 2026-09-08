import { describe, expect, it } from "vitest";
import { resolveLocalizedFooterLinkSection } from "./resolveLocalizedFooterLinkSection.ts";

describe("resolveLocalizedFooterLinkSection", () => {
  it("resolves the section label and removes links that are blank in the active locale", () => {
    const section = {
      label: { defaultValue: "Resources", fr: "Ressources" },
      links: [
        {
          linkType: "URL" as const,
          label: { defaultValue: "About", fr: "À propos" },
          link: { defaultValue: "/about", fr: "/fr/about" },
        },
        {
          linkType: "URL" as const,
          label: { defaultValue: "Careers", fr: "" },
          link: { defaultValue: "/careers", fr: "" },
        },
      ],
    };

    expect(resolveLocalizedFooterLinkSection(section, "fr")).toEqual({
      label: "Ressources",
      links: [
        {
          linkType: "URL",
          label: "À propos",
          link: "/fr/about",
        },
      ],
    });
  });

  it("keeps valid links when the localized section label is blank", () => {
    const section = {
      label: { defaultValue: "Resources", fr: "" },
      links: [
        {
          linkType: "URL" as const,
          label: { defaultValue: "About", fr: "À propos" },
          link: { defaultValue: "/about", fr: "/fr/about" },
        },
      ],
    };

    expect(resolveLocalizedFooterLinkSection(section, "fr")).toMatchObject({
      label: "",
      links: [{ label: "À propos", link: "/fr/about" }],
    });
  });

  it("resolves an entity-backed section label", () => {
    const section = {
      label: {
        field: "",
        constantValue: { defaultValue: "Resources", fr: "Ressources" },
        constantValueEnabled: true,
      },
      links: [],
    };

    expect(resolveLocalizedFooterLinkSection(section, "fr")).toEqual({
      label: "Ressources",
      links: [],
    });
  });
});
