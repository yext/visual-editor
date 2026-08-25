import React from "react";
import { describe, expect, it } from "vitest";
import {
  normalizeDynamicConfig,
  normalizeDynamicData,
} from "./normalizeDynamicConfig.ts";
import { validateDynamicConfig } from "./validateDynamicConfig.ts";

describe("normalizeDynamicConfig", () => {
  it("converts design-mode annotations into transform-backed authored props", () => {
    const normalized = normalizeDynamicConfig({
      components: {
        MyHero: {
          label: "MyHero",
          html: `<section><h1 data-puck-field-title='{ "type": "testEntityField" }'>Make room for good company</h1><div data-puck-field-description='{ "type": "testRichText" }'><p>Thoughtful spaces.</p></div><div data-puck-field-primarycta='{ "type": "testCTA" }'></div><div data-puck-field-secondarycta='{ "type": "testCTA" }'></div><div data-puck-field-image='{ "type": "testImage" }'></div></section>`,
          styles: ".hero {}",
          streaming: true,
        },
      },
    }) as {
      dynamicConfig: {
        components: Record<string, Record<string, any>>;
      };
      changed: boolean;
    };

    const component = normalized.dynamicConfig.components.MyHero;

    expect(normalized.changed).toBe(true);
    expect(component.streaming).toBeUndefined();
    expect(component.styles).toBe(".hero {}");
    expect(component.html).not.toContain("Make room for good company");
    expect(component.html).not.toContain("Thoughtful spaces.");
    expect(component.fields).toMatchObject({
      title: { type: "testEntityField", output: "plainText" },
      description: { type: "testRichText" },
      image: { type: "testImage" },
      primarycta: { type: "testCTA" },
      secondarycta: { type: "testCTA" },
    });
    expect(component.defaultProps.title).toEqual({
      field: "",
      constantValue: "Make room for good company",
      constantValueEnabled: true,
    });
    expect(component.defaultProps.description.constantValue.en.html).toBe(
      "<p>Thoughtful spaces.</p>"
    );
    expect(component.defaultProps.image.constantValue.url).toContain(
      "images.unsplash.com"
    );
    expect(component.defaultProps.primarycta.constantValue.label.en).toBe(
      "Learn More"
    );
    expect(validateDynamicConfig(normalized.dynamicConfig)).toEqual([]);
  });

  it("replaces empty generated defaults with meaningful constants", () => {
    const normalized = normalizeDynamicConfig({
      components: {
        Hero: {
          label: "Hero",
          html: `<section><h1 data-puck-field-title='{ "type": "testEntityField" }'></h1><div data-puck-field-description='{ "type": "testRichText" }'></div></section>`,
          styles: ".hero {}",
          fields: {
            title: { type: "testEntityField" },
            description: { type: "testRichText" },
          },
          defaultProps: {
            title: {
              field: "",
              constantValue: "",
              constantValueEnabled: true,
            },
            description: {
              field: "",
              constantValue: {
                en: { json: "", html: "<p></p>" },
                hasLocalizedValue: "true",
              },
              constantValueEnabled: true,
            },
          },
        },
      },
    }) as {
      dynamicConfig: { components: Record<string, Record<string, any>> };
    };

    expect(normalized.dynamicConfig.components.Hero.defaultProps).toMatchObject(
      {
        title: { constantValue: "Title", constantValueEnabled: true },
        description: {
          constantValue: { en: { html: "<p>Description</p>" } },
          constantValueEnabled: true,
        },
      }
    );
  });

  it("uses generic defaults for repeated CTA fields", () => {
    const normalized = normalizeDynamicConfig({
      components: {
        Cards: {
          label: "Cards",
          html: `<section><div data-puck-field-card1cta='{ "type": "testCTA" }'></div><div data-puck-field-card2cta='{ "type": "testCTA" }'></div></section>`,
          styles: ".cards {}",
        },
      },
    }) as {
      dynamicConfig: { components: Record<string, Record<string, any>> };
    };

    expect(normalized.dynamicConfig.components.Cards.defaultProps).toEqual({
      card1cta: {
        field: "",
        constantValueEnabled: true,
        selectedType: "textAndLink",
        constantValue: {
          ctaType: "textAndLink",
          label: { en: "Learn More", hasLocalizedValue: "true" },
          link: "/learn-more",
          linkType: "URL",
        },
      },
      card2cta: {
        field: "",
        constantValueEnabled: true,
        selectedType: "textAndLink",
        constantValue: {
          ctaType: "textAndLink",
          label: { en: "Learn More", hasLocalizedValue: "true" },
          link: "/learn-more",
          linkType: "URL",
        },
      },
    });
  });

  it("repairs stale generated component instances without replacing authored values", () => {
    const normalized = normalizeDynamicData(
      {
        root: {
          props: {
            _dynamicConfig: {
              components: {
                Hero: {
                  label: "Hero",
                  html: `<section><h1 data-puck-field-title='{ "type": "testEntityField" }'></h1><div data-puck-field-description='{ "type": "testRichText" }'></div></section>`,
                  styles: ".hero {}",
                },
              },
            },
          },
        },
        content: [
          { type: "Hero", props: { id: "missing-props" } },
          {
            type: "Hero",
            props: {
              id: "authored-props",
              title: {
                field: "",
                constantValue: "Authored title",
                constantValueEnabled: true,
              },
            },
          },
        ],
        zones: {},
      } as any,
      { components: { Hero: { render: () => React.createElement("div") } } }
    );

    expect(normalized.changed).toBe(true);
    expect(normalized.data.content).toMatchObject([
      {
        props: {
          title: { constantValue: "Title", constantValueEnabled: true },
          description: {
            constantValue: { en: { html: "<p>Description</p>" } },
          },
        },
      },
      {
        props: {
          title: { constantValue: "Authored title" },
          description: {
            constantValue: { en: { html: "<p>Description</p>" } },
          },
        },
      },
    ]);
  });
});
