import { describe, expect, it } from "vitest";
import { createPuckFieldTransforms } from "./fieldTransforms.ts";
import { toPuckFields } from "./fields.ts";
import { createItemSource } from "../utils/itemSource/createItemSource.ts";

describe("Yext content transforms", () => {
  it.each([
    {
      name: "mapped text",
      field: { type: "entityField", resolve: true },
      value: { field: "name", constantValue: "", constantValueEnabled: false },
      expected: "Restaurant",
    },
    {
      name: "localized embedded text",
      field: { type: "translatableString", resolve: true },
      value: { fr: "Bonjour [[name]]", defaultValue: "Hello" },
      expected: "Bonjour Restaurant",
    },
    {
      name: "empty localized text",
      field: { type: "translatableString", resolve: true },
      value: { fr: "", defaultValue: "Hello" },
      expected: "",
    },
    {
      name: "false",
      field: { type: "entityField", resolve: true },
      value: { field: "", constantValue: false, constantValueEnabled: true },
      expected: false,
    },
    {
      name: "zero",
      field: { type: "entityField", resolve: true },
      value: { field: "", constantValue: 0, constantValueEnabled: true },
      expected: 0,
    },
    {
      name: "rich text data",
      field: { type: "entityField", resolve: true },
      value: {
        field: "",
        constantValue: { defaultValue: { html: "<p>[[name]]</p>", json: "" } },
        constantValueEnabled: true,
      },
      expected: { html: "<p>Restaurant</p>", json: "" },
    },
    {
      name: "localized image",
      field: { type: "image", resolve: true },
      value: {
        defaultValue: { url: "/default.jpg" },
        fr: { url: "/fr.jpg", alternateText: { defaultValue: "[[name]]" } },
      },
      expected: { url: "/fr.jpg", alternateText: "Restaurant" },
    },
    {
      name: "CTA",
      field: { type: "ctaSelector", resolve: true },
      value: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          label: { fr: "Voir", hasLocalizedValue: "true" },
          link: "/[[slug]]",
          ctaType: "textAndLink",
        },
      },
      expected: { label: "Voir", link: "/restaurant", ctaType: "textAndLink" },
    },
    {
      name: "code",
      field: { type: "code", resolve: true },
      value: "console.log('[[name]]')",
      expected: "console.log('Restaurant')",
    },
    {
      name: "unconfigured field",
      field: { type: "entityField" },
      value: { field: "name", constantValue: "" },
      expected: { field: "name", constantValue: "" },
    },
    {
      name: "style control",
      field: { type: "fontSizeSelector", resolve: true },
      value: "heading",
      expected: "heading",
    },
    {
      name: "root",
      field: { type: "entityField", resolve: true },
      value: { field: "name", constantValue: "" },
      componentId: "root",
      expected: { field: "name", constantValue: "" },
    },
  ])(
    "when resolving $name then authored data is preserved",
    ({ field, value, expected, componentId }) => {
      const before = structuredClone(value);
      const transform = createPuckFieldTransforms("fr", {
        name: "Restaurant",
        slug: "restaurant",
      }).custom!;
      expect(
        transform({
          value,
          field: { ...field, type: "custom", yextFieldType: field.type } as any,
          componentId: componentId ?? "Hero",
          propName: "content",
          propPath: "content",
          isReadOnly: true,
        })
      ).toEqual(expected);
      expect(value).toEqual(before);
    }
  );

  it("when item sources use manual or linked data then mappings resolve in the right context", () => {
    const source = createItemSource<{
      title: {
        field: string;
        constantValue: string;
        constantValueEnabled: boolean;
      };
    }>({
      label: "Cards",
      resolve: true,
      mappingFields: {
        title: { type: "entityField", filter: { types: ["type.string"] } },
      },
      defaultValues: [
        {
          title: {
            field: "",
            constantValue: "[[name]]",
            constantValueEnabled: true,
          },
        },
      ],
    });
    const transform = createPuckFieldTransforms("en", {
      name: "Page",
      cards: [{ name: "First" }, { name: "Second" }],
    }).custom!;
    const field = toPuckFields({ cards: source.field }).cards;
    for (const { value, expected } of [
      { value: undefined, expected: [] },
      { value: source.defaultValue, expected: [{ title: "Page" }] },
      {
        value: {
          field: "cards",
          constantValueEnabled: false,
          constantValue: [],
          mappings: {
            title: {
              field: "name",
              constantValue: "",
              constantValueEnabled: false,
            },
          },
        },
        expected: [{ title: "First" }, { title: "Second" }],
      },
    ]) {
      expect(
        transform({
          value,
          field: field as any,
          componentId: "Cards",
          propName: "cards",
          propPath: "cards",
          isReadOnly: true,
        })
      ).toEqual(expected);
    }
  });

  it("when a composite CTA resolves then actions and styles remain intact", () => {
    const value = {
      data: {
        actionType: "button",
        cta: {
          field: "cta",
          constantValue: { label: "", link: "" },
          constantValueEnabled: false,
          selectedType: "getDirections",
        },
        buttonText: { fr: "Visiter [[name]]", hasLocalizedValue: "true" },
        ariaLabel: { defaultValue: "Visit [[name]]" },
        customId: "visit",
        dataAttributes: [{ key: "action", value: "visit" }],
        openInNewTab: true,
      },
      styles: { variant: "link", presetImage: "app-store" },
    };
    const before = structuredClone(value);
    const transform = createPuckFieldTransforms("fr", {
      name: "Restaurant",
      cta: { label: "Directions", link: "/directions" },
    }).custom!;
    expect(
      transform({
        value,
        field: {
          type: "custom",
          yextFieldType: "comprehensiveCTA",
          resolve: true,
        } as any,
        componentId: "Hero",
        propName: "cta",
        propPath: "cta",
        isReadOnly: true,
      })
    ).toMatchObject({
      data: {
        actionType: "button",
        cta: {
          label: "Get Directions",
          link: "/directions",
          ctaType: "getDirections",
        },
        buttonText: "Visiter Restaurant",
        ariaLabel: "Visit Restaurant",
        customId: "visit",
        dataAttributes: [{ key: "action", value: "visit" }],
        openInNewTab: true,
      },
      styles: value.styles,
    });
    expect(value).toEqual(before);
  });
});
