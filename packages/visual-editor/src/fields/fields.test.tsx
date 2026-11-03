import React from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { CustomField, Fields } from "@puckeditor/core";
import type { BasicSelectorField } from "./BasicSelectorField.tsx";
import {
  toPuckFields,
  type YextFieldMap,
  type YextTransformedProps,
} from "./fields.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import { createYextFieldTransforms } from "./fieldTransforms/index.ts";
import { createItemSource } from "../utils/itemSource/createItemSource.ts";
import type { YextEntityField } from "../editor/yextEntityFieldUtils.ts";
import type { TranslatableString } from "../types/types.ts";
import type { StyledPageSectionValue } from "./styledFields/StyledPageSection.tsx";

type TestProps = {
  title: string;
  choice: string;
  settings: {
    choice: string;
  };
  items: {
    choice: string;
  }[];
};

const basicSelectorField: BasicSelectorField = {
  type: "basicSelector",
  label: "Choice",
  options: [{ label: "One", value: "one" }],
  visible: true,
};

const renderCustomField = (field: CustomField<any>) =>
  field.render({
    field,
    id: "choice",
    name: "choice",
    onChange: () => {},
    readOnly: false,
    value: "one",
  } as any);

describe("toPuckFields", () => {
  it("converts basicSelector fields to custom fields with a render function", () => {
    const fields = toPuckFields<TestProps>({
      choice: basicSelectorField,
    } as any);

    expect(fields.choice.type).toBe("custom");
    expect(fields.choice.visible).toBe(true);
    expect((fields.choice as CustomField<string>).render).toEqual(
      expect.any(Function)
    );
  });

  it("leaves normal Puck fields unchanged", () => {
    const textField = {
      type: "text",
      label: "Title",
    } as const;

    const fields = toPuckFields<TestProps>({
      title: textField,
    } as any);

    expect(fields.title).toBe(textField);
  });

  it("transforms nested objectFields", () => {
    const fields = toPuckFields<TestProps>({
      settings: {
        type: "object",
        objectFields: {
          choice: basicSelectorField,
        },
      },
    } as any);

    const objectField = fields.settings as Extract<
      Fields<TestProps>["settings"],
      { type: "object" }
    >;

    expect(objectField.objectFields.choice.type).toBe("custom");
    expect(
      (objectField.objectFields.choice as CustomField<string>).render
    ).toEqual(expect.any(Function));
  });

  it("transforms nested arrayFields", () => {
    const fields = toPuckFields<TestProps>({
      items: {
        type: "array",
        arrayFields: {
          choice: basicSelectorField,
        },
      },
    } as any);

    const arrayField = fields.items as Extract<
      Fields<TestProps>["items"],
      { type: "array" }
    >;

    expect(arrayField.arrayFields.choice.type).toBe("custom");
    expect(
      (arrayField.arrayFields.choice as CustomField<string>).render
    ).toEqual(expect.any(Function));
  });

  it("passes the original Yext field to YextAutoField from custom render", () => {
    const fields = toPuckFields<TestProps>({
      choice: basicSelectorField,
    } as any);

    const element = renderCustomField(fields.choice as CustomField<string>);

    expect(React.isValidElement(element)).toBe(true);
    expect((element as React.ReactElement).type).toBe(YextAutoField);
    expect((element as React.ReactElement).props.field).toBe(
      basicSelectorField
    );
  });
  it("when field definitions change then the renderer stays the same and uses the new field", (): void => {
    const first = toPuckFields({
      choice: { type: "basicSelector", label: "First", options: [] },
    }).choice as CustomField<string>;
    const second = toPuckFields({
      choice: { type: "basicSelector", label: "Second", options: [] },
    }).choice as CustomField<string>;

    expect(second.render).toBe(first.render);
    expect(
      (renderCustomField(second) as React.ReactElement).props.field.label
    ).toBe("Second");
  });
});

