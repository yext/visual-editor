import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { YextAutoField } from "./YextAutoField.tsx";
import {
  type MultiSelectorOption,
  type MultiSelectorField,
  type MultiSelectorValue,
} from "./MultiSelectorField.tsx";

const baseOptions: MultiSelectorOption<string>[] = [
  { label: "Alpha", value: "alpha" },
  { label: "Beta", value: "beta" },
];

const renderField = ({
  field = {
    type: "multiSelector",
    label: "Items",
    dropdownLabel: "Item",
    options: baseOptions,
  } satisfies MultiSelectorField<string>,
  value = { selections: [{ value: "alpha" }] },
}: {
  field?: MultiSelectorField<string>;
  value?: MultiSelectorValue<string>;
} = {}) => {
  const onChange = vi.fn();

  render(
    <YextAutoField
      field={field}
      id="multi-selector-field"
      onChange={onChange}
      value={value}
    />
  );

  return { onChange };
};

const openArrayItem = (summary: string) => {
  fireEvent.click(screen.getByText(summary));
};

describe("MultiSelectorField", () => {
  it("renders the selected option and updates the selected value", () => {
    const { onChange } = renderField();

    expect(screen.getByText("Items")).toBeDefined();
    expect(screen.getByText("Alpha")).toBeDefined();

    openArrayItem("Alpha");
    expect(screen.getByRole("combobox").textContent).toContain("Alpha");

    fireEvent.click(screen.getByRole("combobox"));
    expect(screen.getByPlaceholderText("Search")).toBeDefined();

    fireEvent.click(screen.getByText("Beta"));

    expect(onChange).toHaveBeenCalledWith(
      { selections: [{ value: "beta" }] },
      undefined
    );
  });

  it("re-evaluates dynamic options on re-render", () => {
    const onChange = vi.fn();

    const DynamicField = () => {
      const [showAlternateOptions, setShowAlternateOptions] =
        React.useState(false);
      const field: MultiSelectorField<string> = {
        type: "multiSelector",
        label: "Items",
        dropdownLabel: "Item",
        options: () =>
          showAlternateOptions
            ? [{ label: "Beta", value: "beta" }]
            : [{ label: "Alpha", value: "alpha" }],
      };

      return (
        <>
          <button onClick={() => setShowAlternateOptions(true)} type="button">
            Toggle
          </button>
          <YextAutoField
            field={field}
            id="multi-selector-field"
            onChange={onChange}
            value={{ selections: [{ value: "alpha" }] }}
          />
        </>
      );
    };

    render(<DynamicField />);

    expect(screen.getByText("Alpha")).toBeDefined();

    fireEvent.click(screen.getByText("Toggle"));

    expect(screen.getByText("Item 1")).toBeDefined();

    openArrayItem("Item 1");
    fireEvent.click(screen.getByRole("combobox"));

    expect(screen.getAllByText("Beta").length).toBeGreaterThan(0);
  });

  it("supports static options", () => {
    renderField({
      field: {
        type: "multiSelector",
        label: "Items",
        dropdownLabel: "Item",
        options: baseOptions,
      },
    });

    expect(screen.getByText("Alpha")).toBeDefined();
  });

  it("clears the field value when the last selection is removed", () => {
    const { onChange } = renderField();

    fireEvent.click(screen.getByTitle("Delete"));

    expect(onChange).toHaveBeenCalledWith(undefined, undefined);
  });

  it("uses the placeholder option for new selections", () => {
    renderField({
      field: {
        type: "multiSelector",
        label: "Items",
        dropdownLabel: "Item",
        options: () => baseOptions,
        placeholderOptionLabel: "Select an item",
      },
      value: { selections: [{ value: undefined }] },
    });

    expect(screen.getByText("Item 1")).toBeDefined();

    openArrayItem("Item 1");

    expect(screen.getByRole("combobox").textContent).toContain(
      "Select an item"
    );
  });
});
