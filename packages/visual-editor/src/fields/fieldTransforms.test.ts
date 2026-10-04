import { describe, expect, it } from "vitest";
import { createPuckFieldTransforms } from "./fieldTransforms.ts";
import { toPuckFields } from "./fields.ts";
import { createItemSource } from "../utils/itemSource/createItemSource.ts";

describe("Yext content transforms", () => {
  it.each([
    {
      name: "mapped text",
      field: { type: "entityField" },
      value: { field: "name", constantValue: "", constantValueEnabled: false },
      expected: "Restaurant",
    },
    {
      name: "localized embedded text",
      field: { type: "translatableString" },
      value: { fr: "Bonjour [[name]]", defaultValue: "Hello" },
      expected: "Bonjour Restaurant",
    },
    {
      name: "empty localized text",
      field: { type: "translatableString" },
      value: { fr: "", defaultValue: "Hello" },
      expected: "",
    },
    {
      name: "false",
      field: { type: "entityField" },
      value: { field: "", constantValue: false, constantValueEnabled: true },
      expected: false,
    },
    {
      name: "zero",
      field: { type: "entityField" },
      value: { field: "", constantValue: 0, constantValueEnabled: true },
      expected: 0,
    },
    {
      name: "rich text data",
      field: { type: "entityField" },
      value: {
        field: "",
        constantValue: { defaultValue: { html: "<p>[[name]]</p>", json: "" } },
        constantValueEnabled: true,
      },
      expected: { html: "<p>Restaurant</p>", json: "" },
    },
    {
      name: "localized image",
      field: { type: "image" },
      value: {
        defaultValue: { url: "/default.jpg" },
        fr: { url: "/fr.jpg", alternateText: { defaultValue: "[[name]]" } },
      },
      expected: { url: "/fr.jpg", alternateText: "Restaurant" },
    },
    {
      name: "CTA",
      field: { type: "ctaSelector" },
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
      field: { type: "code" },
      value: "console.log('[[name]]')",
      expected: "console.log('Restaurant')",
    },
    {
      name: "field without resolution options",
      field: { type: "entityField" },
      value: { field: "name", constantValue: "" },
      expected: "Restaurant",
    },
    {
      name: "style control",
      field: { type: "fontSizeSelector" },
      value: "heading",
      expected: "heading",
    },
    {
      name: "root",
      field: { type: "entityField" },
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

it("when an entity field renders then source-dependent UI can read its binding separately", () => {
  const fieldSources = new Map<string, unknown>();
  const value = {
    field: "address",
    constantValue: {},
    constantValueEnabled: false,
  };
  const transform = createPuckFieldTransforms(
    "en",
    {
      address: { line1: "123 Main Street" },
    },
    fieldSources
  ).custom!;
  const result = transform({
    value,
    field: { type: "custom", yextFieldType: "entityField" } as any,
    componentId: "Address-1",
    propName: "address",
    propPath: "data.address",
    isReadOnly: true,
  });
  expect(result).toEqual({ line1: "123 Main Street" });
  expect(fieldSources.get("Address-1:data.address")).toBe(value);
});

it.each([
  {
    name: "mapped flat image",
    value: { field: "photo", constantValue: {}, constantValueEnabled: false },
    expected: { url: "/photo.jpg", width: 2, height: 1, alternateText: "Page" },
  },
  {
    name: "mapped complex image",
    value: {
      field: "complexPhoto",
      constantValue: {},
      constantValueEnabled: false,
    },
    expected: {
      url: "/complex.jpg",
      width: 2,
      height: 1,
      alternateText: "Page",
    },
  },
  {
    name: "localized static image",
    value: {
      field: "",
      constantValueEnabled: true,
      constantValue: {
        defaultValue: { url: "/default.jpg" },
        fr: { url: "/fr.jpg", alternateText: { defaultValue: "[[name]]" } },
      },
    },
    expected: { url: "/fr.jpg", alternateText: "Page" },
  },
  {
    name: "default static image",
    value: {
      field: "",
      constantValueEnabled: true,
      constantValue: { defaultValue: { url: "/default.jpg" } },
    },
    expected: { url: "/default.jpg", alternateText: "" },
  },
  {
    name: "missing mapped image",
    value: { field: "missing", constantValue: {}, constantValueEnabled: false },
    expected: undefined,
  },
])(
  "when resolving $name then the renderer receives a flat image",
  ({ value, expected }) => {
    const before = structuredClone(value);
    expect(
      createPuckFieldTransforms("fr", {
        name: "Page",
        photo: {
          url: "/photo.jpg",
          width: 2,
          height: 1,
          alternateText: "[[name]]",
        },
        complexPhoto: {
          image: {
            url: "/complex.jpg",
            width: 2,
            height: 1,
            alternateText: { defaultValue: "[[name]]" },
          },
          description: "Unused",
        },
      }).custom!({
        value,
        field: { type: "custom", yextFieldType: "image" } as any,
        componentId: "Image",
        propName: "image",
        propPath: "image",
        isReadOnly: true,
      })
    ).toEqual(expected);
    expect(value).toEqual(before);
  }
);

it("when repeated images resolve then alternate text uses each item's document", () => {
  const source = createItemSource({
    label: "Cards",
    mappingFields: { image: { type: "image" } },
    defaultValues: [],
  });
  expect(
    createPuckFieldTransforms("en", {
      cards: [
        {
          name: "First",
          photo: { image: { url: "/first.jpg", alternateText: "[[name]]" } },
        },
        {
          name: "Second",
          photo: { url: "/second.jpg", alternateText: "[[name]]" },
        },
      ],
    }).custom!({
      value: {
        field: "cards",
        constantValueEnabled: false,
        constantValue: [],
        mappings: {
          image: {
            field: "photo",
            constantValue: {},
            constantValueEnabled: false,
          },
        },
      },
      field: toPuckFields({ cards: source.field }).cards as any,
      componentId: "Cards",
      propName: "cards",
      propPath: "cards",
      isReadOnly: true,
    })
  ).toEqual([
    { image: { url: "/first.jpg", alternateText: "First" } },
    { image: { url: "/second.jpg", alternateText: "Second" } },
  ]);
});

it.each([
  {
    name: "mapped USD price",
    locale: "en-US",
    value: {
      field: "price",
      constantValue: undefined,
      constantValueEnabled: false,
    },
    expected: "$12.50",
  },
  {
    name: "static zero price",
    locale: "en-US",
    value: {
      field: "",
      constantValue: { value: 0, currencyCode: "USD" },
      constantValueEnabled: true,
    },
    expected: "$0.00",
  },
  {
    name: "localized euro price",
    locale: "de-DE",
    value: {
      field: "",
      constantValue: { value: "12.50", currencyCode: "EUR" },
      constantValueEnabled: true,
    },
    expected: "12,50 €",
  },
  {
    name: "missing currency",
    locale: "en-US",
    value: {
      field: "",
      constantValue: { value: 12.5 },
      constantValueEnabled: true,
    },
    expected: undefined,
  },
  {
    name: "invalid amount",
    locale: "en-US",
    value: {
      field: "",
      constantValue: { value: "abc", currencyCode: "USD" },
      constantValueEnabled: true,
    },
    expected: undefined,
  },
  {
    name: "missing mapping",
    locale: "en-US",
    value: {
      field: "missing",
      constantValue: undefined,
      constantValueEnabled: false,
    },
    expected: undefined,
  },
  {
    name: "missing value",
    locale: "en-US",
    value: undefined,
    expected: undefined,
  },
])(
  "when resolving $name then the renderer receives a display price",
  ({ locale, value, expected }) => {
    const before = structuredClone(value);
    const fieldSources = new Map<string, unknown>();
    expect(
      createPuckFieldTransforms(
        locale,
        { price: { value: 12.5, currencyCode: "USD" } },
        fieldSources
      ).custom!({
        value,
        field: { type: "custom", yextFieldType: "price" } as any,
        componentId: "Price-1",
        propName: "price",
        propPath: "data.price",
        isReadOnly: true,
      })
    ).toEqual(expected);
    expect(value).toEqual(before);
    expect(fieldSources.get("Price-1:data.price")).toEqual(value);
  }
);

it("when repeated prices resolve then each item's amount and currency are formatted", () => {
  const source = createItemSource({
    label: "Products",
    mappingFields: { price: { type: "price" } },
    defaultValues: [],
  });
  expect(
    createPuckFieldTransforms("en-US", {
      products: [
        { price: { value: 12.5, currencyCode: "USD" } },
        { price: { value: 0, currencyCode: "USD" } },
      ],
    }).custom!({
      value: {
        ...source.defaultValue,
        field: "products",
        constantValueEnabled: false,
        mappings: {
          price: {
            field: "price",
            constantValue: undefined,
            constantValueEnabled: false,
          },
        },
      },
      field: toPuckFields({ products: source.field }).products as any,
      componentId: "Products-1",
      propName: "products",
      propPath: "products",
      isReadOnly: true,
    })
  ).toEqual([{ price: "$12.50" }, { price: "$0.00" }]);
});
