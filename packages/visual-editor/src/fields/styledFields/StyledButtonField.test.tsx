import React from "react";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { TemplateMetadataContext } from "../../internal/hooks/useMessageReceivers.ts";
import { type TemplateMetadata } from "../../internal/types/templateMetadata.ts";
import { YextAutoField } from "../YextAutoField.tsx";
import {
  type StyledButtonField,
  type StyledButtonValue,
} from "./StyledButtonField.tsx";

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

const field: StyledButtonField = {
  type: "styledButton",
  label: "Styled Button",
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

const styledButtonValue = (
  overrides: Partial<StyledButtonValue> = {}
): StyledButtonValue => ({
  fontFamily: "default",
  fontSize: "default",
  fontWeight: "default",
  fontStyle: "default",
  textTransform: "default",
  borderRadius: "default",
  letterSpacing: "default",
  ...overrides,
});

const renderField = (value: StyledButtonValue = styledButtonValue()) => {
  const onChange = vi.fn();

  render(
    <TemplateMetadataContext.Provider value={templateMetadata}>
      <YextAutoField
        field={field}
        id="styled-button"
        onChange={onChange}
        value={value}
      />
    </TemplateMetadataContext.Provider>
  );

  return { onChange };
};

describe("StyledButtonField", () => {
  it("renders through YextAutoField as a registered field type", () => {
    renderField(
      styledButtonValue({
        fontFamily: "'Weights Only', 'Weights Only Fallback', sans-serif",
        fontSize: "24px",
        fontWeight: "700",
        fontStyle: "italic",
        textTransform: "uppercase",
        borderRadius: "4px",
        letterSpacing: "0.025em",
      })
    );

    expect(screen.getByText("Styled Button")).toBeDefined();
    expect(screen.getByText("Weights Only")).toBeDefined();
    expect(screen.getByText("2XL (24px)")).toBeDefined();
    expect(screen.getByDisplayValue("Bold (700)")).toBeDefined();
    expect(screen.getByDisplayValue("Italic")).toBeDefined();
    expect(screen.getByText("Uppercase")).toBeDefined();
    expect(screen.getByText("SM (4px)")).toBeDefined();
    expect(screen.getByText("Wide (0.025em)")).toBeDefined();
  });

  it("updates each control while preserving existing values", () => {
    const initialValue: StyledButtonValue = styledButtonValue({
      fontFamily: "'Weights Only', 'Weights Only Fallback', sans-serif",
      fontSize: "24px",
      fontWeight: "700",
      fontStyle: "italic",
      textTransform: "uppercase",
      borderRadius: "4px",
      letterSpacing: "0.025em",
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

    fireEvent.click(screen.getByText("SM (4px)"));
    fireEvent.click(screen.getByText("LG (8px)"));
    expect(onChange).toHaveBeenCalledWith({
      ...initialValue,
      borderRadius: "8px",
    });

    fireEvent.click(screen.getByText("Wide (0.025em)"));
    fireEvent.click(screen.getByText("Wider (0.05em)"));
    expect(onChange).toHaveBeenCalledWith({
      ...initialValue,
      letterSpacing: "0.05em",
    });
  });

  it("filters font weights based on the selected font", () => {
    renderField(
      styledButtonValue({
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
      styledButtonValue({
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
      styledButtonValue({
        fontFamily: "'No Italic', 'No Italic Fallback', serif",
        fontWeight: "700",
        fontStyle: "italic",
        textTransform: "uppercase",
        borderRadius: "4px",
        letterSpacing: "0.025em",
      })
    );

    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({
        fontFamily: "'No Italic', 'No Italic Fallback', serif",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "uppercase",
        borderRadius: "4px",
        letterSpacing: "0.025em",
      });
    });
    expect(onChange).toHaveBeenCalledTimes(1);
  });
});
