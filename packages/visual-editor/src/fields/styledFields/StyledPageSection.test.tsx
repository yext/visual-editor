import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { YextAutoField } from "../YextAutoField.tsx";
import {
  type StyledPageSectionField,
  type StyledPageSectionValue,
} from "./StyledPageSection.tsx";

const field: StyledPageSectionField = {
  type: "styledPageSection",
  label: "Styled Page Section",
};

const styledPageSectionValue = (
  overrides: Partial<StyledPageSectionValue> = {}
): StyledPageSectionValue => ({
  contentWidth: "default",
  verticalPadding: "default",
  ...overrides,
});

const renderField = (
  value: StyledPageSectionValue = styledPageSectionValue()
) => {
  const onChange = vi.fn();

  render(
    <YextAutoField
      field={field}
      id="styled-page-section"
      onChange={onChange}
      value={value}
    />
  );

  return { onChange };
};

describe("StyledPageSectionField", () => {
  it("renders through YextAutoField as a registered field type", () => {
    renderField(
      styledPageSectionValue({
        contentWidth: "1024px",
        verticalPadding: "32px",
      })
    );

    expect(screen.getByText("Styled Page Section")).toBeDefined();
    expect(screen.getByText("Standard (1024px)")).toBeDefined();
    expect(screen.getByText("8 (32px)")).toBeDefined();
  });

  it("updates content width while preserving vertical padding", () => {
    const initialValue = styledPageSectionValue({
      contentWidth: "1024px",
      verticalPadding: "32px",
    });
    const { onChange } = renderField(initialValue);

    fireEvent.click(screen.getByText("Standard (1024px)"));
    fireEvent.click(screen.getByText("Wide (1280px)"));

    expect(onChange).toHaveBeenCalledWith({
      ...initialValue,
      contentWidth: "1280px",
    });
  });

  it("updates vertical padding while preserving content width", () => {
    const initialValue = styledPageSectionValue({
      contentWidth: "1024px",
      verticalPadding: "32px",
    });
    const { onChange } = renderField(initialValue);

    fireEvent.click(screen.getByText("8 (32px)"));
    fireEvent.click(screen.getByText("10 (40px)"));

    expect(onChange).toHaveBeenCalledWith({
      ...initialValue,
      verticalPadding: "40px",
    });
  });
});
