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
  translatableStringFieldMock,
  yextEntityFieldSelectorMock,
} = vi.hoisted(() => ({
  dynamicOptionsSelectorMock: vi.fn(),
  translatableStringFieldMock: vi.fn(),
  yextEntityFieldSelectorMock: vi.fn(),
}));

vi.mock("./DynamicOptionsSelector.tsx", () => ({
  DynamicOptionsSelector: dynamicOptionsSelectorMock,
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

  it("maps radio fields with theme option keys to Puck config", () => {
    const fieldName = msg("fields.radio", "radio");

    const field = YextField(fieldName, {
      type: "radio",
      options: "ALIGNMENT",
      visible: false,
    });

    expect(field).toEqual({
      label: fieldName,
      visible: false,
      type: "radio",
      options: ThemeOptions.ALIGNMENT,
    });
  });

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

    yextEntityFieldSelectorMock.mockReturnValue(returnedField);

    const field = YextField(fieldName, {
      type: "entityField",
      filter,
      disableConstantValueToggle: true,
      disallowTranslation: true,
    } as any);

    expect(yextEntityFieldSelectorMock).toHaveBeenCalledWith({
      label: fieldName,
      filter,
      disableConstantValueToggle: true,
      disallowTranslation: true,
    });
    expect(field).toBe(returnedField);
  });

  it("passes registered custom field configs through with the provided label", () => {
    const fieldName = msg("fields.cta", "CTA");

    const field = YextField(fieldName, {
      type: "ctaSelector",
      disableConstantValueToggle: true,
    });

    expect(field).toEqual({
      label: fieldName,
      type: "ctaSelector",
      disableConstantValueToggle: true,
    });
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

  it.each([
    {
      fieldName: msg("fields.number", "Number"),
      config: { type: "number", min: 1, max: 5, visible: false },
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
