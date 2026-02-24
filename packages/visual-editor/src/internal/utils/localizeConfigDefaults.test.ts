import { beforeEach, describe, expect, it } from "vitest";
import { Config } from "@puckeditor/core";
import { localizeConfigDefaultsForLocale } from "./localizeConfigDefaults.ts";
import { preloadComponentDefaultTranslations } from "../../utils/i18n/componentDefaultResolver.ts";

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
  beforeEach(async () => {
    await preloadComponentDefaultTranslations("fr");
  });

  it("injects missing locale values in component and root defaultProps", () => {
    const config = buildConfig();
    const localized = localizeConfigDefaultsForLocale(config, "fr");

    expect((localized.components.Example.defaultProps as any).title.fr).toBe(
      "Bouton"
    );
    expect((localized.root?.defaultProps as any).rootTitle.fr).toBe("Bouton");
    expect((config.components.Example.defaultProps as any).title.fr).toBe(
      undefined
    );
  });

  it("injects missing locale values in nested field defaultItemProps", () => {
    const config = buildConfig();
    const localized = localizeConfigDefaultsForLocale(config, "fr");
    const localizedFieldDefaults = (localized.components.Example.fields as any)
      .items.defaultItemProps.label;

    expect(localizedFieldDefaults.fr).toBe("Bouton");
    expect(localizedFieldDefaults.en).toBe("Button");
  });

  it("preserves existing locale values", () => {
    const config = buildConfig();
    (config.components.Example.defaultProps as any).title.fr = "Custom Label";

    const localized = localizeConfigDefaultsForLocale(config, "fr");

    expect((localized.components.Example.defaultProps as any).title.fr).toBe(
      "Custom Label"
    );
  });
});
