import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { YextAutoField } from "./YextAutoField.tsx";
import { type DateTimeSelectorField } from "./DateTimeSelectorField.tsx";

const renderField = (
  field: DateTimeSelectorField,
  value?: string
): {
  onChange: ReturnType<typeof vi.fn>;
} => {
  const onChange = vi.fn();

  render(
    <YextAutoField
      field={field}
      id="date-time-field"
      onChange={onChange}
      value={value}
    />
  );

  return { onChange };
};

describe("DateTimeSelectorField", () => {
  it("renders through YextAutoField as a registered field type", () => {
    const field: DateTimeSelectorField = {
      type: "dateTimeSelector",
      label: "Date and Time",
    };

    renderField(field, "2026-04-15T09:30");

    expect(
      (screen.getByLabelText("Date and Time") as HTMLInputElement).value
    ).toBe("2026-04-15T09:30");
  });

  it("updates the value when the datetime input changes", () => {
    const field: DateTimeSelectorField = {
      type: "dateTimeSelector",
      label: "Date and Time",
    };
    const { onChange } = renderField(field);

    fireEvent.change(screen.getByLabelText("Date and Time"), {
      target: { value: "2026-06-01T13:45" },
    });

    expect(onChange).toHaveBeenCalledWith("2026-06-01T13:45");
  });

  it("renders without a label when one is not provided", () => {
    const field: DateTimeSelectorField = {
      type: "dateTimeSelector",
    };

    renderField(field, "2026-04-15T09:30");

    expect(
      (screen.getByDisplayValue("2026-04-15T09:30") as HTMLInputElement).type
    ).toBe("datetime-local");
    expect(screen.queryByText("Value")).toBeNull();
  });
});
