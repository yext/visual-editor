import {
  ThemeConfig,
  defaultFonts,
  FontRegistry,
  getFontWeightOptions,
  constructFontSelectOptions,
  ThemeOptions,
  msg,
} from "@yext/visual-editor";

const fonts: FontRegistry = {
  // other developer defined fonts here
  ...defaultFonts,
};
const fontOptions = constructFontSelectOptions(fonts);
const fontWeightOptions = (fontVariable?: string) => {
  return () =>
    getFontWeightOptions({
      fontCssVariable: fontVariable,
      fontList: fonts,
    });
};

export const defaultThemeConfig: ThemeConfig = {
  palette: {
    label: msg("theme.colors.colors", "Colors"),
    styles: {
      primary: {
        label: msg("theme.colors.primary", "Primary"),
        type: "color",
        default: "#CF0A2C",
        plugin: "colors",
      },
      secondary: {
        label: msg("theme.colors.secondary", "Secondary"),
        type: "color",
        default: "#737B82",
        plugin: "colors",
      },
      tertiary: {
        label: msg("theme.colors.tertiary", "Tertiary"),
        type: "color",
        default: "#FF7E7E",
        plugin: "colors",
      },
      quaternary: {
        label: msg("theme.colors.quaternary", "Quaternary"),
        type: "color",
        default: "#000000",
        plugin: "colors",
      },
    },
  },
  h1: {
    label: "H1",
    styles: {
      fontFamily: {
        label: msg("theme.font", "Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("theme.fontSize", "Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "48px",
      },
      fontWeight: {
        label: msg("theme.fontWeight.fontWeight", "Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-h1-fontFamily"),
        default: "700",
      },
    },
  },
  h2: {
    label: "H2",
    styles: {
      fontFamily: {
        label: msg("theme.font", "Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("theme.fontSize", "Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "40px",
      },
      fontWeight: {
        label: msg("theme.fontWeight.fontWeight", "Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-h2-fontFamily"),
        default: "700",
      },
    },
  },
  h3: {
    label: "H3",
    styles: {
      fontFamily: {
        label: msg("theme.font", "Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("theme.fontSize", "Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "32px",
      },
      fontWeight: {
        label: msg("theme.fontWeight.fontWeight", "Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-h3-fontFamily"),
        default: "700",
      },
    },
  },
  h4: {
    label: "H4",
    styles: {
      fontFamily: {
        label: msg("theme.font", "Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("theme.fontSize", "Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "24px",
      },
      fontWeight: {
        label: msg("theme.fontWeight.fontWeight", "Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-h4-fontFamily"),
        default: "700",
      },
    },
  },
  h5: {
    label: "H5",
    styles: {
      fontFamily: {
        label: msg("theme.font", "Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("theme.fontSize", "Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "20px",
      },
      fontWeight: {
        label: msg("theme.fontWeight.fontWeight", "Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-h5-fontFamily"),
        default: "700",
      },
    },
  },
  h6: {
    label: "H6",
    styles: {
      fontFamily: {
        label: msg("theme.font", "Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("theme.fontSize", "Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "18px",
      },
      fontWeight: {
        label: msg("theme.fontWeight.fontWeight", "Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-h6-fontFamily"),
        default: "700",
      },
    },
  },
  body: {
    label: msg("theme.bodyText", "Body Text"),
    styles: {
      fontFamily: {
        label: msg("theme.font", "Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("theme.fontSize", "Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "16px",
      },
      fontWeight: {
        label: msg("theme.fontWeight.fontWeight", "Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-body-fontFamily"),
        default: "400",
      },
    },
  },
  pageSection: {
    label: msg("theme.pageSection", "Page Section"),
    styles: {
      contentWidth: {
        label: msg("theme.contentWidth.contentWidth", "Content Width"),
        type: "select",
        plugin: "maxWidth",
        options: [
          {
            label: msg("theme.contentWidth.compact", "Compact (768px)"),
            value: "768px",
          },
          {
            label: msg("theme.contentWidth.narrow", "Narrow (960px)"),
            value: "960px",
          },
          {
            label: msg("theme.contentWidth.standard", "Standard (1024px)"),
            value: "1024px",
          },
          {
            label: msg("theme.contentWidth.wide", "Wide (1280px)"),
            value: "1280px",
          },
          {
            label: msg("theme.contentWidth.extraWide", "Extra Wide (1440px)"),
            value: "1440px",
          },
        ],
        default: "1024px",
      },
      verticalPadding: {
        label: msg("theme.topBottomPadding", "Top/Bottom Padding"),
        type: "select",
        plugin: "padding",
        options: ThemeOptions.SPACING,
        default: "32px",
      },
    },
  },
  button: {
    label: msg("theme.button", "Button"),
    styles: {
      fontFamily: {
        label: msg("theme.font", "Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("theme.fontSize", "Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "16px",
      },
      fontWeight: {
        label: msg("theme.fontWeight.fontWeight", "Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-button-fontFamily"),
        default: "400",
      },
      textTransform: {
        label: msg("theme.textTransform.textTransform", "Text Transform"),
        type: "select",
        plugin: "textTransform",
        options: ThemeOptions.TEXT_TRANSFORM,
        default: "none",
      },
      letterSpacing: {
        label: msg("theme.letterSpacing.letterSpacing", "Letter Spacing"),
        type: "select",
        plugin: "letterSpacing",
        options: ThemeOptions.LETTER_SPACING,
        default: "0em",
      },
    },
  },
  link: {
    label: msg("theme.links", "Links"),
    styles: {
      fontFamily: {
        label: msg("theme.font", "Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("theme.fontSize", "Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "16px",
      },
      fontWeight: {
        label: msg("theme.fontWeight.fontWeight", "Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-link-fontFamily"),
        default: "400",
      },
      textTransform: {
        label: msg("theme.textTransform.textTransform", "Text Transform"),
        type: "select",
        plugin: "textTransform",
        options: ThemeOptions.TEXT_TRANSFORM,
        default: "none",
      },
      letterSpacing: {
        label: msg("theme.letterSpacing.letterSpacing", "Letter Spacing"),
        type: "select",
        plugin: "letterSpacing",
        options: ThemeOptions.LETTER_SPACING,
        default: "0em",
      },
      caret: {
        label: msg("theme.includeCaret", "Include Caret"),
        type: "select",
        plugin: "display",
        options: [
          { label: msg("fields.options.yes", "Yes"), value: "block" },
          { label: msg("fields.options.no", "No"), value: "none" },
        ],
        default: "block",
      },
    },
  },
  image: {
    label: msg("theme.image", "Image"),
    styles: {
      borderRadius: {
        label: msg("theme.borderRadius", "Border Radius"),
        type: "select",
        plugin: "borderRadius",
        options: ThemeOptions.IMAGE_BORDER_RADIUS,
        default: "0px",
      },
    },
  },
};
