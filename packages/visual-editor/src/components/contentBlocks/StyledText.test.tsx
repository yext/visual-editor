import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BackgroundProvider } from "../../hooks/useBackground.tsx";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import { createStyledTextConfig } from "./createStyledTextConfig.tsx";
import { StyledPlainText, StyledRichText } from "./createStyledTextConfig.tsx";
import { getStyledTextStyle } from "./styledText.tsx";

describe("styledText", () => {
  it("omits default typography values", () => {
    expect(
      getStyledTextStyle({
        fontFamily: "default",
        fontSize: "default",
        fontWeight: "default",
        fontStyle: "default",
        textTransform: "default",
      })
    ).toBeUndefined();
  });

  it("returns non-default typography values", () => {
    expect(
      getStyledTextStyle({
        fontFamily: "Georgia, serif",
        fontSize: "18px",
        fontWeight: "700",
        fontStyle: "italic",
        textTransform: "uppercase",
      })
    ).toEqual({
      fontFamily: "Georgia, serif",
      fontSize: "18px",
      fontWeight: "700",
      fontStyle: "italic",
      textTransform: "uppercase",
    });
  });
});

describe("Styled text content blocks", () => {
  const renderWithProviders = (ui: React.ReactNode) =>
    render(
      <VisualEditorProvider templateProps={{ document: { locale: "en" } }}>
        <BackgroundProvider
          value={{
            selectedColor: "white",
            contrastingColor: "black",
            isDarkColor: false,
          }}
        >
          {ui}
        </BackgroundProvider>
      </VisualEditorProvider>
    );

  it("renders styled plain text using inherited styles", () => {
    renderWithProviders(
      <StyledPlainText
        {...{
          data: {
            text: {
              field: "",
              constantValue: { defaultValue: "Ignored" },
              constantValueEnabled: true,
            },
          },
          fontOptions: {
            text: {
              fontFamily: "default",
              fontSize: "default",
              fontWeight: "default",
              fontStyle: "default",
              textTransform: "default",
            },
          },
          parentData: {
            field: "c_title",
            text: { defaultValue: "Shared title" },
          },
          parentStyles: {
            className: "shared-class",
            alignment: "center",
            fontOptions: {
              text: {
                fontFamily: "Georgia, serif",
                fontSize: "18px",
                fontWeight: "700",
                fontStyle: "italic",
                textTransform: "uppercase",
              },
            },
            tag: "h3",
          },
          puck: { isEditing: false },
        }}
      />
    );

    const text = screen.getByText("Shared title");
    expect(text.tagName).toBe("H3");
    expect(text.className).toContain("shared-class");
    expect(text.className).toContain("text-center");
    expect(text).toHaveStyle({
      fontFamily: "Georgia, serif",
      fontSize: "18px",
      fontWeight: "700",
      fontStyle: "italic",
      textTransform: "uppercase",
    });
  });

  it("renders styled rich text through the shared rich text renderer", () => {
    const { container } = renderWithProviders(
      <StyledRichText
        {...{
          data: {
            text: {
              field: "",
              constantValue: { defaultValue: "Ignored" },
              constantValueEnabled: true,
            },
          },
          fontOptions: {
            text: {
              fontFamily: "default",
              fontSize: "default",
              fontWeight: "default",
              fontStyle: "default",
              textTransform: "default",
            },
          },
          parentData: {
            field: "c_description",
            text: {
              defaultValue: { html: "<p>Hello <strong>world</strong></p>" },
            },
          },
          parentStyles: {
            className: "shared-rich-text",
            fontOptions: {
              color: {
                selectedColor: "[#123456]",
                contrastingColor: "white",
              },
              text: {
                fontFamily: "'Weights Only', sans-serif",
                fontSize: "20px",
                fontWeight: "700",
                fontStyle: "italic",
                textTransform: "uppercase",
              },
            },
          },
          puck: { isEditing: false },
        }}
      />
    );

    const outerWrapper = container.querySelector(
      ".shared-rich-text"
    ) as HTMLElement;
    const wrapper = container.querySelector(".rtf-wrapper") as HTMLElement;
    expect(outerWrapper).toBeTruthy();
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.color).toBe("rgb(18, 52, 86)");
    expect(wrapper.style.getPropertyValue("--fontFamily-body-fontFamily")).toBe(
      "'Weights Only', sans-serif"
    );
    expect(wrapper.style.getPropertyValue("--fontSize-body-fontSize")).toBe(
      "20px"
    );
  });

  it("creates a plain-text config with only Text and Font Options", () => {
    const config = createStyledTextConfig({
      kind: "plain",
      label: "Plain Text",
      includeColor: true,
    });
    const fields = config.fields!;

    expect(Object.keys(fields)).toEqual(["data", "fontOptions"]);
    expect(fields.data.label).toBe("Text");
    expect(fields.fontOptions.label).toBe("Font Options");
    expect(fields.data.objectFields.text.filter?.types).toEqual([
      "type.string",
    ]);
    expect(fields.fontOptions.type).toBe("styledText");
    expect(fields.fontOptions.includeColor).toBe(true);
    expect(fields.fontOptions.colorLabel).toBe("Font Color");
  });

  it("creates a plain-text config with Alignment and Tag", () => {
    const config = createStyledTextConfig({
      kind: "plain",
      label: "Plain Text",
      includeAlignment: true,
      tagOptions: ["span", "p"],
    });
    const fields = config.fields!;

    expect(Object.keys(fields)).toEqual([
      "data",
      "alignment",
      "fontOptions",
      "tag",
    ]);
    expect(fields.alignment?.label).toBe("Alignment");
    expect(fields.tag?.label).toBe("Tag");
    expect(config.defaultProps).toMatchObject({
      alignment: "left",
      tag: "span",
    });
  });

  it("creates a rich-text config with string and rich-text field support", () => {
    const config = createStyledTextConfig({
      kind: "richText",
      label: "Rich Text",
      includeColor: true,
    });
    const fields = config.fields!;

    expect(fields.data.objectFields.text.filter?.types).toEqual([
      "type.string",
      "type.rich_text_v2",
    ]);
    expect(Object.keys(fields)).toEqual(["data", "fontOptions"]);
  });

  it("does not create an Alignment field when includeAlignment is false", () => {
    const config = createStyledTextConfig({
      kind: "plain",
      label: "Plain Text",
    });

    expect(config.fields!.alignment).toBeUndefined();
  });

  it("does not create a Tag field when tagOptions is omitted or empty", () => {
    const noTagConfig = createStyledTextConfig({
      kind: "plain",
      label: "No Tag",
    });
    const emptyTagConfig = createStyledTextConfig({
      kind: "plain",
      label: "Empty Tag",
      tagOptions: [],
    });

    expect(noTagConfig.fields!.tag).toBeUndefined();
    expect(emptyTagConfig.fields!.tag).toBeUndefined();
  });
});
