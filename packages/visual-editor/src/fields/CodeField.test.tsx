import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { msg } from "../utils/i18n/platform.ts";
import { YextAutoField } from "./YextAutoField.tsx";

const renderField = (
  field: Parameters<typeof YextAutoField<string>>[0]["field"],
  value?: string
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

describe("CodeField", () => {
  it("renders through YextAutoField as a registered field type", () => {
    const field = {
      label: msg("fields.html", "HTML"),
      type: "code" as const,
      codeLanguage: "html" as const,
    };

    renderField(field, "<div>Alpha</div>");

    expect(screen.getByText("HTML")).toBeDefined();
    expect(screen.getByRole("button").textContent).toContain(
      "<div>Alpha</div>"
    );
  });
});
