import {
  cleanup,
  fireEvent,
  render as renderComponent,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { Puck } from "@puckeditor/core";
import {
  ThemeFieldControl,
  ThemeFieldsSidebar,
} from "../internal/puck/components/theme-editor-sidebars/ThemeFieldsSidebar.tsx";
import { type ThemeField } from "../internal/theme/themeFields.ts";
import { type FontRegistry } from "../utils/fonts/visualEditorFonts.ts";
import { InternalThemeEditor } from "../internal/components/InternalThemeEditor.tsx";
import { TemplatePropsContext } from "../hooks/useDocument.tsx";
import { generateTemplateMetadata } from "../internal/types/templateMetadata.ts";
import { type ThemeHistories } from "../internal/types/themeData.ts";
import {
  THEME_STYLE_TAG_ID,
  updateThemeInEditor,
} from "../utils/applyTheme.ts";
import React from "react";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
  vi,
} from "vitest";
import type {
  ComponentConfig,
  Config,
  CustomField,
  Fields,
  PuckContext,
  Slot,
  SlotComponent,
} from "@puckeditor/core";
import type { BasicSelectorField } from "./BasicSelectorField.tsx";
import {
  toPuckFields,
  type YextComponentConfig,
  type YextFieldMap,
  type YextTransformedProps,
} from "./fields.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import { createYextFieldTransforms } from "./fieldTransforms/index.ts";
import { createItemSource } from "../utils/itemSource/createItemSource.ts";
import type { YextEntityField } from "../editor/yextEntityFieldUtils.ts";
import type { TranslatableString } from "../types/types.ts";
import type { ComprehensiveCTAValue } from "./styledFields/ComprehensiveCTAField.tsx";
import type { StyledTextValue } from "./styledFields/StyledTextField.tsx";
import type { StyledButtonValue } from "./styledFields/StyledButtonField.tsx";
import type { StyledLinkValue } from "./styledFields/StyledLinkField.tsx";
import type { StyledImageValue } from "./styledFields/StyledImageField.tsx";
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
    { value: undefined, transform: true, expected: {} },
    { value: { borderRadius: "default" }, transform: true, expected: {} },
    {
      value: { borderRadius: "8px" },
      transform: true,
      expected: { borderRadius: "8px" },
    },
    {
      value: { borderRadius: "8px", aspectRatio: 1.78 },
      transform: true,
      expected: { borderRadius: "8px", aspectRatio: 1.78 },
    },
    {
      value: { borderRadius: "default", aspectRatio: 0.75 },
      transform: true,
      expected: { aspectRatio: 0.75 },
    },
    {
      value: { borderRadius: "8px", aspectRatio: "default" },
      transform: true,
      expected: { borderRadius: "8px" },
    },
    {
      value: { borderRadius: "8px", aspectRatio: 0 },
      transform: true,
      expected: { borderRadius: "8px" },
    },
    {
      value: { borderRadius: "8px", aspectRatio: -1 },
      transform: true,
      expected: { borderRadius: "8px" },
    },
    {
      value: { borderRadius: "default", aspectRatio: 1.78 },
      transform: false,
      expected: { borderRadius: "default", aspectRatio: 1.78 },
    },
    {
      value: { borderRadius: "default", aspectRatio: 1.78 },
      transform: undefined,
      expected: { borderRadius: "default", aspectRatio: 1.78 },
    },
  ])(
    "handles styledImage $value with transform=$transform",
    ({ value, transform, expected }) => {
      const authored = structuredClone(value);
      for (const adapted of [false, true]) {
        const fields = {
          style: { type: "styledImage", transform },
        } satisfies YextFieldMap;
        const field = adapted ? toPuckFields(fields).style : fields.style;
        const result = createYextFieldTransforms({}, "en")[field.type]({
          field,
          value,
          componentId: "test",
          propName: "style",
          propPath: "style",
          isReadOnly: true,
        });
        expect(result).toEqual(expected);
        expect(value).toEqual(authored);
        if (!transform) expect(result).toBe(value);
      }
    }
  );

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
      type ComponentRenderProps = Parameters<
        YextComponentConfig<
          { cards: typeof source.value },
          typeof fields
        >["render"]
      >[0];
      expectTypeOf<
        ComponentRenderProps["cards"][number]["style"]
      >().toMatchTypeOf<React.CSSProperties>();
      expectTypeOf<
        ComponentRenderProps["cards"][number]["price"]
      >().toEqualTypeOf<string | undefined>();

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

