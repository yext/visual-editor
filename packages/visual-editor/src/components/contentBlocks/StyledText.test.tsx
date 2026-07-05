import React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { BackgroundProvider } from "../../hooks/useBackground.tsx";
import { VisualEditorProvider } from "../../utils/VisualEditorProvider.tsx";
import {
  createStyledTextConfig,
  type StyledPlainTextProps,
  type StyledRichTextProps,
} from "./createStyledTextConfig.tsx";
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

  it("renders owned plain text with typography, alignment, and tag settings", () => {
    renderWithProviders(
      <StyledPlainText
        {...{
          data: {
            text: {
              field: "c_heading",
              constantValue: { defaultValue: "Shared title" },
              constantValueEnabled: true,
            },
          },
          fontOptions: {
            text: {
              fontFamily: "Georgia, serif",
              fontSize: "18px",
              fontWeight: "700",
              fontStyle: "italic",
              textTransform: "uppercase",
            },
          },
          alignment: "center",
          tag: "h3",
          puck: { isEditing: false },
        }}
      />
    );

    const text = screen.getByText("Shared title");
    expect(text.tagName).toBe("H3");
    expect(text.className).toContain("text-center");
    expect(text).toHaveStyle({
      fontFamily: "Georgia, serif",
      fontSize: "18px",
      fontWeight: "700",
      fontStyle: "italic",
      textTransform: "uppercase",
    });
  });

  it("renders owned plain text with palette color and tag settings", () => {
    renderWithProviders(
      <StyledPlainText
        {...{
          data: {
            text: {
              field: "",
              constantValue: { defaultValue: "Hero Heading" },
              constantValueEnabled: true,
            },
          },
          fontOptions: {
            color: {
              selectedColor: "palette-secondary",
              contrastingColor: "palette-secondary-contrast",
            },
            text: {
              fontFamily: "default",
              fontSize: "default",
              fontWeight: "default",
              fontStyle: "default",
              textTransform: "default",
            },
          },
          alignment: "right",
          tag: "h2",
          puck: { isEditing: false },
        }}
      />
    );

    const text = screen.getByText("Hero Heading");
    expect(text.tagName).toBe("H2");
    expect(text.className).toContain("text-right");
    expect(text.className).toContain("text-palette-secondary");
  });

  it("renders owned plain text with custom color", () => {
    renderWithProviders(
      <StyledPlainText
        {...{
          data: {
            text: {
              field: "",
              constantValue: { defaultValue: "Geomodifier" },
              constantValueEnabled: true,
            },
          },
          fontOptions: {
            color: {
              selectedColor: "[#123456]",
              contrastingColor: "white",
            },
            text: {
              fontFamily: "default",
              fontSize: "default",
              fontWeight: "default",
              fontStyle: "default",
              textTransform: "default",
            },
          },
          puck: { isEditing: false },
        }}
      />
    );

    expect(screen.getByText("Geomodifier")).toHaveStyle({
      color: "rgb(18, 52, 86)",
    });
  });

  it("renders owned rich text through the shared rich text renderer", () => {
    const { container } = renderWithProviders(
      <StyledRichText
        {...{
          data: {
            text: {
              field: "c_description",
              constantValue: {
                defaultValue: { html: "<p>Hello <strong>world</strong></p>" },
              },
              constantValueEnabled: true,
            },
          },
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
          puck: { isEditing: false },
        }}
      />
    );

    const wrapper = container.querySelector(".rtf-wrapper") as HTMLElement;
    expect(wrapper).toBeTruthy();
    expect(wrapper.style.color).toBe("rgb(18, 52, 86)");
    expect(wrapper.style.getPropertyValue("--fontFamily-body-fontFamily")).toBe(
      "'Weights Only', sans-serif"
    );
    expect(wrapper.style.getPropertyValue("--fontSize-body-fontSize")).toBe(
      "20px"
    );
  });

  it("renders owned rich text with palette color and alignment", () => {
    const { container } = renderWithProviders(
      <StyledRichText
        {...{
          data: {
            text: {
              field: "",
              constantValue: {
                defaultValue: {
                  html: "<p>Hero description</p>",
                },
              },
              constantValueEnabled: true,
            },
          },
          fontOptions: {
            color: {
              selectedColor: "palette-secondary",
              contrastingColor: "palette-secondary-contrast",
            },
            text: {
              fontFamily: "default",
              fontSize: "default",
              fontWeight: "default",
              fontStyle: "default",
              textTransform: "default",
            },
          },
          alignment: "center",
          puck: { isEditing: false },
        }}
      />
    );

    const wrapper = container.querySelector(".rtf-wrapper") as HTMLElement;
    expect(wrapper.className).toContain("text-center");
    expect(wrapper.className).toContain("text-palette-secondary");
  });

  it("renders repeated plain text by reusing shared style props with local data", () => {
    const sharedTitleProps = {
      fontOptions: {
        color: {
          selectedColor: "[#123456]",
          contrastingColor: "white",
        },
        text: {
          fontFamily: "Georgia, serif",
          fontSize: "19px",
          fontWeight: "700",
          fontStyle: "italic",
          textTransform: "uppercase",
        },
      },
      alignment: "right" as const,
      tag: "h3" as const,
      puck: { isEditing: false },
    } satisfies Omit<StyledPlainTextProps, "data"> & {
      puck: { isEditing: boolean };
    };

    renderWithProviders(
      <StyledPlainText
        {...sharedTitleProps}
        data={{
          text: {
            field: "cards.0.title",
            constantValue: { defaultValue: "Repeated title" },
            constantValueEnabled: true,
          },
        }}
      />
    );

    const text = screen.getByText("Repeated title");
    expect(text.tagName).toBe("H3");
    expect(text.className).toContain("text-right");
    expect(text).toHaveStyle({
      color: "rgb(18, 52, 86)",
      fontFamily: "Georgia, serif",
      fontSize: "19px",
      fontWeight: "700",
      fontStyle: "italic",
      textTransform: "uppercase",
    });
  });

  it("renders repeated rich text by reusing shared style props with local data", () => {
    const sharedBodyProps = {
      fontOptions: {
        text: {
          fontFamily: "Georgia, serif",
          fontSize: "19px",
          fontWeight: "700",
          fontStyle: "italic",
          textTransform: "uppercase",
        },
      },
      alignment: "right" as const,
      puck: { isEditing: false },
    } satisfies Omit<StyledRichTextProps, "data"> & {
      puck: { isEditing: boolean };
    };

    const { container } = renderWithProviders(
      <StyledRichText
        {...sharedBodyProps}
        data={{
          text: {
            field: "cards.0.description",
            constantValue: {
              defaultValue: {
                html: "<p>Repeated body copy</p>",
              },
            },
            constantValueEnabled: true,
          },
        }}
      />
    );

    const wrapper = container.querySelector(".rtf-wrapper") as HTMLElement;
    expect(wrapper.className).toContain("text-right");
    expect(wrapper.style.getPropertyValue("--fontFamily-body-fontFamily")).toBe(
      "Georgia, serif"
    );
    expect(wrapper.style.getPropertyValue("--fontSize-body-fontSize")).toBe(
      "19px"
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
    expect(String(fields.data.label)).toContain("Text");
    expect(String(fields.fontOptions.label)).toContain("Font Options");
    expect(fields.data.objectFields.text.filter?.types).toEqual([
      "type.string",
    ]);
    expect(fields.fontOptions.type).toBe("styledText");
    expect(fields.fontOptions.includeColor).toBe(true);
    expect(String(fields.fontOptions.colorLabel)).toContain("Font Color");
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
      "fontOptions",
      "alignment",
      "tag",
    ]);
    expect(String(fields.alignment?.label)).toContain("Alignment");
    expect(String(fields.tag?.label)).toContain("Tag");
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

  it("allows config style props to be reused while each instance owns its data", () => {
    const sharedConfig = createStyledTextConfig({
      kind: "plain",
      label: "Card Title",
      includeColor: true,
      includeAlignment: true,
      tagOptions: ["h3", "div"],
    });
    const sharedDefaultProps =
      sharedConfig.defaultProps as StyledPlainTextProps;

    renderWithProviders(
      <StyledPlainText
        {...sharedDefaultProps}
        data={{
          text: {
            field: "cards.1.title",
            constantValue: { defaultValue: "Card title" },
            constantValueEnabled: true,
          },
        }}
      />
    );

    expect(screen.getByText("Card title").tagName).toBe("H3");
  });
});
