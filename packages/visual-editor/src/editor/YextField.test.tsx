import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { YextAutoField } from "../fields/YextAutoField.tsx";
import { msg } from "../utils/i18n/platform.ts";
import { YextField } from "./YextField.tsx";

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
    });

    expect(field.type).toBe("basicSelector");

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
});
