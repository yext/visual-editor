import { describe, expect, it } from "vitest";
import {
  validateDynamicComponent,
  validateDynamicConfig,
} from "./validateDynamicConfig.ts";

const validComponent = {
  label: "Example Hero",
  html: `<section><div data-puck-field-image='{ "type": "testImage" }'></div><h1 data-puck-field-title='{ "type": "testEntityField" }'></h1><div data-puck-field-description='{ "type": "testRichText" }'></div><div data-puck-field-primarycta='{ "type": "testCTA" }'></div><div data-puck-field-secondarycta='{ "type": "testCTA" }'></div></section>`,
  styles: ".example {}",
  fields: {
    title: { type: "testEntityField", label: "Title" },
    description: { type: "testRichText", label: "Description" },
    image: { type: "testImage", label: "Image" },
    primarycta: { type: "testCTA", label: "Primary CTA" },
    secondarycta: { type: "testCTA", label: "Secondary CTA" },
  },
  defaultProps: {
    title: { field: "name", constantValue: "", constantValueEnabled: false },
    description: {
      field: "",
      constantValue: {
        en: { json: "", html: "<p>[[name]]</p>" },
        hasLocalizedValue: "true",
      },
      constantValueEnabled: true,
    },
    image: {
      field: "",
      constantValueEnabled: true,
      constantValue: { url: "https://example.com/image.jpg" },
    },
    primarycta: {
      field: "",
      constantValueEnabled: true,
      constantValue: { label: { en: "Book Now" } },
    },
    secondarycta: {
      field: "",
      constantValueEnabled: true,
      constantValue: { label: { en: "Learn More" } },
    },
  },
};

describe("validateDynamicConfig", () => {
  it("accepts a complete transform-backed component registration", () => {
    expect(
      validateDynamicConfig({ components: { ExampleHero: validComponent } })
    ).toEqual([]);
  });

  it("rejects an incomplete streamed registration with field metadata in HTML", () => {
    const errors = validateDynamicComponent("SuperHero", {
      ...validComponent,
      html: `<section><h1 data-puck-field-title='{ "type": "testEntityField", "label": "Title" }'></h1>`,
      streaming: true,
      fields: undefined,
      defaultProps: undefined,
    });

    expect(errors).toContain(
      "SuperHero HTML must have one balanced root element."
    );
    expect(errors).toContain(
      "SuperHero must not be registered while streaming."
    );
    expect(errors).toContain("SuperHero must define fields.");
    expect(errors).toContain("SuperHero must define defaultProps.");
    expect(errors).toContain(
      "SuperHero title must use exactly one supported test field type."
    );
  });

  it("rejects slots and mismatched field contracts", () => {
    const errors = validateDynamicComponent("ExampleHero", {
      ...validComponent,
      html: `<section data-puck-slot="content"><h1 data-puck-field-title='{ "type": "testEntityField" }'></h1></section>`,
      fields: { title: { type: "testCTA" } },
      defaultProps: {},
    });

    expect(errors).toContain("ExampleHero must not use slots.");
    expect(errors).toContain("ExampleHero is missing defaultProps for title.");
  });

  it("rejects blank authored defaults", () => {
    const errors = validateDynamicComponent("ExampleHero", {
      ...validComponent,
      defaultProps: {
        ...validComponent.defaultProps,
        title: {
          field: "",
          constantValue: "",
          constantValueEnabled: true,
        },
      },
    });

    expect(errors).toContain(
      "ExampleHero title must have a non-empty default value."
    );
  });
});