describe("YextComponentConfig render types", () => {
  it("preserves transformed CSS, authored CTA styles, and Puck slots", () => {
    type StyleProps = {
      text: StyledTextValue;
      button: StyledButtonValue;
      link: StyledLinkValue;
      image: StyledImageValue;
      page: StyledPageSectionValue;
    };
    type Props = StyleProps & {
      nested: StyleProps;
      items: StyleProps[];
      cta: ComprehensiveCTAValue;
      content: Slot;
      slots: { content?: Slot };
    };
    const styleFields = {
      text: { type: "styledText", transform: true },
      button: { type: "styledButton", transform: true },
      link: { type: "styledLink", transform: true },
      image: { type: "styledImage", transform: true },
      page: { type: "styledPageSection", transform: true },
    } satisfies YextFieldMap<StyleProps>;
    const fields = {
      ...styleFields,
      nested: { type: "object", objectFields: styleFields },
      items: { type: "array", arrayFields: styleFields },
      cta: { type: "comprehensiveCTA" },
      content: { type: "slot" },
      slots: {
        type: "object",
        objectFields: { content: { type: "slot" } },
      },
    } satisfies YextFieldMap<Props>;
    type Component = YextComponentConfig<Props, typeof fields>;
    type RenderProps = Parameters<Component["render"]>[0];
    expectTypeOf<
      RenderProps[keyof StyleProps]
    >().toMatchTypeOf<React.CSSProperties>();
    expectTypeOf<
      RenderProps["nested"][keyof StyleProps]
    >().toMatchTypeOf<React.CSSProperties>();
    expectTypeOf<
      RenderProps["items"][number][keyof StyleProps]
    >().toMatchTypeOf<React.CSSProperties>();
    expectTypeOf<RenderProps["cta"]>().toMatchTypeOf<ComprehensiveCTAValue>();
    expectTypeOf<RenderProps["content"]>().toEqualTypeOf<SlotComponent>();
    expectTypeOf<RenderProps["slots"]["content"]>().toEqualTypeOf<
      SlotComponent | undefined
    >();
    expectTypeOf<RenderProps["id"]>().toEqualTypeOf<string>();
    expectTypeOf<RenderProps["puck"]>().toEqualTypeOf<PuckContext>();
    expectTypeOf<
      NonNullable<Component["defaultProps"]>
    >().toEqualTypeOf<Props>();
    type ResolvedData = Parameters<NonNullable<Component["resolveData"]>>[0];
    type PuckResolvedData = Parameters<
      NonNullable<ComponentConfig<Props>["resolveData"]>
    >[0];
    expectTypeOf<ResolvedData>().toEqualTypeOf<PuckResolvedData>();

    // These callbacks are compiled by tsc; no Puck context is needed at runtime.
    const component: Component = {
      fields,
      render: (props) => {
        // @ts-expect-error CSS values must remain constrained after normalization.
        const _invalid: typeof props.text = { display: { invalid: true } };
        return (
          <div style={props.text}>
            <div style={props.nested.image} />
            <div style={props.items[0].link} />
            <div style={props.cta.sx} />
            <props.content />
          </div>
        );
      },
    };
    const registry: Config["components"] = { Example: component };
    expect(registry.Example).toBe(component);
  });

  it("preserves primitive constraints and configs without transform definitions", () => {
    type Brand = string & { readonly brand: unique symbol };
    type Props = {
      cta: ComprehensiveCTAValue;
      variant?: "primary" | "secondary";
      size: 1 | 2;
      count: number & {};
      label: string & {};
      branded: Brand;
      readonlyValues: readonly ("one" | "two")[];
      callback: (value: string) => number;
      date: Date;
      pattern: RegExp;
      error: Error;
    };
    type Component = YextComponentConfig<Props>;
    type RenderProps = Parameters<Component["render"]>[0];
    type PuckRenderProps = Parameters<ComponentConfig<Props>["render"]>[0];
    expectTypeOf<RenderProps["variant"]>().toEqualTypeOf<
      "primary" | "secondary" | undefined
    >();
    expectTypeOf<RenderProps["size"]>().toEqualTypeOf<1 | 2>();
    expectTypeOf<RenderProps["count"]>().toEqualTypeOf<number>();
    expectTypeOf<RenderProps["label"]>().toEqualTypeOf<string>();
    expectTypeOf<RenderProps["branded"]>().toEqualTypeOf<
      PuckRenderProps["branded"]
    >();
    expectTypeOf<RenderProps["readonlyValues"]>().toEqualTypeOf<
      readonly ("one" | "two")[]
    >();
    expectTypeOf<RenderProps["callback"]>().toEqualTypeOf<Props["callback"]>();
    expectTypeOf<RenderProps["date"]>().toEqualTypeOf<Date>();
    expectTypeOf<RenderProps["pattern"]>().toEqualTypeOf<RegExp>();
    expectTypeOf<RenderProps["error"]>().toEqualTypeOf<Error>();
    expectTypeOf<
      NonNullable<Component["defaultProps"]>
    >().toEqualTypeOf<Props>();

    const component: Component = {
      render: (props) => {
        // @ts-expect-error Normalization must not widen literal unions.
        const _invalidVariant: typeof props.variant = "other";
        // @ts-expect-error Branded primitives must not accept plain strings.
        const _invalidBrand: typeof props.branded = "unbranded";
        return <div style={props.cta.sx} />;
      },
    };
    const registry: Config["components"] = { Example: component };
    expect(registry.Example).toBe(component);
  });
});

