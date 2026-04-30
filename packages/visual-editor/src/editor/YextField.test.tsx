import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { YextAutoField } from "../fields/YextAutoField.tsx";
import { msg } from "../utils/i18n/platform.ts";
import { afterEach, describe, expect, it, vi } from "vitest";
import { YextField } from "./YextField.tsx";

const { dynamicOptionsSelectorMock, yextEntityFieldSelectorMock } = vi.hoisted(
  () => ({
    dynamicOptionsSelectorMock: vi.fn(),
    yextEntityFieldSelectorMock: vi.fn(),
  })
);

vi.mock("./DynamicOptionsSelector.tsx", () => ({
  DynamicOptionsSelector: dynamicOptionsSelectorMock,
}));

vi.mock("./YextEntityFieldSelector.tsx", async () => {
  const actual = await vi.importActual("./YextEntityFieldSelector.tsx");
  return {
    ...actual,
    YextEntityFieldSelector: yextEntityFieldSelectorMock,
  };
});

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
  it("renders native radio fields through YextAutoField", () => {
    renderCustomField(
      {
        label: msg("fields.show", "Show"),
        type: "radio",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: true },
          { label: msg("fields.options.no", "No"), value: false },
        ],
      },
      true
    );

    expect(screen.getAllByRole("radio")).toHaveLength(2);
    expect(screen.getByRole("radio", { checked: true })).toBeDefined();
  });

  it("renders native text and textarea fields through YextAutoField", () => {
    const { unmount } = render(
      <YextAutoField
        field={{ label: msg("fields.text", "Text"), type: "text" }}
        id="text-field"
        onChange={vi.fn()}
        value="Alpha"
      />
    );

    expect(document.querySelector('input[type="text"]')).toBeDefined();
    expect(screen.getByDisplayValue("Alpha")).toBeDefined();

    unmount();

    render(
      <YextAutoField
        field={{
          label: msg("fields.description", "Description"),
          type: "textarea",
        }}
        id="textarea-field"
        onChange={vi.fn()}
        value="Beta"
      />
    );

    expect(document.querySelector("textarea")).toBeDefined();
    expect(screen.getByDisplayValue("Beta")).toBeDefined();
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

  it("passes code configs through with the provided label", () => {
    const fieldName = msg("fields.code", "Code");

    const field = YextField(fieldName, {
      type: "code",
      language: "html",
    } as any);

    expect(field).toEqual({
      label: fieldName,
      type: "code",
      language: "html",
    });
  });

  it("passes translatableString configs through with the provided label", () => {
    const fieldName = msg("fields.text", "Text");
    const filter = { types: ["type.string"] };

    const field = YextField(fieldName, {
      type: "translatableString",
      filter,
      showApplyAllOption: true,
    } as any);

    expect(field).toEqual({
      label: fieldName,
      type: "translatableString",
      filter,
      showApplyAllOption: true,
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
