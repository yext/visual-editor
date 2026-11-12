import { ThemeOptions } from "../../utils/themeConfigOptions.ts";

export type ThemeOption = { readonly label: string; readonly value: string };

type BaseField = {
  readonly label: string;
  readonly variable: `--${string}`;
};

export type ThemeField = BaseField &
  (
    | { readonly type: "number"; readonly default: number }
    | {
        readonly type: "color" | "fontFamily" | "placeholder";
        readonly default: string;
      }
    | {
        readonly type: "select";
        readonly default: string;
        readonly options: readonly ThemeOption[];
      }
    | {
        readonly type: "fontWeight" | "fontStyle";
        readonly default: string;
        readonly fontFamilyKey: string;
      }
  );

export type ThemeFields = Readonly<Record<string, ThemeField>>;

export type ThemeCategory = {
  readonly label: string;
  readonly fields?: ThemeFields;
  readonly subcategories?: Readonly<Record<string, ThemeCategory>>;
};

// Placeholder fields use a plain CSS text input until dedicated controls exist.
export const themeCategories: Readonly<Record<string, ThemeCategory>> = {
  colors: {
    label: "Colors",
    subcategories: {
      surface: {
        label: "Page",
        fields: {
          colorBackground: {
            label: "Background",
            type: "color",
            default: "#FFFFFF",
            variable: "--ve-color-background",
          },
          colorForeground: {
            label: "Foreground",
            type: "color",
            default: "#000000",
            variable: "--ve-color-foreground",
          },
        },
      },
      brand: {
        label: "Brand",
        fields: {
          colorPrimary: {
            label: "Primary",
            type: "color",
            default: "#CF0A2C",
            variable: "--ve-color-primary",
          },
          colorPrimaryForeground: {
            label: "Primary Foreground",
            type: "color",
            default: "#FFFFFF",
            variable: "--ve-color-primary-foreground",
          },
          colorSecondary: {
            label: "Secondary",
            type: "color",
            default: "#737B82",
            variable: "--ve-color-secondary",
          },
          colorSecondaryForeground: {
            label: "Secondary Foreground",
            type: "color",
            default: "#000000",
            variable: "--ve-color-secondary-foreground",
          },
          colorAccent: {
            label: "Accent",
            type: "color",
            default: "#FF7E7E",
            variable: "--ve-color-accent",
          },
          colorAccentForeground: {
            label: "Accent Foreground",
            type: "color",
            default: "#000000",
            variable: "--ve-color-accent-foreground",
          },
          colorMuted: {
            label: "Muted",
            type: "color",
            default: "#EDEDED",
            variable: "--ve-color-muted",
          },
          colorMutedForeground: {
            label: "Muted Foreground",
            type: "color",
            default: "#2B2B2B",
            variable: "--ve-color-muted-foreground",
          },
        },
      },
      outline: {
        label: "Borders and Focus",
        fields: {
          colorBorder: {
            label: "Border",
            type: "color",
            default: "#D4D4D4",
            variable: "--ve-color-border",
          },
          colorFocusRing: {
            label: "Focus Ring",
            type: "color",
            default: "#CF0A2C",
            variable: "--ve-color-focus-ring",
          },
        },
      },
    },
  },
  typography: {
    label: "Typography",
    subcategories: {
      headline: {
        label: "Headline / Page Title",
        fields: {
          headlineFontFamily: {
            label: "Font Family",
            type: "fontFamily",
            default: "'Open Sans', 'Open Sans Fallback', sans-serif",
            variable: "--ve-headline-font-family",
          },
          headlineFontSize: {
            label: "Font Size",
            type: "number",
            default: 48,
            variable: "--ve-headline-font-size",
          },
          headlineMobileFontSize: {
            label: "Mobile Font Size",
            type: "number",
            default: 32,
            variable: "--ve-headline-mobile-font-size",
          },
          headlineFontWeight: {
            label: "Font Weight",
            type: "fontWeight",
            default: "700",
            fontFamilyKey: "headlineFontFamily",
            variable: "--ve-headline-font-weight",
          },
          headlineFontStyle: {
            label: "Font Style",
            type: "fontStyle",
            default: "normal",
            fontFamilyKey: "headlineFontFamily",
            variable: "--ve-headline-font-style",
          },
          headlineLineHeight: {
            label: "Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-headline-line-height",
          },
          headlineMobileLineHeight: {
            label: "Mobile Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-headline-mobile-line-height",
          },
          headlineLetterSpacing: {
            label: "Letter Spacing",
            type: "select",
            default: "0em",
            options: ThemeOptions.LETTER_SPACING,
            variable: "--ve-headline-letter-spacing",
          },
          headlineTextTransform: {
            label: "Text Transform",
            type: "select",
            default: "none",
            options: ThemeOptions.TEXT_TRANSFORM,
            variable: "--ve-headline-text-transform",
          },
        },
      },
      sectionTitle: {
        label: "Section Title",
        fields: {
          sectionTitleFontFamily: {
            label: "Font Family",
            type: "fontFamily",
            default: "'Open Sans', 'Open Sans Fallback', sans-serif",
            variable: "--ve-section-title-font-family",
          },
          sectionTitleFontSize: {
            label: "Font Size",
            type: "number",
            default: 40,
            variable: "--ve-section-title-font-size",
          },
          sectionTitleMobileFontSize: {
            label: "Mobile Font Size",
            type: "number",
            default: 28,
            variable: "--ve-section-title-mobile-font-size",
          },
          sectionTitleFontWeight: {
            label: "Font Weight",
            type: "fontWeight",
            default: "700",
            fontFamilyKey: "sectionTitleFontFamily",
            variable: "--ve-section-title-font-weight",
          },
          sectionTitleFontStyle: {
            label: "Font Style",
            type: "fontStyle",
            default: "normal",
            fontFamilyKey: "sectionTitleFontFamily",
            variable: "--ve-section-title-font-style",
          },
          sectionTitleLineHeight: {
            label: "Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-section-title-line-height",
          },
          sectionTitleMobileLineHeight: {
            label: "Mobile Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-section-title-mobile-line-height",
          },
          sectionTitleLetterSpacing: {
            label: "Letter Spacing",
            type: "select",
            default: "0em",
            options: ThemeOptions.LETTER_SPACING,
            variable: "--ve-section-title-letter-spacing",
          },
          sectionTitleTextTransform: {
            label: "Text Transform",
            type: "select",
            default: "none",
            options: ThemeOptions.TEXT_TRANSFORM,
            variable: "--ve-section-title-text-transform",
          },
        },
      },
      cardTitle: {
        label: "Card Title",
        fields: {
          cardTitleFontFamily: {
            label: "Font Family",
            type: "fontFamily",
            default: "'Open Sans', 'Open Sans Fallback', sans-serif",
            variable: "--ve-card-title-font-family",
          },
          cardTitleFontSize: {
            label: "Font Size",
            type: "number",
            default: 24,
            variable: "--ve-card-title-font-size",
          },
          cardTitleMobileFontSize: {
            label: "Mobile Font Size",
            type: "number",
            default: 20,
            variable: "--ve-card-title-mobile-font-size",
          },
          cardTitleFontWeight: {
            label: "Font Weight",
            type: "fontWeight",
            default: "700",
            fontFamilyKey: "cardTitleFontFamily",
            variable: "--ve-card-title-font-weight",
          },
          cardTitleFontStyle: {
            label: "Font Style",
            type: "fontStyle",
            default: "normal",
            fontFamilyKey: "cardTitleFontFamily",
            variable: "--ve-card-title-font-style",
          },
          cardTitleLineHeight: {
            label: "Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-card-title-line-height",
          },
          cardTitleMobileLineHeight: {
            label: "Mobile Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-card-title-mobile-line-height",
          },
          cardTitleLetterSpacing: {
            label: "Letter Spacing",
            type: "select",
            default: "0em",
            options: ThemeOptions.LETTER_SPACING,
            variable: "--ve-card-title-letter-spacing",
          },
          cardTitleTextTransform: {
            label: "Text Transform",
            type: "select",
            default: "none",
            options: ThemeOptions.TEXT_TRANSFORM,
            variable: "--ve-card-title-text-transform",
          },
        },
      },
      lead: {
        label: "Lead",
        fields: {
          leadFontFamily: {
            label: "Font Family",
            type: "fontFamily",
            default: "'Open Sans', 'Open Sans Fallback', sans-serif",
            variable: "--ve-lead-font-family",
          },
          leadFontSize: {
            label: "Font Size",
            type: "number",
            default: 20,
            variable: "--ve-lead-font-size",
          },
          leadMobileFontSize: {
            label: "Mobile Font Size",
            type: "number",
            default: 18,
            variable: "--ve-lead-mobile-font-size",
          },
          leadFontWeight: {
            label: "Font Weight",
            type: "fontWeight",
            default: "400",
            fontFamilyKey: "leadFontFamily",
            variable: "--ve-lead-font-weight",
          },
          leadFontStyle: {
            label: "Font Style",
            type: "fontStyle",
            default: "normal",
            fontFamilyKey: "leadFontFamily",
            variable: "--ve-lead-font-style",
          },
          leadLineHeight: {
            label: "Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-lead-line-height",
          },
          leadMobileLineHeight: {
            label: "Mobile Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-lead-mobile-line-height",
          },
          leadLetterSpacing: {
            label: "Letter Spacing",
            type: "select",
            default: "0em",
            options: ThemeOptions.LETTER_SPACING,
            variable: "--ve-lead-letter-spacing",
          },
          leadTextTransform: {
            label: "Text Transform",
            type: "select",
            default: "none",
            options: ThemeOptions.TEXT_TRANSFORM,
            variable: "--ve-lead-text-transform",
          },
        },
      },
      body: {
        label: "Body",
        fields: {
          bodyFontFamily: {
            label: "Font Family",
            type: "fontFamily",
            default: "'Open Sans', 'Open Sans Fallback', sans-serif",
            variable: "--ve-body-font-family",
          },
          bodyFontSize: {
            label: "Font Size",
            type: "number",
            default: 16,
            variable: "--ve-body-font-size",
          },
          bodyMobileFontSize: {
            label: "Mobile Font Size",
            type: "number",
            default: 16,
            variable: "--ve-body-mobile-font-size",
          },
          bodyFontWeight: {
            label: "Font Weight",
            type: "fontWeight",
            default: "400",
            fontFamilyKey: "bodyFontFamily",
            variable: "--ve-body-font-weight",
          },
          bodyFontStyle: {
            label: "Font Style",
            type: "fontStyle",
            default: "normal",
            fontFamilyKey: "bodyFontFamily",
            variable: "--ve-body-font-style",
          },
          bodyLineHeight: {
            label: "Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-body-line-height",
          },
          bodyMobileLineHeight: {
            label: "Mobile Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-body-mobile-line-height",
          },
          bodyLetterSpacing: {
            label: "Letter Spacing",
            type: "select",
            default: "0em",
            options: ThemeOptions.LETTER_SPACING,
            variable: "--ve-body-letter-spacing",
          },
          bodyTextTransform: {
            label: "Text Transform",
            type: "select",
            default: "none",
            options: ThemeOptions.TEXT_TRANSFORM,
            variable: "--ve-body-text-transform",
          },
        },
      },
      finePrint: {
        label: "Fine Print / Body Small",
        fields: {
          finePrintFontFamily: {
            label: "Font Family",
            type: "fontFamily",
            default: "'Open Sans', 'Open Sans Fallback', sans-serif",
            variable: "--ve-fine-print-font-family",
          },
          finePrintFontSize: {
            label: "Font Size",
            type: "number",
            default: 14,
            variable: "--ve-fine-print-font-size",
          },
          finePrintMobileFontSize: {
            label: "Mobile Font Size",
            type: "number",
            default: 14,
            variable: "--ve-fine-print-mobile-font-size",
          },
          finePrintFontWeight: {
            label: "Font Weight",
            type: "fontWeight",
            default: "400",
            fontFamilyKey: "finePrintFontFamily",
            variable: "--ve-fine-print-font-weight",
          },
          finePrintFontStyle: {
            label: "Font Style",
            type: "fontStyle",
            default: "normal",
            fontFamilyKey: "finePrintFontFamily",
            variable: "--ve-fine-print-font-style",
          },
          finePrintLineHeight: {
            label: "Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-fine-print-line-height",
          },
          finePrintMobileLineHeight: {
            label: "Mobile Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-fine-print-mobile-line-height",
          },
          finePrintLetterSpacing: {
            label: "Letter Spacing",
            type: "select",
            default: "0em",
            options: ThemeOptions.LETTER_SPACING,
            variable: "--ve-fine-print-letter-spacing",
          },
          finePrintTextTransform: {
            label: "Text Transform",
            type: "select",
            default: "none",
            options: ThemeOptions.TEXT_TRANSFORM,
            variable: "--ve-fine-print-text-transform",
          },
        },
      },
    },
  },
  buttonsAndLinks: {
    label: "Buttons and Links",
    subcategories: {
      primaryButton: {
        label: "Primary Button",
        fields: {
          primaryButtonFontFamily: {
            label: "Font Family",
            type: "fontFamily",
            default: "'Open Sans', 'Open Sans Fallback', sans-serif",
            variable: "--ve-primary-button-font-family",
          },
          primaryButtonFontSize: {
            label: "Font Size",
            type: "number",
            default: 16,
            variable: "--ve-primary-button-font-size",
          },
          primaryButtonMobileFontSize: {
            label: "Mobile Font Size",
            type: "number",
            default: 16,
            variable: "--ve-primary-button-mobile-font-size",
          },
          primaryButtonFontStyle: {
            label: "Font Style",
            type: "fontStyle",
            default: "normal",
            fontFamilyKey: "primaryButtonFontFamily",
            variable: "--ve-primary-button-font-style",
          },
          primaryButtonLineHeight: {
            label: "Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-primary-button-line-height",
          },
          primaryButtonMobileLineHeight: {
            label: "Mobile Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-primary-button-mobile-line-height",
          },
          primaryButtonLetterSpacing: {
            label: "Letter Spacing",
            type: "select",
            default: "0em",
            options: ThemeOptions.LETTER_SPACING,
            variable: "--ve-primary-button-letter-spacing",
          },
          primaryButtonTextTransform: {
            label: "Text Transform",
            type: "select",
            default: "none",
            options: ThemeOptions.TEXT_TRANSFORM,
            variable: "--ve-primary-button-text-transform",
          },
          primaryButtonTransition: {
            label: "Transition",
            type: "placeholder",
            default: "none",
            variable: "--ve-primary-button-transition",
          },
          primaryButtonPadding: {
            label: "Padding",
            type: "placeholder",
            default: "12px 24px",
            variable: "--ve-primary-button-padding",
          },
          primaryButtonBorderRadius: {
            label: "Border Radius",
            type: "number",
            default: 4,
            variable: "--ve-primary-button-border-radius",
          },
          primaryButtonBorderWidth: {
            label: "Border Weight",
            type: "placeholder",
            default: "1px",
            variable: "--ve-primary-button-border-width",
          },
          primaryButtonDefaultFontWeight: {
            label: "Default Font Weight",
            type: "fontWeight",
            default: "400",
            fontFamilyKey: "primaryButtonFontFamily",
            variable: "--ve-primary-button-default-font-weight",
          },
          primaryButtonDefaultTextDecoration: {
            label: "Default Text Decoration",
            type: "placeholder",
            default: "none",
            variable: "--ve-primary-button-default-text-decoration",
          },
          primaryButtonDefaultBackgroundColor: {
            label: "Default Background Color",
            type: "color",
            default: "#CF0A2C",
            variable: "--ve-primary-button-default-background-color",
          },
          primaryButtonDefaultBackgroundColorOnDark: {
            label: "Default Background Color on Dark Surface",
            type: "color",
            default: "#CF0A2C",
            variable: "--ve-primary-button-default-background-color-on-dark",
          },
          primaryButtonDefaultTextColor: {
            label: "Default Text Color",
            type: "color",
            default: "#FFFFFF",
            variable: "--ve-primary-button-default-text-color",
          },
          primaryButtonDefaultTextColorOnDark: {
            label: "Default Text Color on Dark Surface",
            type: "color",
            default: "#FFFFFF",
            variable: "--ve-primary-button-default-text-color-on-dark",
          },
          primaryButtonDefaultBorderColor: {
            label: "Default Border Color",
            type: "color",
            default: "#CF0A2C",
            variable: "--ve-primary-button-default-border-color",
          },
          primaryButtonDefaultBorderColorOnDark: {
            label: "Default Border Color on Dark Surface",
            type: "color",
            default: "#FFFFFF",
            variable: "--ve-primary-button-default-border-color-on-dark",
          },
        },
        subcategories: {
          hover: {
            label: "Hover",
            fields: {
              primaryButtonHoverFontWeight: {
                label: "Hover Font Weight",
                type: "fontWeight",
                default: "400",
                fontFamilyKey: "primaryButtonFontFamily",
                variable: "--ve-primary-button-hover-font-weight",
              },
              primaryButtonHoverTextDecoration: {
                label: "Hover Text Decoration",
                type: "placeholder",
                default: "none",
                variable: "--ve-primary-button-hover-text-decoration",
              },
              primaryButtonHoverBackgroundColor: {
                label: "Hover Background Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-primary-button-hover-background-color",
              },
              primaryButtonHoverBackgroundColorOnDark: {
                label: "Hover Background Color on Dark Surface",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-primary-button-hover-background-color-on-dark",
              },
              primaryButtonHoverTextColor: {
                label: "Hover Text Color",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-primary-button-hover-text-color",
              },
              primaryButtonHoverTextColorOnDark: {
                label: "Hover Text Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-primary-button-hover-text-color-on-dark",
              },
              primaryButtonHoverBorderColor: {
                label: "Hover Border Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-primary-button-hover-border-color",
              },
              primaryButtonHoverBorderColorOnDark: {
                label: "Hover Border Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-primary-button-hover-border-color-on-dark",
              },
            },
          },
          active: {
            label: "Active",
            fields: {
              primaryButtonActiveFontWeight: {
                label: "Active Font Weight",
                type: "fontWeight",
                default: "400",
                fontFamilyKey: "primaryButtonFontFamily",
                variable: "--ve-primary-button-active-font-weight",
              },
              primaryButtonActiveTextDecoration: {
                label: "Active Text Decoration",
                type: "placeholder",
                default: "none",
                variable: "--ve-primary-button-active-text-decoration",
              },
              primaryButtonActiveBackgroundColor: {
                label: "Active Background Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-primary-button-active-background-color",
              },
              primaryButtonActiveBackgroundColorOnDark: {
                label: "Active Background Color on Dark Surface",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-primary-button-active-background-color-on-dark",
              },
              primaryButtonActiveTextColor: {
                label: "Active Text Color",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-primary-button-active-text-color",
              },
              primaryButtonActiveTextColorOnDark: {
                label: "Active Text Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-primary-button-active-text-color-on-dark",
              },
              primaryButtonActiveBorderColor: {
                label: "Active Border Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-primary-button-active-border-color",
              },
              primaryButtonActiveBorderColorOnDark: {
                label: "Active Border Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-primary-button-active-border-color-on-dark",
              },
            },
          },
        },
      },
      secondaryButton: {
        label: "Secondary Button",
        fields: {
          secondaryButtonFontFamily: {
            label: "Font Family",
            type: "fontFamily",
            default: "'Open Sans', 'Open Sans Fallback', sans-serif",
            variable: "--ve-secondary-button-font-family",
          },
          secondaryButtonFontSize: {
            label: "Font Size",
            type: "number",
            default: 16,
            variable: "--ve-secondary-button-font-size",
          },
          secondaryButtonMobileFontSize: {
            label: "Mobile Font Size",
            type: "number",
            default: 16,
            variable: "--ve-secondary-button-mobile-font-size",
          },
          secondaryButtonFontStyle: {
            label: "Font Style",
            type: "fontStyle",
            default: "normal",
            fontFamilyKey: "secondaryButtonFontFamily",
            variable: "--ve-secondary-button-font-style",
          },
          secondaryButtonLineHeight: {
            label: "Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-secondary-button-line-height",
          },
          secondaryButtonMobileLineHeight: {
            label: "Mobile Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-secondary-button-mobile-line-height",
          },
          secondaryButtonLetterSpacing: {
            label: "Letter Spacing",
            type: "select",
            default: "0em",
            options: ThemeOptions.LETTER_SPACING,
            variable: "--ve-secondary-button-letter-spacing",
          },
          secondaryButtonTextTransform: {
            label: "Text Transform",
            type: "select",
            default: "none",
            options: ThemeOptions.TEXT_TRANSFORM,
            variable: "--ve-secondary-button-text-transform",
          },
          secondaryButtonTransition: {
            label: "Transition",
            type: "placeholder",
            default: "none",
            variable: "--ve-secondary-button-transition",
          },
          secondaryButtonPadding: {
            label: "Padding",
            type: "placeholder",
            default: "12px 24px",
            variable: "--ve-secondary-button-padding",
          },
          secondaryButtonBorderRadius: {
            label: "Border Radius",
            type: "number",
            default: 4,
            variable: "--ve-secondary-button-border-radius",
          },
          secondaryButtonBorderWidth: {
            label: "Border Weight",
            type: "placeholder",
            default: "1px",
            variable: "--ve-secondary-button-border-width",
          },
          secondaryButtonDefaultFontWeight: {
            label: "Default Font Weight",
            type: "fontWeight",
            default: "400",
            fontFamilyKey: "secondaryButtonFontFamily",
            variable: "--ve-secondary-button-default-font-weight",
          },
          secondaryButtonDefaultTextDecoration: {
            label: "Default Text Decoration",
            type: "placeholder",
            default: "none",
            variable: "--ve-secondary-button-default-text-decoration",
          },
          secondaryButtonDefaultBackgroundColor: {
            label: "Default Background Color",
            type: "color",
            default: "transparent",
            variable: "--ve-secondary-button-default-background-color",
          },
          secondaryButtonDefaultBackgroundColorOnDark: {
            label: "Default Background Color on Dark Surface",
            type: "color",
            default: "transparent",
            variable: "--ve-secondary-button-default-background-color-on-dark",
          },
          secondaryButtonDefaultTextColor: {
            label: "Default Text Color",
            type: "color",
            default: "#CF0A2C",
            variable: "--ve-secondary-button-default-text-color",
          },
          secondaryButtonDefaultTextColorOnDark: {
            label: "Default Text Color on Dark Surface",
            type: "color",
            default: "#FFFFFF",
            variable: "--ve-secondary-button-default-text-color-on-dark",
          },
          secondaryButtonDefaultBorderColor: {
            label: "Default Border Color",
            type: "color",
            default: "#CF0A2C",
            variable: "--ve-secondary-button-default-border-color",
          },
          secondaryButtonDefaultBorderColorOnDark: {
            label: "Default Border Color on Dark Surface",
            type: "color",
            default: "#FFFFFF",
            variable: "--ve-secondary-button-default-border-color-on-dark",
          },
        },
        subcategories: {
          hover: {
            label: "Hover",
            fields: {
              secondaryButtonHoverFontWeight: {
                label: "Hover Font Weight",
                type: "fontWeight",
                default: "400",
                fontFamilyKey: "secondaryButtonFontFamily",
                variable: "--ve-secondary-button-hover-font-weight",
              },
              secondaryButtonHoverTextDecoration: {
                label: "Hover Text Decoration",
                type: "placeholder",
                default: "none",
                variable: "--ve-secondary-button-hover-text-decoration",
              },
              secondaryButtonHoverBackgroundColor: {
                label: "Hover Background Color",
                type: "color",
                default: "transparent",
                variable: "--ve-secondary-button-hover-background-color",
              },
              secondaryButtonHoverBackgroundColorOnDark: {
                label: "Hover Background Color on Dark Surface",
                type: "color",
                default: "transparent",
                variable:
                  "--ve-secondary-button-hover-background-color-on-dark",
              },
              secondaryButtonHoverTextColor: {
                label: "Hover Text Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-secondary-button-hover-text-color",
              },
              secondaryButtonHoverTextColorOnDark: {
                label: "Hover Text Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-secondary-button-hover-text-color-on-dark",
              },
              secondaryButtonHoverBorderColor: {
                label: "Hover Border Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-secondary-button-hover-border-color",
              },
              secondaryButtonHoverBorderColorOnDark: {
                label: "Hover Border Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-secondary-button-hover-border-color-on-dark",
              },
            },
          },
          active: {
            label: "Active",
            fields: {
              secondaryButtonActiveFontWeight: {
                label: "Active Font Weight",
                type: "fontWeight",
                default: "400",
                fontFamilyKey: "secondaryButtonFontFamily",
                variable: "--ve-secondary-button-active-font-weight",
              },
              secondaryButtonActiveTextDecoration: {
                label: "Active Text Decoration",
                type: "placeholder",
                default: "none",
                variable: "--ve-secondary-button-active-text-decoration",
              },
              secondaryButtonActiveBackgroundColor: {
                label: "Active Background Color",
                type: "color",
                default: "transparent",
                variable: "--ve-secondary-button-active-background-color",
              },
              secondaryButtonActiveBackgroundColorOnDark: {
                label: "Active Background Color on Dark Surface",
                type: "color",
                default: "transparent",
                variable:
                  "--ve-secondary-button-active-background-color-on-dark",
              },
              secondaryButtonActiveTextColor: {
                label: "Active Text Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-secondary-button-active-text-color",
              },
              secondaryButtonActiveTextColorOnDark: {
                label: "Active Text Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-secondary-button-active-text-color-on-dark",
              },
              secondaryButtonActiveBorderColor: {
                label: "Active Border Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-secondary-button-active-border-color",
              },
              secondaryButtonActiveBorderColorOnDark: {
                label: "Active Border Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-secondary-button-active-border-color-on-dark",
              },
            },
          },
        },
      },
      link: {
        label: "Link",
        fields: {
          linkFontFamily: {
            label: "Font Family",
            type: "fontFamily",
            default: "'Open Sans', 'Open Sans Fallback', sans-serif",
            variable: "--ve-link-font-family",
          },
          linkFontSize: {
            label: "Font Size",
            type: "number",
            default: 16,
            variable: "--ve-link-font-size",
          },
          linkMobileFontSize: {
            label: "Mobile Font Size",
            type: "number",
            default: 16,
            variable: "--ve-link-mobile-font-size",
          },
          linkFontStyle: {
            label: "Font Style",
            type: "fontStyle",
            default: "normal",
            fontFamilyKey: "linkFontFamily",
            variable: "--ve-link-font-style",
          },
          linkLineHeight: {
            label: "Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-link-line-height",
          },
          linkMobileLineHeight: {
            label: "Mobile Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-link-mobile-line-height",
          },
          linkLetterSpacing: {
            label: "Letter Spacing",
            type: "select",
            default: "0em",
            options: ThemeOptions.LETTER_SPACING,
            variable: "--ve-link-letter-spacing",
          },
          linkTextTransform: {
            label: "Text Transform",
            type: "select",
            default: "none",
            options: ThemeOptions.TEXT_TRANSFORM,
            variable: "--ve-link-text-transform",
          },
          linkTransition: {
            label: "Transition",
            type: "placeholder",
            default: "none",
            variable: "--ve-link-transition",
          },
          linkDefaultFontWeight: {
            label: "Default Font Weight",
            type: "fontWeight",
            default: "400",
            fontFamilyKey: "linkFontFamily",
            variable: "--ve-link-default-font-weight",
          },
          linkDefaultTextDecoration: {
            label: "Default Text Decoration",
            type: "placeholder",
            default: "none",
            variable: "--ve-link-default-text-decoration",
          },
          linkDefaultTextColor: {
            label: "Default Text Color",
            type: "color",
            default: "#CF0A2C",
            variable: "--ve-link-default-text-color",
          },
          linkDefaultTextColorOnDark: {
            label: "Default Text Color on Dark Surface",
            type: "color",
            default: "#FFFFFF",
            variable: "--ve-link-default-text-color-on-dark",
          },
        },
        subcategories: {
          hover: {
            label: "Hover",
            fields: {
              linkHoverFontWeight: {
                label: "Hover Font Weight",
                type: "fontWeight",
                default: "400",
                fontFamilyKey: "linkFontFamily",
                variable: "--ve-link-hover-font-weight",
              },
              linkHoverTextDecoration: {
                label: "Hover Text Decoration",
                type: "placeholder",
                default: "none",
                variable: "--ve-link-hover-text-decoration",
              },
              linkHoverTextColor: {
                label: "Hover Text Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-link-hover-text-color",
              },
              linkHoverTextColorOnDark: {
                label: "Hover Text Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-link-hover-text-color-on-dark",
              },
            },
          },
          active: {
            label: "Active",
            fields: {
              linkActiveFontWeight: {
                label: "Active Font Weight",
                type: "fontWeight",
                default: "400",
                fontFamilyKey: "linkFontFamily",
                variable: "--ve-link-active-font-weight",
              },
              linkActiveTextDecoration: {
                label: "Active Text Decoration",
                type: "placeholder",
                default: "none",
                variable: "--ve-link-active-text-decoration",
              },
              linkActiveTextColor: {
                label: "Active Text Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-link-active-text-color",
              },
              linkActiveTextColorOnDark: {
                label: "Active Text Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-link-active-text-color-on-dark",
              },
            },
          },
        },
      },
      navigationLink: {
        label: "Navigation Link",
        fields: {
          navigationLinkFontFamily: {
            label: "Font Family",
            type: "fontFamily",
            default: "'Open Sans', 'Open Sans Fallback', sans-serif",
            variable: "--ve-navigation-link-font-family",
          },
          navigationLinkFontSize: {
            label: "Font Size",
            type: "number",
            default: 16,
            variable: "--ve-navigation-link-font-size",
          },
          navigationLinkMobileFontSize: {
            label: "Mobile Font Size",
            type: "number",
            default: 16,
            variable: "--ve-navigation-link-mobile-font-size",
          },
          navigationLinkFontStyle: {
            label: "Font Style",
            type: "fontStyle",
            default: "normal",
            fontFamilyKey: "navigationLinkFontFamily",
            variable: "--ve-navigation-link-font-style",
          },
          navigationLinkLineHeight: {
            label: "Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-navigation-link-line-height",
          },
          navigationLinkMobileLineHeight: {
            label: "Mobile Line Height",
            type: "placeholder",
            default: "1.5",
            variable: "--ve-navigation-link-mobile-line-height",
          },
          navigationLinkLetterSpacing: {
            label: "Letter Spacing",
            type: "select",
            default: "0em",
            options: ThemeOptions.LETTER_SPACING,
            variable: "--ve-navigation-link-letter-spacing",
          },
          navigationLinkTextTransform: {
            label: "Text Transform",
            type: "select",
            default: "none",
            options: ThemeOptions.TEXT_TRANSFORM,
            variable: "--ve-navigation-link-text-transform",
          },
          navigationLinkTransition: {
            label: "Transition",
            type: "placeholder",
            default: "none",
            variable: "--ve-navigation-link-transition",
          },
          navigationLinkDefaultFontWeight: {
            label: "Default Font Weight",
            type: "fontWeight",
            default: "400",
            fontFamilyKey: "navigationLinkFontFamily",
            variable: "--ve-navigation-link-default-font-weight",
          },
          navigationLinkDefaultTextDecoration: {
            label: "Default Text Decoration",
            type: "placeholder",
            default: "none",
            variable: "--ve-navigation-link-default-text-decoration",
          },
          navigationLinkDefaultTextColor: {
            label: "Default Text Color",
            type: "color",
            default: "#CF0A2C",
            variable: "--ve-navigation-link-default-text-color",
          },
          navigationLinkDefaultTextColorOnDark: {
            label: "Default Text Color on Dark Surface",
            type: "color",
            default: "#FFFFFF",
            variable: "--ve-navigation-link-default-text-color-on-dark",
          },
        },
        subcategories: {
          hover: {
            label: "Hover",
            fields: {
              navigationLinkHoverFontWeight: {
                label: "Hover Font Weight",
                type: "fontWeight",
                default: "400",
                fontFamilyKey: "navigationLinkFontFamily",
                variable: "--ve-navigation-link-hover-font-weight",
              },
              navigationLinkHoverTextDecoration: {
                label: "Hover Text Decoration",
                type: "placeholder",
                default: "none",
                variable: "--ve-navigation-link-hover-text-decoration",
              },
              navigationLinkHoverTextColor: {
                label: "Hover Text Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-navigation-link-hover-text-color",
              },
              navigationLinkHoverTextColorOnDark: {
                label: "Hover Text Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-navigation-link-hover-text-color-on-dark",
              },
            },
          },
          active: {
            label: "Active",
            fields: {
              navigationLinkActiveFontWeight: {
                label: "Active Font Weight",
                type: "fontWeight",
                default: "400",
                fontFamilyKey: "navigationLinkFontFamily",
                variable: "--ve-navigation-link-active-font-weight",
              },
              navigationLinkActiveTextDecoration: {
                label: "Active Text Decoration",
                type: "placeholder",
                default: "none",
                variable: "--ve-navigation-link-active-text-decoration",
              },
              navigationLinkActiveTextColor: {
                label: "Active Text Color",
                type: "color",
                default: "#CF0A2C",
                variable: "--ve-navigation-link-active-text-color",
              },
              navigationLinkActiveTextColorOnDark: {
                label: "Active Text Color on Dark Surface",
                type: "color",
                default: "#FFFFFF",
                variable: "--ve-navigation-link-active-text-color-on-dark",
              },
            },
          },
        },
      },
    },
  },
  pageStyles: {
    label: "Page Styles",
    subcategories: {
      images: {
        label: "Images",
        fields: {
          imageBorderRadius: {
            label: "Image Border Radius",
            type: "number",
            default: 0,
            variable: "--ve-image-border-radius",
          },
        },
      },
      cards: {
        label: "Cards",
        fields: {
          cardBorderRadius: {
            label: "Card Border Radius",
            type: "number",
            default: 4,
            variable: "--ve-card-border-radius",
          },
          cardBorderWidth: {
            label: "Card Border Weight",
            type: "placeholder",
            default: "1px",
            variable: "--ve-card-border-width",
          },
        },
      },
      layout: {
        label: "Layout",
        fields: {
          pageContentMaxWidth: {
            label: "Content Max Width",
            type: "number",
            default: 1024,
            variable: "--ve-page-content-max-width",
          },
          pageSectionVerticalSpacing: {
            label: "Section Vertical Spacing",
            type: "number",
            default: 32,
            variable: "--ve-page-section-vertical-spacing",
          },
        },
      },
    },
  },
};

export const flattenThemeFields = (
  categories: Readonly<Record<string, ThemeCategory>>
): ThemeFields =>
  Object.fromEntries(
    Object.values(categories).flatMap((category) => [
      ...Object.entries(category.fields ?? {}),
      ...Object.entries(flattenThemeFields(category.subcategories ?? {})),
    ])
  );

export const themeFields = flattenThemeFields(themeCategories);
