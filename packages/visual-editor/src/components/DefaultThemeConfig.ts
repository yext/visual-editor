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
    label: msg("Colors"),
    styles: {
      primary: {
        label: msg("Primary"),
        type: "color",
        default: "#CF0A2C",
        plugin: "colors",
      },
      secondary: {
        label: msg("Secondary"),
        type: "color",
        default: "#737B82",
        plugin: "colors",
      },
      tertiary: {
        label: msg("Tertiary"),
        type: "color",
        default: "#FF7E7E",
        plugin: "colors",
      },
      quaternary: {
        label: msg("Quaternary"),
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
        label: msg("Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "48px",
      },
      fontWeight: {
        label: msg("Font Weight"),
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
        label: msg("Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "40px",
      },
      fontWeight: {
        label: msg("Font Weight"),
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
        label: msg("Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "32px",
      },
      fontWeight: {
        label: msg("Font Weight"),
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
        label: msg("Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "24px",
      },
      fontWeight: {
        label: msg("Font Weight"),
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
        label: msg("Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "20px",
      },
      fontWeight: {
        label: msg("Font Weight"),
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
        label: msg("Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "18px",
      },
      fontWeight: {
        label: msg("Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-h6-fontFamily"),
        default: "700",
      },
    },
  },
  body: {
    label: msg("Body Text"),
    styles: {
      fontFamily: {
        label: msg("Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "16px",
      },
      fontWeight: {
        label: msg("Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-body-fontFamily"),
        default: "400",
      },
    },
  },
  pageSection: {
    label: msg("Page Section"),
    styles: {
      contentWidth: {
        label: msg("Content Width"),
        type: "select",
        plugin: "maxWidth",
        options: [
          { label: msg("Compact (768px)"), value: "768px" },
          { label: msg("Narrow (960px)"), value: "960px" },
          { label: msg("Standard (1024px)"), value: "1024px" },
          { label: msg("Wide (1280px)"), value: "1280px" },
          { label: msg("Extra Wide (1440px)"), value: "1440px" },
        ],
        default: "1024px",
      },
      verticalPadding: {
        label: msg("Top/Bottom Padding"),
        type: "select",
        plugin: "padding",
        options: ThemeOptions.SPACING,
        default: "32px",
      },
    },
  },
  button: {
    label: msg("Button"),
    styles: {
      fontFamily: {
        label: msg("Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "16px",
      },
      fontWeight: {
        label: msg("Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-button-fontFamily"),
        default: "400",
      },
      textTransform: {
        label: msg("Text Transform"),
        type: "select",
        plugin: "textTransform",
        options: ThemeOptions.TEXT_TRANSFORM,
        default: "none",
      },
      letterSpacing: {
        label: msg("Letter Spacing"),
        type: "select",
        plugin: "letterSpacing",
        options: ThemeOptions.LETTER_SPACING,
        default: "0em",
      },
    },
  },
  link: {
    label: msg("Links"),
    styles: {
      fontFamily: {
        label: msg("Font"),
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: msg("Font Size"),
        type: "select",
        plugin: "fontSize",
        options: ThemeOptions.FONT_SIZE,
        default: "16px",
      },
      fontWeight: {
        label: msg("Font Weight"),
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-link-fontFamily"),
        default: "400",
      },
      textTransform: {
        label: msg("Text Transform"),
        type: "select",
        plugin: "textTransform",
        options: ThemeOptions.TEXT_TRANSFORM,
        default: "none",
      },
      letterSpacing: {
        label: msg("Letter Spacing"),
        type: "select",
        plugin: "letterSpacing",
        options: ThemeOptions.LETTER_SPACING,
        default: "0em",
      },
      caret: {
        label: msg("Include Caret"),
        type: "select",
        plugin: "display",
        options: [
          { label: msg("Yes"), value: "block" },
          { label: msg("No"), value: "none" },
        ],
        default: "block",
      },
    },
  },
};
