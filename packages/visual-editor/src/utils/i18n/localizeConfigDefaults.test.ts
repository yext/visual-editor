import { beforeEach, describe, expect, it } from "vitest";
import { Config } from "@puckeditor/core";
import { localizeConfigDefaultsForLocale } from "./localizeConfigDefaults.ts";
import { getTranslations } from "./getTranslations.ts";

const buildConfig = (): Config =>
  ({
    components: {
      Example: {
        label: "Example",
        fields: {
          items: {
            type: "array",
            defaultItemProps: {
              label: {
                hasLocalizedValue: "true",
                en: "Button",
              },
            },
          },
        },
        defaultProps: {
          title: {
            hasLocalizedValue: "true",
            en: "Button",
          },
        },
        render: () => ({}) as any,
      },
    },
    root: {
      fields: {},
      defaultProps: {
        rootTitle: {
          hasLocalizedValue: "true",
          en: "Button",
        },
      },
    },
  }) as unknown as Config;

describe("localizeConfigDefaultsForLocale", () => {
  let frTranslations: Record<string, unknown>;
  let esTranslations: Record<string, unknown>;

  beforeEach(async () => {
    frTranslations = (await getTranslations("fr", "components")) as Record<
      string,
      unknown
    >;
    esTranslations = (await getTranslations("es", "components")) as Record<
      string,
      unknown
    >;
  });

  it("injects missing locale values in component and root defaultProps", () => {
    const config = buildConfig();
    const localized = localizeConfigDefaultsForLocale(
      config,
      "fr",
      frTranslations
    );

    expect(localized).toBe(config);
    expect((localized.components.Example.defaultProps as any).title.fr).toBe(
      "Bouton"
    );
    expect((localized.root?.defaultProps as any).rootTitle.fr).toBe("Bouton");
    expect((config.components.Example.defaultProps as any).title.fr).toBe(
      "Bouton"
    );
  });

  it("injects missing locale values in nested field defaultItemProps", () => {
    const config = buildConfig();
    const localized = localizeConfigDefaultsForLocale(
      config,
      "fr",
      frTranslations
    );
    const localizedFieldDefaults = (localized.components.Example.fields as any)
      .items.defaultItemProps.label;

    expect(localizedFieldDefaults.fr).toBe("Bouton");
    expect(localizedFieldDefaults.en).toBe("Button");
  });

  it("preserves existing locale values", () => {
    const config = buildConfig();
    (config.components.Example.defaultProps as any).title.fr = "Custom Label";

    const localized = localizeConfigDefaultsForLocale(
      config,
      "fr",
      frTranslations
    );

    expect((localized.components.Example.defaultProps as any).title.fr).toBe(
      "Custom Label"
    );
  });

  it("returns config unchanged when translations are unavailable", () => {
    const config = buildConfig();
    const localized = localizeConfigDefaultsForLocale(config, "fr", undefined);
    expect(localized).toBe(config);
  });

  it("supports repeated per-locale localization without overwriting", () => {
    const config = buildConfig();
    const localizedFr = localizeConfigDefaultsForLocale(
      config,
      "fr",
      frTranslations
    );
    const localizedEs = localizeConfigDefaultsForLocale(
      localizedFr,
      "es",
      esTranslations
    );

    expect((localizedEs.components.Example.defaultProps as any).title.fr).toBe(
      "Bouton"
    );
    expect((localizedEs.components.Example.defaultProps as any).title.es).toBe(
      "Botón"
    );
    expect((localizedEs.root?.defaultProps as any).rootTitle.fr).toBe("Bouton");
    expect((localizedEs.root?.defaultProps as any).rootTitle.es).toBe("Botón");
  });
});