vi.mock("@puckeditor/core", async (importOriginal) => {
  const original = await importOriginal<typeof import("@puckeditor/core")>();
  const Puck = (props: React.ComponentProps<typeof original.Puck>) => {
    const Header = props.overrides?.header;
    const Fields = props.overrides?.fields;
    return Header && Fields ? (
      <original.Puck {...props} iframe={{ enabled: false }}>
        <Header actions={null} children={null} />
        <original.Puck.Fields />
      </original.Puck>
    ) : (
      <original.Puck {...props} />
    );
  };
  return { ...original, Puck: Object.assign(Puck, original.Puck) };
});

describe("theme editor fields", () => {
  const config = { components: {} };
  const render = (ui: React.ReactNode) => {
    const result = renderComponent(
      <Puck
        config={config}
        data={{}}
        iframe={{ enabled: false }}
        overrides={{ fields: () => <>{ui}</> }}
      >
        <Puck.Fields />
      </Puck>
    );
    (result.container.querySelector(".Puck") as HTMLElement).style.visibility =
      "visible";
    return result;
  };
  beforeEach(() => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const originalError = console.error;
    vi.spyOn(console, "error").mockImplementation((...args) => {
      if (!String(args[0]).includes("Could not parse CSS stylesheet"))
        originalError(...args);
    });
    // react-color uses canvas only to paint its checkerboard preview.
    vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue(null);
  });
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.getElementById(THEME_STYLE_TAG_ID)?.remove();
  });
  const base = { label: "Test", variable: "--arbitrary" } as const;

  describe("theme field controls", () => {
    it.each<ThemeField>([
      { ...base, type: "color", default: "#000000" },
      { ...base, type: "number", default: 12 },
      {
        ...base,
        type: "select",
        default: "one",
        options: [{ label: "One", value: "one" }],
      },
      {
        ...base,
        type: "fontFamily",
        default: "'Open Sans', 'Open Sans Fallback', sans-serif",
      },
      { ...base, type: "fontWeight", default: "400", fontFamilyKey: "family" },
      {
        ...base,
        type: "fontStyle",
        default: "normal",
        fontFamilyKey: "family",
      },
    ])("shows the $type default without saving on mount", (field) => {
      const onChange = vi.fn();
      render(
        <ThemeFieldControl
          fieldKey="test"
          field={field}
          values={{}}
          onChange={onChange}
        />
      );
      expect(onChange).not.toHaveBeenCalled();
      if (field.type === "number")
        expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe(
          "12"
        );
      if (["select", "fontWeight", "fontStyle"].includes(field.type)) {
        const select = screen.getByRole("combobox") as HTMLSelectElement;
        expect(select.selectedOptions[0].label).not.toBe("");
        expect([...select.options].every((option) => option.value !== "")).toBe(
          true
        );
      }
    });

    it("selects an option without adding an empty option", () => {
      const onChange = vi.fn();
      render(
        <ThemeFieldControl
          fieldKey="test"
          field={{
            ...base,
            type: "select",
            default: "one",
            options: [
              { label: "One", value: "one" },
              { label: "Two", value: "two" },
            ],
          }}
          values={{}}
          onChange={onChange}
        />
      );
      const select = screen.getByRole("combobox") as HTMLSelectElement;
      fireEvent.change(select, { target: { value: select.options[1].value } });
      expect(onChange).toHaveBeenLastCalledWith("two");
    });

    it("preserves numeric zero instead of replacing it with the default", () => {
      const onChange = vi.fn();
      render(
        <ThemeFieldControl
          fieldKey="test"
          field={{ ...base, type: "number", default: 12 }}
          values={{ test: 0 }}
          onChange={onChange}
        />
      );
      const input = screen.getByRole("spinbutton") as HTMLInputElement;
      expect(input.value).toBe("0");
      fireEvent.change(input, { target: { value: "4" } });
      expect(onChange).toHaveBeenLastCalledWith(4);
    });

    it("opens a color picker at its default without saving", () => {
      const onChange = vi.fn();
      render(
        <ThemeFieldControl
          fieldKey="test"
          field={{ ...base, type: "color", default: "#000000" }}
          values={{}}
          onChange={onChange}
        />
      );
      const trigger = screen.getByRole("button", { name: "Test" });
      expect((trigger.firstElementChild as HTMLElement).style.background).toBe(
        "rgb(0, 0, 0)"
      );
      fireEvent.click(trigger);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("updates dependent font controls from the selected family", () => {
      const onChange = vi.fn();
      const customFonts: FontRegistry = {
        First: { italics: false, weights: [400], fallback: "sans-serif" },
        Second: { italics: true, weights: [400, 700], fallback: "sans-serif" },
      };
      function Harness() {
        const [family, setFamily] = React.useState("First");
        return (
          <>
            <button onClick={() => setFamily("Second")}>Switch family</button>
            <ThemeFieldControl
              fieldKey="test"
              field={{
                ...base,
                type: "fontWeight",
                default: "400",
                fontFamilyKey: "family",
              }}
              values={{ family }}
              customFonts={customFonts}
              onChange={onChange}
            />
            <ThemeFieldControl
              fieldKey="style"
              field={{
                ...base,
                type: "fontStyle",
                default: "normal",
                fontFamilyKey: "family",
              }}
              values={{ family }}
              customFonts={customFonts}
              onChange={onChange}
            />
          </>
        );
      }
      render(<Harness />);
      const [weight, style] = screen.getAllByRole(
        "combobox"
      ) as HTMLSelectElement[];
      expect([...weight.options].map((option) => option.value)).toEqual([
        "400",
      ]);
      expect([...style.options].map((option) => option.value)).toEqual([
        "normal",
      ]);
      fireEvent.click(screen.getByRole("button", { name: "Switch family" }));
      expect([...weight.options].map((option) => option.value)).toEqual([
        "400",
        "700",
      ]);
      expect([...style.options].map((option) => option.value)).toEqual([
        "normal",
        "italic",
      ]);
      expect(onChange).not.toHaveBeenCalled();
    });

    it("shows the default font and opens its picker without saving", () => {
      const onChange = vi.fn();
      render(
        <ThemeFieldControl
          fieldKey="test"
          field={{
            ...base,
            type: "fontFamily",
            default: "'Open Sans', 'Open Sans Fallback', sans-serif",
          }}
          values={{}}
          onChange={onChange}
        />
      );
      fireEvent.click(screen.getByRole("button", { name: "Open Sans" }));
      expect(screen.getByPlaceholderText("Search fonts...")).toBeTruthy();
      expect(onChange).not.toHaveBeenCalled();
      fireEvent.click(screen.getByRole("button", { name: "Roboto" }));
      expect(onChange).toHaveBeenCalledOnce();
    });

    it("renders visible input labels and translated font options", async () => {
      const onThemeChange = vi.fn();
      render(
        <ThemeFieldsSidebar themeData={{}} onThemeChange={onThemeChange} />
      );
      fireEvent.click(await screen.findByRole("tab", { name: "Typography" }));
      fireEvent.click(
        screen.getByRole("button", { name: "Headline / Page Title" })
      );
      for (const label of [
        "Font Size",
        "Mobile Font Size",
        "Line Height",
        "Mobile Line Height",
        "Letter Spacing",
        "Text Transform",
      ]) {
        const input = screen.getByLabelText(label);
        expect(input.closest("label")?.textContent).toContain(label);
      }
      const options = screen.getAllByRole("option");
      expect(
        options.some((option) => option.textContent === "Bold (700)")
      ).toBe(true);
      expect(options.some((option) => option.textContent === "Italic")).toBe(
        true
      );
      expect(
        options.every(
          (option) => !option.textContent?.includes('"defaultValue"')
        )
      ).toBe(true);
      expect(onThemeChange).not.toHaveBeenCalled();
    });

    it("renders category tabs and nested groups without saving", async () => {
      const onThemeChange = vi.fn();
      const { container } = render(
        <ThemeFieldsSidebar
          themeData={{ "--old": "red" }}
          onThemeChange={onThemeChange}
        />
      );
      expect(
        (await screen.findAllByRole("tab")).map((tab) => tab.textContent)
      ).toEqual(["Colors", "Typography", "Buttons and Links", "Page Styles"]);
      expect(
        screen
          .getByRole("tab", { name: "Colors" })
          .getAttribute("aria-selected")
      ).toBe("true");
      expect(
        screen
          .getByRole("button", { name: "Page" })
          .getAttribute("aria-expanded")
      ).toBe("false");
      expect(screen.queryByRole("button", { name: "Foreground" })).toBeNull();
      fireEvent.click(screen.getByRole("button", { name: "Page" }));
      expect(screen.getByRole("button", { name: "Foreground" })).toBeTruthy();
      expect(container.querySelectorAll("details")).toHaveLength(0);

      fireEvent.click(screen.getByRole("tab", { name: "Buttons and Links" }));
      const primaryButton = screen.getByRole("button", {
        name: "Primary Button",
      });
      expect(primaryButton.getAttribute("aria-expanded")).toBe("false");
      fireEvent.click(primaryButton);
      const primaryFields = within(primaryButton.parentElement!);
      expect(
        primaryFields.queryByRole("button", { name: "Default" })
      ).toBeNull();
      expect(
        primaryFields.getByRole("textbox", { name: "Default Text Decoration" })
      ).toBeTruthy();
      expect(
        primaryFields.getByRole("button", { name: "Default Background Color" })
      ).toBeTruthy();
      for (const state of ["Hover", "Active"]) {
        expect(
          primaryFields
            .getByRole("button", { name: state })
            .getAttribute("aria-expanded")
        ).toBe("false");
      }
      fireEvent.click(primaryFields.getByRole("button", { name: "Hover" }));
      expect(
        primaryFields.getByRole("button", { name: "Hover Background Color" })
      ).toBeTruthy();
      expect(
        primaryFields.getByRole("textbox", { name: "Hover Text Decoration" })
      ).toBeTruthy();

      fireEvent.click(primaryFields.getByRole("button", { name: "Hover" }));
      expect(
        primaryFields.queryByRole("button", { name: "Hover Background Color" })
      ).toBeNull();
      fireEvent.click(screen.getByRole("tab", { name: "Typography" }));
      fireEvent.click(screen.getByRole("tab", { name: "Buttons and Links" }));
      const restoredPrimary = within(
        screen.getByRole("button", { name: "Primary Button" }).parentElement!
      );
      expect(
        restoredPrimary
          .getByRole("button", { name: "Hover" })
          .getAttribute("aria-expanded")
      ).toBe("false");
      expect(
        restoredPrimary
          .getByRole("button", { name: "Active" })
          .getAttribute("aria-expanded")
      ).toBe("false");
      expect(onThemeChange).not.toHaveBeenCalled();
    });

    it("saves a nested placeholder field using its existing flat key", async () => {
      const onThemeChange = vi.fn();
      render(
        <ThemeFieldsSidebar
          themeData={{ colorForeground: "red" }}
          onThemeChange={onThemeChange}
        />
      );
      fireEvent.click(
        await screen.findByRole("tab", { name: "Buttons and Links" })
      );
      fireEvent.click(screen.getByRole("button", { name: "Primary Button" }));
      const primaryFields = within(
        screen.getByRole("button", { name: "Primary Button" }).parentElement!
      );
      fireEvent.click(primaryFields.getByRole("button", { name: "Hover" }));
      fireEvent.change(
        primaryFields.getByRole("textbox", { name: "Hover Text Decoration" }),
        { target: { value: "underline" } }
      );
      expect(onThemeChange).toHaveBeenCalledOnce();
      expect(onThemeChange.mock.calls[0][0]).toMatchObject({
        colorForeground: "red",
        primaryButtonHoverTextDecoration: "underline",
        primaryButtonDefaultTextDecoration: "none",
        primaryButtonActiveTextDecoration: "none",
      });
    });
  });

  const templateProps = { document: {} };
  const historyConfig = {
    components: {},
    root: { fields: { title: { type: "text" as const } } },
  };

  it("keeps key-based values and default fallbacks through undo, redo, save, and publish", async () => {
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }));
    const originalError = console.error;
    vi.spyOn(console, "error").mockImplementation((...args) => {
      if (!String(args[0]).includes("Could not parse CSS stylesheet"))
        originalError(...args);
    });
    const save = vi.fn();
    const publish = vi.fn();
    const metadata = {
      ...generateTemplateMetadata(),
      isDevMode: false,
      isThemeMode: true,
      headDeployStatus: "ACTIVE" as const,
      totalEntityCount: 1,
    };
    function Harness() {
      const [histories, setHistories] = React.useState<ThemeHistories>({
        histories: [
          { id: "root", data: {} },
          { id: "saved", data: JSON.parse('{"colorForeground":"red"}') },
        ],
        index: 1,
      });
      React.useEffect(() => {
        void updateThemeInEditor(
          histories.histories[histories.index].data,
          true
        );
      }, [histories]);
      return (
        <TemplatePropsContext.Provider value={templateProps}>
          <InternalThemeEditor
            puckConfig={historyConfig}
            puckInitialHistory={undefined}
            isLoading={false}
            templateMetadata={metadata}
            publishTheme={publish}
            saveThemeSaveState={save}
            themeHistories={histories}
            setThemeHistories={setHistories}
            clearThemeHistory={vi.fn()}
            sendDevThemeSaveStateData={vi.fn()}
            buildThemeLocalStorageKey={() => "theme-history-test"}
            localDev={false}
          />
        </TemplatePropsContext.Provider>
      );
    }
    const { container } = renderComponent(<Harness />);
    (container.querySelector(".Puck") as HTMLElement).style.visibility =
      "visible";
    await screen.findByRole("tab", { name: "Colors" });
    expect(save).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(() =>
      expect(
        document.getElementById(THEME_STYLE_TAG_ID)?.textContent
      ).toContain("--ve-color-foreground:#000000")
    );
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    await waitFor(() =>
      expect(
        document.getElementById(THEME_STYLE_TAG_ID)?.textContent
      ).toContain("--ve-color-foreground:red")
    );
    fireEvent.click(screen.getByRole("button", { name: "Page" }));
    fireEvent.click(screen.getByRole("button", { name: "Foreground" }));
    fireEvent.click(screen.getByTitle("#D0021B"));
    await waitFor(() => expect(save).toHaveBeenCalledOnce());
    expect(JSON.parse(save.mock.calls[0][0].payload.history)).toMatchObject({
      colorForeground: "#d0021b",
    });
    fireEvent.keyDown(document, { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Undo" }));
    await waitFor(() =>
      expect(
        document.getElementById(THEME_STYLE_TAG_ID)?.textContent
      ).toContain("--ve-color-foreground:red")
    );
    fireEvent.click(screen.getByRole("button", { name: "Redo" }));
    await waitFor(() =>
      expect(
        document.getElementById(THEME_STYLE_TAG_ID)?.textContent
      ).toContain("--ve-color-foreground:#d0021b")
    );
    fireEvent.click(screen.getByRole("button", { name: "Update 1 Page" }));
    expect(
      JSON.parse(publish.mock.calls[0][0].payload.saveThemeData)
    ).toMatchObject({
      colorForeground: "#d0021b",
    });
  });
});