describe("field transforms", () => {
  it.each([
    {
      type: "entityField",
      field: "",
      constantValue: "Fallback",
      expected: "Fallback",
    },
    { type: "entityField", field: "", constantValue: 0, expected: 0 },
    { type: "entityField", field: "", constantValue: false, expected: false },
    { type: "entityField", field: "", constantValue: "", expected: "" },
    {
      type: "entityField",
      field: "",
      constantValue: { defaultValue: "Default", es: "Hola [[name]]" },
      expected: "Hola Store",
    },
    {
      type: "entityField",
      field: "missing",
      constantValue: "Fallback",
      expected: undefined,
    },
    {
      type: "ctaSelector",
      field: "",
      constantValue: {
        label: { es: "Hola [[name]]", defaultValue: "Default" },
        link: "/store",
      },
      expected: { label: "Hola Store", link: "/store" },
    },
  ])(
    "resolves $type with source '$field' and constant $constantValue",
    ({ type, field, constantValue, expected }) => {
      const value = { field, constantValue, constantValueEnabled: false };
      const authored = structuredClone(value);
      const result = createYextFieldTransforms({ name: "Store" }, "es").custom({
        field: {
          type: "custom",
          metadata: { yextField: { type, transform: true } },
        },
        value,
        componentId: "test",
        propName: "value",
        propPath: "value",
        isReadOnly: true,
      });
      expect(result).toEqual(expected);
      expect(value).toEqual(authored);
    }
  );

  it.each(['Store "East"', "Store\\East", "Store\nEast"])(
    "keeps rich-text JSON valid when interpolating %j",
    (name) => {
      const value = {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          defaultValue: {
            html: "<p>[[name]]</p>",
            json: JSON.stringify({
              root: { children: [{ text: "[[name]]" }], count: 1 },
            }),
          },
        },
      };
      const authored = structuredClone(value);
      const result = createYextFieldTransforms({ name }, "en").custom({
        field: toPuckFields({
          value: {
            type: "entityField",
            filter: { types: ["type.rich_text_v2"] },
            transform: true,
          },
        }).value,
        value,
        componentId: "test",
        propName: "value",
        propPath: "value",
        isReadOnly: true,
      });
      expect(result.html).toBe(`<p>${name}</p>`);
      expect(JSON.parse(result.json)).toEqual({
        root: { children: [{ text: name }], count: 1 },
      });
      expect(value).toEqual(authored);
    }
  );

  it.each(['{"text":"[[name]]"', '{ "text": "unchanged" }'])(
    "preserves malformed or uninterpolated JSON: %s",
    (json) => {
      const result = createYextFieldTransforms({ name: "Store" }, "en").custom({
        field: toPuckFields({
          value: {
            type: "entityField",
            filter: { types: ["type.rich_text_v2"] },
            transform: true,
          },
        }).value,
        value: {
          field: "",
          constantValueEnabled: true,
          constantValue: { json },
        },
        componentId: "test",
        propName: "value",
        propPath: "value",
        isReadOnly: true,
      });
      expect(result.json).toBe(json);
    }
  );

  it.each(["linked", "manual", "manual fallback"])(
    "derives repeated field render types and values in %s mode",
    (mode) => {
      type ItemProps = {
        price: YextEntityField<{ value: number; currencyCode: string }>;
        style: StyledPageSectionValue;
        limit: number | string;
        rows: { label: TranslatableString }[];
      };
      const mappingFields = {
        price: {
          type: "entityField",
          filter: { types: ["type.price"] },
          format: "price",
        },
        style: { type: "styledPageSection" },
        limit: {
          type: "optionalNumber",
          hideNumberFieldRadioLabel: "All",
          showNumberFieldRadioLabel: "Limit",
          defaultCustomValue: 1,
        },
        rows: {
          type: "array",
          arrayFields: { label: { type: "translatableString" } },
        },
      } satisfies YextFieldMap<ItemProps>;
      const source = createItemSource<ItemProps, typeof mappingFields>({
        label: "Cards",
        mappingFields,
      });
      const fields = { cards: { ...source.field, transform: true as const } };
      type RenderProps = YextTransformedProps<
        { cards: typeof source.value },
        typeof fields
      >;
      expectTypeOf<RenderProps["cards"][number]["price"]>().toEqualTypeOf<
        string | undefined
      >();
      expectTypeOf<
        RenderProps["cards"][number]["style"]
      >().toEqualTypeOf<React.CSSProperties>();
      expectTypeOf<RenderProps["cards"][number]["limit"]>().toEqualTypeOf<
        number | undefined
      >();
      expectTypeOf<RenderProps["cards"][number]["rows"]>().toEqualTypeOf<
        { label: string }[]
      >();
      const legacySource = createItemSource<{
        title: YextEntityField<TranslatableString>;
      }>({
        label: "Titles",
        mappingFields: {
          title: { type: "entityField", filter: { types: ["type.string"] } },
        },
      });
      type LegacyRenderProps = YextTransformedProps<
        { cards: typeof legacySource.value },
        { cards: typeof legacySource.field & { transform: true } }
      >;
      expectTypeOf<LegacyRenderProps["cards"][number]["title"]>().toEqualTypeOf<
        string | undefined
      >();

      const item: ItemProps = {
        price: {
          field: "price",
          constantValue: { value: 12, currencyCode: "USD" },
          constantValueEnabled: mode !== "linked",
        },
        style: { contentWidth: "960px", verticalPadding: "24px" },
        limit: "all",
        rows: [{ label: { defaultValue: "Hello [[name]]" } }],
      };
      const value = {
        field: mode === "linked" ? "products" : "",
        constantValueEnabled: mode === "manual",
        constantValue: [item],
        mappings: item,
      };
      const authored = structuredClone(value);
      const result = createYextFieldTransforms(
        {
          name: "Store",
          products: [
            { name: "Store", price: { value: 12, currencyCode: "USD" } },
          ],
        },
        "en-US"
      ).custom({
        field: toPuckFields(fields).cards,
        value,
        componentId: "test",
        propName: "cards",
        propPath: "cards",
        isReadOnly: true,
      });
      expect(result).toEqual([
        {
          price: "$12.00",
          style: {
            maxWidth: "960px",
            paddingTop: "24px",
            paddingBottom: "24px",
          },
          limit: undefined,
          rows: [{ label: "Hello Store" }],
        },
      ]);
      expect(value).toEqual(authored);
    }
  );
});
