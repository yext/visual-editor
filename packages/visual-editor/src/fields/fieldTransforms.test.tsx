import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { TranslatableAssetImage } from "../types/images.ts";
import type {
  RichText,
  TranslatableRichText,
  TranslatableString,
} from "../types/types.ts";
import type { YextEntityField } from "../editor/YextEntityFieldSelector.tsx";
import { createYextFieldTransforms } from "./fieldTransforms.tsx";
import { RichTextRenderer } from "../components/helpers/index.ts";
import {
  toPuckFields,
  type YextComponentConfig,
  type YextFieldMap,
} from "./fields.ts";

describe("field transforms", () => {
  it.each([
    {
      name: "when a KG field is selected then its value is resolved",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string"] },
      },
      value: { field: "name", constantValue: "Unused" },
      expected: "Restaurant",
    },
    {
      name: "when a linked field is selected then its value is resolved",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string"] },
      },
      value: { field: "linked.name", constantValue: "" },
      expected: "Linked Restaurant",
    },
    {
      name: "when a constant is selected then it is localized and interpolated",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string"] },
      },
      value: {
        field: "name",
        constantValueEnabled: true,
        constantValue: { defaultValue: "Welcome", es: "Hola [[name]]" },
      },
      expected: "Hola Restaurant",
    },
    {
      name: "when a string is translatable then its locale is selected",
      field: { type: "translatableString", transform: true },
      value: { defaultValue: "Welcome", es: "Hola [[name]]" },
      expected: "Hola Restaurant",
    },
    {
      name: "when a locale is absent then the default text is used",
      field: { type: "translatableString", transform: true },
      value: { defaultValue: "Welcome [[name]]" },
      expected: "Welcome Restaurant",
    },
    {
      name: "when localized text is empty then it stays empty",
      field: { type: "translatableString", transform: true },
      value: { defaultValue: "Welcome", es: "" },
      expected: "",
    },
    {
      name: "when a field is missing then its value is undefined",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string"] },
      },
      value: { field: "missing", constantValue: "Unused" },
      expected: undefined,
    },
    {
      name: "when a numeric field is zero then zero is preserved",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.number"] },
      },
      value: { field: "count", constantValue: 99 },
      expected: 0,
    },
    {
      name: "when rich text is localized then resolved HTML and JSON are returned",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.rich_text_v2"] },
      },
      value: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          defaultValue: { html: "<p>Welcome</p>", json: '{"text":"Welcome"}' },
          es: {
            html: "<p>Hola [[name]]</p>",
            json: '{"text":"Hola [[name]]"}',
          },
        },
      },
      expected: {
        html: "<p>Hola Restaurant</p>",
        json: '{"text":"Hola Restaurant"}',
      },
    },
    {
      name: "when a rich-text list is selected then its resolved objects are returned",
      field: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.rich_text_v2"], includeListsOnly: true },
      },
      value: {
        field: "",
        constantValueEnabled: true,
        constantValue: [
          {
            defaultValue: { html: "<p>Hello</p>" },
            es: { html: "<p>Hola [[name]]</p>" },
          },
        ],
      },
      expected: [{ html: "<p>Hola Restaurant</p>" }],
    },
  ])("$name", ({ field, value, expected }) => {
    const authoredValue = structuredClone(value);
    expect(
      createYextFieldTransforms(
        {
          name: "Restaurant",
          linked: [{ name: "Linked Restaurant" }],
          count: 0,
        },
        "es"
      ).custom({
        field,
        value,
        componentId: "hero",
        propName: "title",
        propPath: "title",
        isReadOnly: false,
      })
    ).toEqual(expected);
    expect(value).toEqual(authoredValue);
  });

  it.each([undefined, false])(
    "when transform is %s then authored values retain their identity",
    (transform) => {
      const value = { field: "name", constantValue: { defaultValue: "Title" } };
      expect(
        createYextFieldTransforms({ name: "Restaurant" }, "en").entityField({
          field: toPuckFields({
            title: {
              type: "entityField",
              transform,
              filter: { types: ["type.string"] },
            },
          }).title!,
          value,
          componentId: "hero",
          propName: "title",
          propPath: "title",
          isReadOnly: false,
        })
      ).toBe(value);
    }
  );

  it.each([
    {
      name: "rich text",
      value: { defaultValue: { html: "<p>Hello [[name]]</p>", json: "{}" } },
      expected: { html: "<p>Hello Restaurant</p>", json: "{}" },
      expectedText: "Hello Restaurant",
    },
    {
      name: "a plain string",
      value: { defaultValue: "Hello [[name]]" },
      expected: "Hello Restaurant",
      expectedText: "Hello Restaurant",
    },
    {
      name: "empty content",
      value: undefined,
      expected: undefined,
      expectedText: "",
    },
  ])(
    "when a rich-text field contains $name then it returns resolved data for the shared renderer",
    ({ value, expected, expectedText }) => {
      const data = createYextFieldTransforms(
        { name: "Restaurant" },
        "en"
      ).entityField({
        field: toPuckFields({
          description: {
            type: "entityField",
            transform: true,
            filter: { types: ["type.string", "type.rich_text_v2"] },
          },
        }).description!,
        value: { field: "", constantValue: value, constantValueEnabled: true },
        componentId: "hero",
        propName: "description",
        propPath: "description",
        isReadOnly: true,
      });
      expect(data).toEqual(expected);
      const html = renderToStaticMarkup(
        <RichTextRenderer
          data={data}
          bodyVariant="lg"
          className="hero-description"
        />
      );
      expect(html).toContain(expectedText);
      if (expectedText) {
        expect(html).toContain("hero-description");
      } else {
        expect(html).toBe("");
      }
    }
  );

  it("when a localized image is selected then complex shape and asset metadata are retained", () => {
    const value = {
      field: "",
      constantValueEnabled: true,
      constantValue: {
        defaultValue: { image: { url: "/default.jpg" } },
        es: {
          image: {
            url: "/hero.jpg",
            width: 640,
            height: 360,
            alternateText: { defaultValue: "Image", es: "[[name]]" },
            assetImage: {
              sourceUrl: "/original.jpg",
              transformations: { ROTATION: { degree: 90 } },
            },
          },
        },
      },
    };
    const authoredValue = structuredClone(value);
    expect(
      createYextFieldTransforms({ name: "Restaurant" }, "es").entityField({
        field: toPuckFields({
          image: {
            type: "entityField",
            transform: true,
            filter: { types: ["type.image"] },
          },
        }).image!,
        value,
        componentId: "hero",
        propName: "image",
        propPath: "image",
        isReadOnly: true,
      })
    ).toEqual({
      image: { ...value.constantValue.es.image, alternateText: "Restaurant" },
    });
    expect(value).toEqual(authoredValue);
  });

  it("when a repeated source opts in then it reports the unsupported configuration", () => {
    expect(() =>
      createYextFieldTransforms({}, "en").entityField({
        field: {
          type: "custom",
          metadata: {
            yextField: {
              type: "entityField",
              transform: true,
              repeated: {},
              filter: {},
            },
          },
        },
        value: { field: "items", constantValue: [] },
        componentId: "hero",
        propName: "items",
        propPath: "items",
        isReadOnly: true,
      })
    ).toThrow("Field transforms do not support repeated entity sources.");
  });

  it("when fields opt in then their config derives render types while retaining authored defaults", () => {
    const fields = {
      title: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string"] },
      },
      description: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.string", "type.rich_text_v2"] },
      },
      image: {
        type: "entityField",
        transform: true,
        filter: { types: ["type.image"] },
      },
      label: { type: "translatableString", transform: true },
      untouched: { type: "entityField", filter: { types: ["type.string"] } },
    } satisfies YextFieldMap<{
      title: YextEntityField<TranslatableString>;
      description: YextEntityField<TranslatableRichText>;
      image: YextEntityField<TranslatableAssetImage>;
      label: TranslatableString;
      untouched: YextEntityField<TranslatableString>;
    }>;
    const config: YextComponentConfig<
      {
        title: YextEntityField<TranslatableString>;
        description: YextEntityField<TranslatableRichText>;
        image: YextEntityField<TranslatableAssetImage>;
        label: TranslatableString;
        untouched: YextEntityField<TranslatableString>;
      },
      typeof fields
    > = {
      fields,
      render: ({ title, description, image, label, untouched }) => {
        expectTypeOf(title).toEqualTypeOf<string | undefined>();
        expectTypeOf(description).toEqualTypeOf<
          RichText | string | undefined
        >();
        expectTypeOf(image?.alternateText).toEqualTypeOf<string | undefined>();
        expectTypeOf(label).toEqualTypeOf<string>();
        expectTypeOf(untouched).toMatchTypeOf<
          YextEntityField<TranslatableString>
        >();
        return <RichTextRenderer data={description} />;
      },
    };
    expect(toPuckFields(config.fields!).description.metadata?.yextField).toBe(
      fields.description
    );
  });
});
