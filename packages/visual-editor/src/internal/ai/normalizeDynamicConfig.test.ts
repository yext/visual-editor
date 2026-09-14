import React from "react";
import { describe, expect, it, vi } from "vitest";
import {
  normalizeDynamicConfig,
  normalizeDynamicData,
  normalizePuckDynamicData,
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

  it("repairs omitted field metadata and image values from generated markup", () => {
    const normalized = normalizeDynamicConfig({
      components: {
        Cards: {
          label: "Cards",
          html: `<section><img class="card-image" src="https://example.com/one.jpg" alt="First card" data-puck-field-card-one-image='{ "type": "testImage" }' /></section>`,
          styles: ".cards {}",
          fields: { "card-one-image": { type: "testImage" } },
          defaultProps: { "card-one-image": {} },
        },
      },
    }) as {
      dynamicConfig: { components: Record<string, Record<string, any>> };
    };

    expect(normalized.dynamicConfig.components.Cards.fields).toEqual({
      "card-one-image": {
        type: "testImage",
        label: "Card One Image",
        filter: { types: ["type.image"] },
      },
    });
    expect(
      normalized.dynamicConfig.components.Cards.defaultProps["card-one-image"]
        .constantValue
    ).toEqual({
      url: "https://example.com/one.jpg",
      alternateText: "First card",
    });
    expect(normalized.dynamicConfig.components.Cards.html).toBe(
      `<section><div class="card-image" data-puck-field-card-one-image='{ "type": "testImage" }'></div></section>`
    );
  });

  it("repairs malformed non-empty AI field values before selection", () => {
    const normalized = normalizeDynamicConfig({
      components: {
        SuperHero: {
          label: "SuperHero",
          html: `<section><h1 data-puck-field-title='{ "type": "testEntityField", "constantValue": "Make room" }'>Make room</h1><div data-puck-field-description='{ "type": "testRichText", "constantValue": { "en": { "html": "<p>Thoughtful spaces.</p>" }, "hasLocalizedValue": "" } }'><p>Thoughtful spaces.</p></div><a href="/explore" data-puck-field-href="cta.link" data-puck-field-cta='{ "type": "testCTA", "constantValue": { "label": { "en": "Explore", "hasLocalizedValue": "" } } }'>Explore</a><img src="https://example.com/hero.jpg" alt="Hero" data-puck-field-src="image.src" data-puck-field-alt="image.alt" data-puck-field-image='{ "type": "testImage" }' /></section>`,
          styles: ".super-hero {}",
          fields: {
            title: { type: "testEntityField" },
            description: { type: "testRichText" },
            cta: { type: "object", objectFields: { link: { type: "text" } } },
            image: {
              type: "object",
              objectFields: {
                src: { type: "text" },
                alt: { type: "text" },
              },
            },
          },
          defaultProps: {
            title: {
              field: "title",
              constantValueEnabled: true,
              constantValue: "Make room",
            },
            description: {
              field: "description",
              constantValueEnabled: true,
              constantValue: {
                en: { html: "<p>Thoughtful spaces.</p>", json: "" },
                hasLocalizedValue: "",
              },
            },
            cta: { link: "/explore" },
            image: { src: "https://example.com/hero.jpg", alt: "Hero" },
          },
        },
      },
    }) as {
      dynamicConfig: { components: Record<string, Record<string, any>> };
    };

    const component = normalized.dynamicConfig.components.SuperHero;
    expect(component.fields).toMatchObject({
      title: { type: "testEntityField", output: "plainText" },
      description: { type: "testRichText" },
      cta: { type: "testCTA" },
      image: { type: "testImage" },
    });
    expect(component.defaultProps.description.constantValue).toMatchObject({
      en: { html: "<p>Thoughtful spaces.</p>" },
      hasLocalizedValue: "true",
    });
    expect(component.defaultProps.cta.constantValue).toMatchObject({
      ctaType: "textAndLink",
      label: { en: "Explore", hasLocalizedValue: "true" },
      link: "/explore",
      linkType: "URL",
    });
    expect(component.html).not.toMatch(/data-puck-field-(?:href|src|alt)=/);
    expect(validateDynamicConfig(normalized.dynamicConfig)).toEqual([]);
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

  it("does not remove generated components that remain invalid after normalization", () => {
    const dispatch = vi.fn();
    normalizePuckDynamicData({
      appState: {
        data: {
          root: {
            props: {
              _dynamicConfig: {
                components: {
                  InvalidHero: {
                    label: "Invalid Hero",
                    html: "<section>Unbound content</section>",
                    styles: ".invalid-hero {}",
                    fields: {},
                    defaultProps: {},
                  },
                },
              },
            },
          },
          content: [{ type: "InvalidHero", props: { id: "invalid-hero" } }],
          zones: {},
        },
      },
      config: {
        components: {
          InvalidHero: { render: () => React.createElement("div") },
        },
      },
      dispatch,
    } as any);

    expect(dispatch).not.toHaveBeenCalled();
  });
});
