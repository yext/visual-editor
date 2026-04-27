import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { msg } from "../utils/i18n/platform.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import { type OptionalNumberField } from "./OptionalNumberField.tsx";

const baseField = {
  type: "optionalNumber",
  label: "Limit",
  hideNumberFieldRadioLabel: "Hide",
  showNumberFieldRadioLabel: "Show",
  defaultCustomValue: 3,
} satisfies OptionalNumberField;

const HIDE_OPTION_VALUE = "__ve_optionalNumber_hide__";

const renderField = (
  field: OptionalNumberField = baseField,
  value?: number | string | null
) => {
  const onChange = vi.fn();
  const renderResult = render(
    <YextAutoField
      field={field}
      id="optional-number-field"
      onChange={onChange}
      value={value as any}
    />
  );

  return {
    onChange,
    ...renderResult,
  };
};

const getRadioInput = (label: string) =>
  screen
    .getByText(label)
    .closest("label")
    ?.querySelector("input") as HTMLInputElement | null;

describe("OptionalNumberField", () => {
  it("renders through YextAutoField as a registered field type", () => {
    renderField(baseField, 5);

    expect(screen.getByText("Limit")).toBeDefined();
    expect(getRadioInput("Show")?.checked).toBe(true);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe(
      "5"
    );
  });

  it("hides the number input when the hide radio sentinel value is used", () => {
    renderField(baseField, HIDE_OPTION_VALUE);

    expect(getRadioInput("Hide")?.checked).toBe(true);
    expect(screen.queryByRole("spinbutton")).toBeNull();
  });

  it("renders the number input", () => {
    renderField(baseField, 7);

    expect(getRadioInput("Show")?.checked).toBe(true);
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe(
      "7"
    );
  });

  it("restores the default custom value when toggled on", () => {
    const { onChange } = renderField(baseField, HIDE_OPTION_VALUE);

    fireEvent.click(getRadioInput("Show") as HTMLInputElement);

    expect(onChange).toHaveBeenCalledWith(3);
  });

  it("stores the hide sentinel when toggled off", () => {
    const { onChange } = renderField(baseField, 8);

    fireEvent.click(getRadioInput("Hide") as HTMLInputElement);

    expect(onChange).toHaveBeenCalledWith(HIDE_OPTION_VALUE);
  });

  it("translates the label and radio copy", () => {
    renderField(
      {
        type: "optionalNumber",
        label: msg("fields.maxItems", "Maximum Items"),
        hideNumberFieldRadioLabel: msg("fields.showAll", "Show All"),
        showNumberFieldRadioLabel: msg("fields.customLimit", "Custom Limit"),
        defaultCustomValue: 4,
      },
      4
    );

    expect(screen.getByText("Maximum Items")).toBeDefined();
    expect(getRadioInput("Show All")).not.toBeNull();
    expect(getRadioInput("Custom Limit")).not.toBeNull();
  });

  it("renders without a label when one is not provided", () => {
    const { container } = renderField(
      {
        type: "optionalNumber",
        hideNumberFieldRadioLabel: "Hide",
        showNumberFieldRadioLabel: "Show",
        defaultCustomValue: 3,
      },
      2
    );

    expect(container.querySelector(".ve-mt-3")).not.toBeNull();
    expect(screen.queryByText("Limit")).toBeNull();
  });

  it("treats an undefined initial value as the shown path", () => {
    renderField(baseField);

    expect(getRadioInput("Show")?.checked).toBe(true);
    expect(screen.getByRole("spinbutton")).toBeDefined();
    expect((screen.getByRole("spinbutton") as HTMLInputElement).value).toBe("");
  });
});
