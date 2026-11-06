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

const renderField = (
  value?: StyledImageValue,
  fieldOverrides: Partial<StyledImageField> = {}
) => {
  const onChange = vi.fn();

  render(
    <YextAutoField
      field={{ ...field, ...fieldOverrides }}
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

describe("StyledImageField aspect ratio", () => {
  it("keeps the control hidden by default", () => {
    renderField();

    expect(screen.queryByText("Aspect Ratio")).toBeNull();
    expect(screen.getAllByRole("combobox")).toHaveLength(1);
  });

  it("shows Default for a missing ratio without changing the authored value", () => {
    const value = styledImageValue({ borderRadius: "8px" });
    const { onChange } = renderField(value, { includeAspectRatio: true });

    expect(screen.getByText("Aspect Ratio")).toBeDefined();
    expect(screen.getByText("Default")).toBeDefined();
    expect(value).toEqual({ borderRadius: "8px" });
    expect(onChange).not.toHaveBeenCalled();
  });

  it.each([false, true])(
    "preserves the ratio when changing radius with includeAspectRatio=%s",
    (includeAspectRatio) => {
      const value = styledImageValue({
        borderRadius: "4px",
        aspectRatio: 1.78,
      });
      const { onChange } = renderField(value, { includeAspectRatio });

      fireEvent.click(screen.getByText("SM (4px)"));
      fireEvent.click(screen.getByText("LG (8px)"));

      expect(onChange).toHaveBeenCalledWith({
        borderRadius: "8px",
        aspectRatio: 1.78,
      });
      expect(value).toEqual({ borderRadius: "4px", aspectRatio: 1.78 });
    }
  );

  it("selects a numeric ratio while preserving the radius", () => {
    const { onChange } = renderField(
      styledImageValue({ borderRadius: "8px" }),
      {
        includeAspectRatio: true,
      }
    );

    fireEvent.click(screen.getByText("Default"));
    fireEvent.click(screen.getByText("16:9"));

    expect(onChange).toHaveBeenCalledWith({
      borderRadius: "8px",
      aspectRatio: 1.78,
    });
  });

  it("resets the ratio to Default while preserving the radius", () => {
    const { onChange } = renderField(
      styledImageValue({ borderRadius: "8px", aspectRatio: 1.78 }),
      { includeAspectRatio: true }
    );

    fireEvent.click(screen.getByText("16:9"));
    fireEvent.click(screen.getByText("Default"));

    expect(onChange).toHaveBeenCalledWith({
      borderRadius: "8px",
      aspectRatio: "default",
    });
  });
});
