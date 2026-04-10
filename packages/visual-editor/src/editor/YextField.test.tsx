import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { YextAutoField } from "../fields/YextAutoField.tsx";
import { msg } from "../utils/i18n/platform.ts";
import { afterEach, describe, expect, it, vi } from "vitest";
import { YextField } from "./YextField.tsx";
import { ThemeOptions } from "../utils/themeConfigOptions.ts";
import { VIDEO_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Video.tsx";
import { IMAGE_CONSTANT_CONFIG } from "../internal/puck/constant-value-fields/Image.tsx";

const {
  dynamicOptionsSelectorMock,
  dynamicOptionsSingleSelectorMock,
  optionalNumberFieldMock,
  translatableStringFieldMock,
  yextEntityFieldSelectorMock,
} = vi.hoisted(() => ({
  dynamicOptionsSelectorMock: vi.fn(),
  dynamicOptionsSingleSelectorMock: vi.fn(),
  optionalNumberFieldMock: vi.fn(),
  translatableStringFieldMock: vi.fn(),
  yextEntityFieldSelectorMock: vi.fn(),
}));

vi.mock("./DynamicOptionsSelector.tsx", () => ({
  DynamicOptionsSelector: dynamicOptionsSelectorMock,
  DynamicOptionsSingleSelector: dynamicOptionsSingleSelectorMock,
}));

vi.mock("./OptionalNumberField.tsx", () => ({
  OptionalNumberField: optionalNumberFieldMock,
}));

vi.mock("./TranslatableStringField.tsx", () => ({
  TranslatableStringField: translatableStringFieldMock,
}));

vi.mock("./YextEntityFieldSelector.tsx", () => ({
  YextEntityFieldSelector: yextEntityFieldSelectorMock,
}));

const renderCustomField = (field: any, value?: any) => {
  const onChange = vi.fn();

  render(
    <YextAutoField
      field={field}
      id="test-field"
      onChange={onChange}
      value={value}
    />
  );

  return { onChange };
};

const createCustomField = () => ({
  type: "custom" as const,
  render: vi.fn(() => null),
});

afterEach(() => {
  vi.resetAllMocks();
});

describe("YextField", () => {
  it("returns a basicSelector field for searchable select inputs", () => {
    const field = YextField<string>(msg("fields.variant", "Variant"), {
      type: "select",
      hasSearch: true,
      options: [
        { label: "Alpha", value: "alpha" },
        { label: "Beta", value: "beta" },
      ],
    });

    expect(field.type).toBe("basicSelector");
  });

  it("uses theme options for searchable select inputs with string option keys", () => {
    const fieldName = msg("fields.headingLevel", "Heading Level");

    const field = YextField(fieldName, {
      type: "select",
      hasSearch: true,
      options: "HEADING_LEVEL",
    });

    expect(field).toEqual({
      type: "basicSelector",
      label: fieldName,
      options: ThemeOptions.HEADING_LEVEL,
    });
  });

  it("renders searchable select fields through YextAutoField", () => {
    const field = YextField<string>(msg("fields.variant", "Variant"), {
      type: "select",
      hasSearch: true,
      options: [
        { label: "Alpha", value: "alpha" },
        { label: "Beta", value: "beta" },
      ],
    });

    const { onChange } = renderCustomField(field, "alpha");

    expect(screen.getByRole("combobox").textContent).toContain("Alpha");

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getByPlaceholderText("Search")).toBeDefined();

    fireEvent.click(screen.getByText("Beta"));

    expect(onChange).toHaveBeenCalledWith("beta");
  });

  it("returns a code field and renders it through YextAutoField", () => {
    const field = YextField<string>(msg("fields.html", "HTML"), {
      type: "code",
      codeLanguage: "html",
    });

    expect(field.type).toBe("code");

    renderCustomField(field, "<div>Alpha</div>");

    expect(screen.getByText("HTML")).toBeDefined();
    expect(screen.getByRole("button").textContent).toContain(
      "<div>Alpha</div>"
    );
  });

  it.each([
    ["BACKGROUND_COLOR", "Recommended Colors"],
    ["SITE_COLOR", "Recommended Color"],
  ] as const)(
    "renders %s grouped options without search",
    (optionKey, expectedHeading) => {
      const field = YextField(msg("fields.color", "Color"), {
        type: "select",
        options: optionKey,
      });

      expect(field.type).toBe("basicSelector");

      renderCustomField(field);

      fireEvent.click(screen.getByRole("combobox"));

      expect(screen.queryByPlaceholderText("Search")).toBeNull();
      expect(screen.getByText(expectedHeading)).toBeDefined();
    }
  );

  it.each([
    ["select", "HEADING_LEVEL", ThemeOptions.HEADING_LEVEL],
    ["radio", "ALIGNMENT", ThemeOptions.ALIGNMENT],
  ] as const)(
    "maps %s fields with theme option keys to Puck config",
    (fieldType, optionKey, options) => {
      const fieldName = msg(`fields.${fieldType}`, fieldType);

      const field = YextField(fieldName, {
        type: fieldType,
        options: optionKey,
        visible: false,
      } as any);

      expect(field).toEqual({
        label: fieldName,
        visible: false,
        type: fieldType,
        options,
      });
    }
  );

  it.each([
    [{ type: "text" }, "text"],
    [{ type: "text", isMultiline: true, visible: false }, "textarea"],
  ] as const)("maps text fields to %s config", (config, expectedType) => {
    const fieldName = msg("fields.text", "Text");

    const field = YextField(fieldName, config);
    const visible = "visible" in config ? config.visible : undefined;

    expect(field).toEqual({
      label: fieldName,
      visible,
      type: expectedType,
    });
  });

  it("delegates entityField configs to YextEntityFieldSelector", () => {
    const returnedField = createCustomField();
    const fieldName = msg("fields.entity", "Entity Field");
    const filter = { types: ["type.string"] };
    const typeSelectorConfig = {
      typeLabel: "Type",
      fieldLabel: "Field",
      options: [{ label: "Text", value: "text" }],
    };

    yextEntityFieldSelectorMock.mockReturnValue(returnedField);

    const field = YextField(fieldName, {
      type: "entityField",
      filter,
      disableConstantValueToggle: true,
      disallowTranslation: true,
      typeSelectorConfig,
    } as any);

    expect(yextEntityFieldSelectorMock).toHaveBeenCalledWith({
      label: fieldName,
      filter,
      disableConstantValueToggle: true,
      disallowTranslation: true,
      typeSelectorConfig,
    });
    expect(field).toBe(returnedField);
  });

  it("delegates optionalNumber configs to OptionalNumberField", () => {
    const returnedField = createCustomField();
    const fieldName = msg("fields.columns", "Columns");

    optionalNumberFieldMock.mockReturnValue(returnedField);

    const field = YextField(fieldName, {
      type: "optionalNumber",
      hideNumberFieldRadioLabel: "Hide",
      showNumberFieldRadioLabel: "Show",
      defaultCustomValue: 3,
    });

    expect(optionalNumberFieldMock).toHaveBeenCalledWith({
      fieldLabel: fieldName,
      hideNumberFieldRadioLabel: "Hide",
      showNumberFieldRadioLabel: "Show",
      defaultCustomValue: 3,
    });
    expect(field).toBe(returnedField);
  });

  it("maps code fields to Puck config", () => {
    const fieldName = msg("fields.code", "Code");

    const field = YextField(fieldName, {
      type: "code",
      codeLanguage: "typescript",
    });

    expect(field).toEqual({
      type: "code",
      label: fieldName,
      visible: undefined,
      codeLanguage: "typescript",
    });
  });

  it("renders the max width selector with grouped options and helper copy", () => {
    const themeStyle = document.createElement("style");
    themeStyle.id = "visual-editor-theme";
    themeStyle.textContent = `
      .components {
        --maxWidth-pageSection-contentWidth:1024px !important;
      }
    `;
    document.head.appendChild(themeStyle);

    const field = YextField(msg("fields.maxWidth", "Max Width"), {
      type: "maxWidth",
    }) as any;

    expect(field.type).toBe("basicSelector");
    expect(field.disableSearch).toBe(true);

    renderCustomField(field, "theme");

    expect(screen.getByRole("combobox").textContent).toContain(
      "Match Other Sections (1024px)"
    );

    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.queryByPlaceholderText("Search")).toBeNull();
    expect(
      screen.getByText(
        "For optimal content alignment, we recommend setting the header and footer width to match or exceed the page content grid."
      )
    ).toBeDefined();

    themeStyle.remove();
  });

  it("delegates translatableString configs to TranslatableStringField", () => {
    const returnedField = createCustomField();
    const fieldName = msg("fields.text", "Text");
    const filter = { types: ["type.string"] };

    translatableStringFieldMock.mockReturnValue(returnedField);

    const field = YextField(fieldName, {
      type: "translatableString",
      filter,
      showApplyAllOption: true,
    } as any);

    expect(translatableStringFieldMock).toHaveBeenCalledWith(
      fieldName,
      filter,
      true
    );
    expect(field).toBe(returnedField);
  });

  it("returns image configs with the provided label", () => {
    const fieldName = msg("fields.image", "Image");

    const field = YextField(fieldName, {
      type: "image",
    }) as any;

    expect(field).toMatchObject({
      type: IMAGE_CONSTANT_CONFIG.type,
      label: fieldName,
    });
    expect(field.render).toBe(IMAGE_CONSTANT_CONFIG.render);
  });

  it("returns video configs with the provided label", () => {
    const fieldName = msg("fields.video", "Video");

    const field = YextField(fieldName, {
      type: "video",
    }) as any;

    expect(field).toMatchObject({
      type: VIDEO_CONSTANT_CONFIG.type,
      label: fieldName,
    });
    expect(field.render).toBe(VIDEO_CONSTANT_CONFIG.render);
  });

  it("delegates dynamicSelect configs to DynamicOptionsSelector", () => {
    const returnedField = createCustomField();
    const fieldName = msg("fields.items", "Items");
    const getOptions = vi.fn(() => [
      { label: "Alpha", value: "alpha" },
      { label: "Beta", value: "beta" },
    ]);

    dynamicOptionsSelectorMock.mockReturnValue(returnedField);

    const field = YextField(fieldName, {
      type: "dynamicSelect",
      dropdownLabel: "Items",
      getOptions,
      placeholderOptionLabel: "Select an item",
    });

    expect(dynamicOptionsSelectorMock).toHaveBeenCalledWith({
      label: fieldName,
      dropdownLabel: "Items",
      getOptions,
      placeholderOptionLabel: "Select an item",
    });
    expect(field).toBe(returnedField);
  });

  it("delegates dynamicSingleSelect configs to DynamicOptionsSingleSelector", () => {
    const returnedField = createCustomField();
    const fieldName = msg("fields.item", "Item");
    const getOptions = vi.fn(() => [
      { label: "Alpha", value: "alpha" },
      { label: "Beta", value: "beta" },
    ]);

    dynamicOptionsSingleSelectorMock.mockReturnValue(returnedField);

    const field = YextField(fieldName, {
      type: "dynamicSingleSelect",
      dropdownLabel: "Item",
      getOptions,
      placeholderOptionLabel: "Select one",
    });

    expect(dynamicOptionsSingleSelectorMock).toHaveBeenCalledWith({
      label: fieldName,
      dropdownLabel: "Item",
      getOptions,
      placeholderOptionLabel: "Select one",
    });
    expect(field).toBe(returnedField);
  });

  it.each([
    {
      fieldName: msg("fields.number", "Number"),
      config: { type: "number", min: 1, max: 5, visible: false },
    },
    {
      fieldName: msg("fields.select", "Select"),
      config: {
        type: "select",
        options: [{ label: "Alpha", value: "alpha" }],
        visible: true,
      },
    },
    {
      fieldName: msg("fields.group", "Group"),
      config: {
        type: "object",
        objectFields: {
          title: { type: "text" },
        },
      },
    },
    {
      fieldName: msg("fields.list", "List"),
      config: {
        type: "array",
        arrayFields: {
          title: { type: "text" },
        },
        defaultItemProps: {
          title: "Default title",
        },
      },
    },
  ])("passes through standard Puck field configs", ({ fieldName, config }) => {
    const field = YextField(fieldName, config as any);

    expect(field).toEqual({
      label: fieldName,
      ...config,
    });
  });
});
