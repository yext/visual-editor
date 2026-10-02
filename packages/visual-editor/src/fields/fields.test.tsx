import type { YextEntityField } from "../editor/yextEntityFieldUtils.ts";
import type { TranslatableString } from "../types/types.ts";
import React from "react";
import { describe, expect, expectTypeOf, it } from "vitest";
import type { CustomField, Fields, Slot } from "@puckeditor/core";
import type { BasicSelectorField } from "./BasicSelectorField.tsx";
import {
  toPuckFields,
  type YextComponentConfig,
  type YextFields,
} from "./fields.ts";
import { YextAutoField } from "./YextAutoField.tsx";

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
});

it("when a schema contains content and native fields then only content render types change", () => {
  const fields = {
    title: { type: "entityField", filter: { types: ["type.string"] } },
    cards: {
      type: "array",
      arrayFields: {
        label: { type: "translatableString" },
        content: { type: "slot" },
      },
    },
    control: { type: "custom", render: () => <></> },
  } satisfies YextFields<{
    title: YextEntityField<TranslatableString>;
    cards: { label: TranslatableString; content: Slot }[];
    control: YextEntityField<string>;
  }>;
  const component: YextComponentConfig<
    {
      title: YextEntityField<TranslatableString>;
      cards: { label: TranslatableString; content: Slot }[];
      control: YextEntityField<string>;
    },
    typeof fields
  > = {
    fields,
    defaultProps: {
      title: { field: "name", constantValue: { defaultValue: "Title" } },
      cards: [{ label: { defaultValue: "Card" }, content: [] }],
      control: { field: "name", constantValue: "" },
    },
    resolveData: (data) => {
      expectTypeOf(data.props.title).toMatchTypeOf<{
        field?: string;
        constantValue?: TranslatableString;
      }>();
      return data;
    },
    render: ({ title, cards, control }) => {
      expectTypeOf(title).toEqualTypeOf<string | undefined>();
      expectTypeOf(cards[0].label).toEqualTypeOf<string | undefined>();
      expectTypeOf(cards[0].content).toBeFunction();
      expectTypeOf(control).toEqualTypeOf<YextEntityField<string>>();
      return <>{title}</>;
    },
  };
  expect(component.defaultProps?.title.constantValue).toEqual({
    defaultValue: "Title",
  });
  // Authored defaults remain binding objects even though render props are plain strings.
  expectTypeOf<
    NonNullable<typeof component.defaultProps>["title"]
  >().toEqualTypeOf<YextEntityField<TranslatableString>>();
});
