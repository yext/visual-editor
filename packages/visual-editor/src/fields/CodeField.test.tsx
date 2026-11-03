import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
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
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders through YextAutoField as a registered field type", () => {
    const field = {
      label: msg("fields.html", "HTML"),
      type: "code" as const,
      codeLanguage: "html" as const,
    };

    renderField(field, "<div>Alpha</div>");

    expect(screen.getByText("HTML")).toBeDefined();
    expect(screen.getByRole("textbox", { name: "HTML" })).toHaveProperty(
      "value",
      "<div>Alpha</div>"
    );
  });

  it.each(["html", "css", "javascript"] as const)(
    "when editing %s locally then the code field saves multiline source",
    (codeLanguage) => {
      const { onChange } = renderField(
        { type: "code", label: "Code", codeLanguage },
        "existing"
      );

      fireEvent.change(screen.getByRole("textbox", { name: "Code" }), {
        target: { value: "first line\nsecond line" },
      });

      expect(onChange).toHaveBeenCalledExactlyOnceWith(
        "first line\nsecond line"
      );
    }
  );

  it("when editing in the platform iframe then the code drawer button is shown", () => {
    vi.spyOn(window, "parent", "get").mockReturnValue({} as Window);

    renderField({ type: "code", label: "HTML", codeLanguage: "html" }, "code");

    expect(screen.getByRole("button", { name: "HTML" }).textContent).toBe(
      "code"
    );
    expect(screen.queryByRole("textbox")).toBeNull();
  });
});
