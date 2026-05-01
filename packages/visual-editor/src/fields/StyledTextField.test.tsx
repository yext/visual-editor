import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TemplateMetadataContext } from "../internal/hooks/useMessageReceivers.ts";
import { type TemplateMetadata } from "../internal/types/templateMetadata.ts";
import { YextAutoField } from "./YextAutoField.tsx";
import {
  type StyledTextField,
  type StyledTextValue,
} from "./StyledTextField.tsx";

const customFonts = {
  "Weights Only": {
    italics: true,
    weights: [400, 700],
    fallback: "sans-serif",
  },
  "No Italic": {
    italics: false,
    weights: [400],
    fallback: "serif",
  },
} satisfies TemplateMetadata["customFonts"];

const field: StyledTextField = {
  type: "styledText",
  label: "Styled Text",
};

const templateMetadata = {
  siteId: 1,
  templateId: "test",
  assignment: "ALL",
  isDevMode: false,
  devOverride: false,
  isxYextDebug: false,
  isThemeMode: false,
  entityCount: 0,
  totalEntityCount: 0,
  entityTypeDisplayName: "Entity",
  locales: ["en"],
  layoutTaskApprovals: false,
  headDeployStatus: "ACTIVE",
  customFonts,
} satisfies TemplateMetadata;

const styledTextValue = (
  overrides: Partial<StyledTextValue> = {}
): StyledTextValue => ({
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
  ...overrides,
});

const renderField = (value: StyledTextValue = styledTextValue()) => {
  const onChange = vi.fn();

  render(
    <TemplateMetadataContext.Provider value={templateMetadata}>
      <YextAutoField
        field={field}
        id="styled-text"
        onChange={onChange}
        value={value}
      />
    </TemplateMetadataContext.Provider>
  );

  return { onChange };
};

describe("StyledTextField", () => {
  it("renders through YextAutoField as a registered field type", () => {
    renderField(
      styledTextValue({
        fontFamily: "'Weights Only', 'Weights Only Fallback', sans-serif",
        fontSize: "24px",
        fontWeight: "700",
        fontStyle: "italic",
        textTransform: "uppercase",
      })
    );

    expect(screen.getByText("Styled Text")).toBeDefined();
    expect(screen.getByText("Weights Only")).toBeDefined();
    expect(screen.getByText("2XL (24px)")).toBeDefined();
    expect(screen.getByDisplayValue("Bold (700)")).toBeDefined();
    expect(screen.getByDisplayValue("Italic")).toBeDefined();
    expect(screen.getByText("Uppercase")).toBeDefined();
  });

  it("updates each control while preserving existing values", () => {
    const initialValue: StyledTextValue = styledTextValue({
      fontFamily: "'Weights Only', 'Weights Only Fallback', sans-serif",
      fontSize: "24px",
      fontWeight: "700",
      fontStyle: "italic",
      textTransform: "uppercase",
    });
    const { onChange } = renderField(initialValue);

    fireEvent.click(screen.getByText("Weights Only"));
    fireEvent.click(screen.getByText("No Italic"));
    expect(onChange).toHaveBeenCalledWith({
      ...initialValue,
      fontFamily: "'No Italic', 'No Italic Fallback', serif",
      fontWeight: "default",
      fontStyle: "default",
    });

    fireEvent.click(screen.getByText("2XL (24px)"));
    fireEvent.click(screen.getByText("3XL (32px)"));
    expect(onChange).toHaveBeenCalledWith({
      ...initialValue,
      fontSize: "32px",
    });

    fireEvent.change(screen.getByDisplayValue("Bold (700)"), {
      target: { value: "400" },
    });
    expect(onChange).toHaveBeenCalledWith({
      ...initialValue,
      fontWeight: "400",
    });

    fireEvent.change(screen.getByDisplayValue("Italic"), {
      target: { value: "normal" },
    });
    expect(onChange).toHaveBeenCalledWith({
      ...initialValue,
      fontStyle: "normal",
    });

    fireEvent.click(screen.getByText("Uppercase"));
    fireEvent.click(screen.getByText("Lowercase"));
    expect(onChange).toHaveBeenCalledWith({
      ...initialValue,
      textTransform: "lowercase",
    });
  });

  it("filters font weights based on the selected font", () => {
    renderField(
      styledTextValue({
        fontFamily: "'No Italic', 'No Italic Fallback', serif",
        fontWeight: "400",
      })
    );

    const fontWeightSelect = screen.getByDisplayValue("Normal (400)");
    const weightOptionLabels = within(fontWeightSelect)
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(weightOptionLabels).toEqual(["Default", "Normal (400)"]);
  });

  it("filters font styles based on the selected font", () => {
    renderField(
      styledTextValue({
        fontFamily: "'No Italic', 'No Italic Fallback', serif",
        fontStyle: "normal",
      })
    );

    const fontStyleSelect = screen.getByDisplayValue("Normal");
    const styleOptionLabels = within(fontStyleSelect)
      .getAllByRole("option")
      .map((option) => option.textContent);
    expect(styleOptionLabels).toEqual(["Default", "Normal"]);
  });

  it("resets invalid font weight and font style values in a single update", async () => {
    const { onChange } = renderField(
      styledTextValue({
        fontFamily: "'No Italic', 'No Italic Fallback', serif",
        fontWeight: "700",
        fontStyle: "italic",
        textTransform: "uppercase",
      })
    );

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        fontFamily: "'No Italic', 'No Italic Fallback', serif",
        fontWeight: "default",
        fontStyle: "default",
        fontSize: "default",
        textTransform: "uppercase",
      });
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
