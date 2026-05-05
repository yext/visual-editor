import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { YextAutoField } from "../YextAutoField.tsx";
import {
  type StyledImageField,
  type StyledImageValue,
} from "./StyledImageField.tsx";

const field: StyledImageField = {
  type: "styledImage",
  label: "Styled Image",
};

const styledImageValue = (
  overrides: Partial<StyledImageValue> = {}
): StyledImageValue => ({
  borderRadius: "default",
  ...overrides,
});

const renderField = (value?: StyledImageValue) => {
  const onChange = vi.fn();

  render(
    <YextAutoField
      field={field}
      id="styled-image"
      onChange={onChange}
      value={value}
    />
  );

  return { onChange };
};

describe("StyledImageField", () => {
  it("renders through YextAutoField as a registered field type", () => {
    renderField(styledImageValue({ borderRadius: "24px" }));

    expect(screen.getByText("Styled Image")).toBeDefined();
    expect(screen.getByText("3XL (24px)")).toBeDefined();
  });

  it("updates border radius while preserving the object shape", () => {
    const initialValue = styledImageValue({ borderRadius: "4px" });
    const { onChange } = renderField(initialValue);

    fireEvent.click(screen.getByText("SM (4px)"));
    fireEvent.click(screen.getByText("LG (8px)"));

    expect(onChange).toHaveBeenCalledWith({
      borderRadius: "8px",
    });
  });

  it("falls back to the default option when value is missing", () => {
    renderField();

    expect(screen.getByText("Default")).toBeDefined();
  });

  it("falls back to the default option when value is partial", () => {
    renderField({} as StyledImageValue);

    expect(screen.getByText("Default")).toBeDefined();
  });
});
