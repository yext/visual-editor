import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { YextAutoField } from "./YextAutoField.tsx";
import type { ThemeColorField } from "./ThemeColorField.tsx";

describe("ThemeColorField", () => {
  it.each([
    {
      name: "when a palette color is selected then its ThemeColor is authored",
      field: { type: "themeColor", options: "BACKGROUND_COLOR" } as const,
      value: undefined,
      expected: { selectedColor: "white", contrastingColor: "black" },
      selection: "Background 1",
    },
    {
      name: "when Other is selected then a custom ThemeColor is authored",
      field: { type: "themeColor", options: "SITE_COLOR" } as const,
      value: undefined,
      expected: {
        selectedColor: "[#000000]",
        contrastingColor: "white",
        isDarkColor: true,
      },
      selection: "Other",
    },
  ])("$name", ({ field, value, expected, selection }) => {
    const onChange = vi.fn();
    render(
      <YextAutoField
        field={field satisfies ThemeColorField}
        id="test-field"
        value={value}
        onChange={onChange}
      />
    );

    fireEvent.click(screen.getByRole("combobox"));
    fireEvent.click(screen.getAllByText(selection).at(-1)!);

    expect(onChange).toHaveBeenCalledWith(expected);
  });
});
