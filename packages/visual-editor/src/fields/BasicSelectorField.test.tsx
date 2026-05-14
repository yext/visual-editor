import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { YextAutoField } from "./YextAutoField.tsx";
import { type BasicSelectorField } from "./BasicSelectorField.tsx";

const renderField = (
  field: BasicSelectorField,
  value?: any
): {
  onChange: ReturnType<typeof vi.fn>;
} => {
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

describe("BasicSelectorField", () => {
  it("renders static options and returns the raw selected value", () => {
    const field: BasicSelectorField = {
      type: "basicSelector",
      label: "Size",
      options: [
        { label: "Small", value: "small" },
        { label: "Large", value: "large" },
      ],
      translateOptions: false,
    };

    const { onChange } = renderField(field, "small");

    expect(screen.getByRole("combobox").textContent).toContain("Small");

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("Large"));

    expect(onChange).toHaveBeenCalledWith("large");
  });

  it("re-evaluates function-valued options on re-render", () => {
    const onChange = vi.fn();

    const DynamicField = () => {
      const [showAlternateOptions, setShowAlternateOptions] =
        React.useState(false);

      const field: BasicSelectorField = {
        type: "basicSelector",
        label: "Field",
        options: () =>
          showAlternateOptions
            ? [{ label: "Beta", value: "beta" }]
            : [{ label: "Alpha", value: "alpha" }],
        translateOptions: false,
      };

      return (
        <>
          <button onClick={() => setShowAlternateOptions(true)} type="button">
            Toggle
          </button>
          <YextAutoField
            field={field}
            id="dynamic-field"
            onChange={onChange}
            value="alpha"
          />
        </>
      );
    };

    render(<DynamicField />);

    expect(screen.getByRole("combobox").textContent).toContain("Alpha");

    fireEvent.click(screen.getByText("Toggle"));

    expect(screen.getByRole("combobox").textContent).toContain("Beta");
  });

  it("does not crash when the number of options changes between renders", () => {
    const onChange = vi.fn();

    const DynamicField = () => {
      const [showExtraOption, setShowExtraOption] = React.useState(false);

      const field: BasicSelectorField = {
        type: "basicSelector",
        label: "Field",
        options: () =>
          showExtraOption
            ? [
                { label: "Alpha", value: "alpha" },
                { label: "Beta", value: "beta" },
              ]
            : [{ label: "Alpha", value: "alpha" }],
        translateOptions: false,
      };

      return (
        <>
          <button onClick={() => setShowExtraOption(true)} type="button">
            Add option
          </button>
          <YextAutoField
            field={field}
            id="dynamic-field-with-extra-option"
            onChange={onChange}
            value="alpha"
          />
        </>
      );
    };

    render(<DynamicField />);

    expect(screen.getByRole("combobox").textContent).toContain("Alpha");

    fireEvent.click(screen.getByText("Add option"));

    expect(screen.getByRole("combobox").textContent).toContain("Alpha");

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByText("Beta")).toBeDefined();
  });

  it("resolves ThemeOptions keys passed to basicSelector", () => {
    const field: BasicSelectorField = {
      type: "basicSelector",
      label: "Heading Level",
      options: "HEADING_LEVEL",
    };

    const { onChange } = renderField(field, 1);

    expect(screen.getByRole("combobox").textContent).toContain("H1");

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getByText("H2"));

    expect(onChange).toHaveBeenCalledWith(2);
  });

  it.each([
    ["BACKGROUND_COLOR", "Recommended Colors"],
    ["SITE_COLOR", "Recommended Color"],
  ] as const)(
    "renders %s grouped options with search",
    (optionKey, expectedHeading) => {
      const field: BasicSelectorField = {
        type: "basicSelector",
        label: "Color",
        options: optionKey,
      };

      renderField(field);

      fireEvent.click(screen.getByRole("combobox"));

      expect(screen.getByPlaceholderText("Search")).toBeDefined();
      expect(screen.getByText(expectedHeading)).toBeDefined();
    }
  );

  it("renders the empty state for function-valued options with no results", () => {
    const field: BasicSelectorField = {
      type: "basicSelector",
      label: "Field",
      options: () => [],
      translateOptions: false,
      noOptionsPlaceholder: "No fields available",
      noOptionsMessage: "Check your configuration.",
    };

    renderField(field);

    expect(
      screen
        .getByRole("button", { name: "No fields available" })
        .hasAttribute("disabled")
    ).toBe(true);
    expect(screen.getByText("Check your configuration.")).toBeDefined();
  });

  it("warns when a basicSelector receives an invalid ThemeOptions key", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});
    const field: BasicSelectorField = {
      type: "basicSelector",
      label: "Field",
      options: "NOT_A_THEME_OPTION" as any,
    };

    renderField(field);

    expect(
      screen
        .getByRole("button", { name: "No options available" })
        .hasAttribute("disabled")
    ).toBe(true);
    expect(consoleWarn).toHaveBeenCalledWith(
      'Invalid ThemeOptions key "NOT_A_THEME_OPTION" passed to basicSelector.'
    );

    consoleWarn.mockRestore();
  });
});
