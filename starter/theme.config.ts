import {
  ThemeConfig,
  defaultFonts,
  FontRegistry,
  getFontWeightOptions,
  constructFontSelectOptions,
  getBorderRadiusOptions,
  getFontSizeOptions,
  getSpacingOptions,
} from "@yext/visual-editor";

const getColorOptions = () => {
  return [
    { label: "Primary", value: "var(--colors-palette-primary)" },
    { label: "Secondary", value: "var(--colors-palette-secondary)" },
    { label: "Accent", value: "var(--colors-palette-accent)" },
    { label: "Text", value: "var(--colors-palette-text)" },
    { label: "Background", value: "var(--colors-palette-background)" },
  ];
};

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

export const themeConfig: ThemeConfig = {
  palette: {
    label: "Colors",
    styles: {
      primary: {
        label: "Primary",
        type: "color",
        default: "#CF0A2C",
        plugin: "colors",
      },
      secondary: {
        label: "Secondary",
        type: "color",
        default: "#737B82",
        plugin: "colors",
      },
      tertiary: {
        label: "Tertiary",
        type: "color",
        default: "#FF7E7E",
        plugin: "colors",
      },
      quaternary: {
        label: "Quaternary",
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
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: "Font Size",
        type: "select",
        plugin: "fontSize",
        options: getFontSizeOptions(),
        default: "24px",
      },
      fontWeight: {
        label: "Font Weight",
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
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: "Font Size",
        type: "select",
        plugin: "fontSize",
        options: getFontSizeOptions(),
        default: "24px",
      },
      fontWeight: {
        label: "Font Weight",
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
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: "Font Size",
        type: "select",
        plugin: "fontSize",
        options: getFontSizeOptions(),
        default: "24px",
      },
      fontWeight: {
        label: "Font Weight",
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
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: "Font Size",
        type: "select",
        plugin: "fontSize",
        options: getFontSizeOptions(),
        default: "24px",
      },
      fontWeight: {
        label: "Font Weight",
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
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: "Font Size",
        type: "select",
        plugin: "fontSize",
        options: getFontSizeOptions(),
        default: "24px",
      },
      fontWeight: {
        label: "Font Weight",
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
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: "Font Size",
        type: "select",
        plugin: "fontSize",
        options: getFontSizeOptions(),
        default: "24px",
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-h6-fontFamily"),
        default: "700",
      },
    },
  },
  body: {
    label: "Body Text",
    styles: {
      fontFamily: {
        label: "Font",
        type: "select",
        plugin: "fontFamily",
        options: fontOptions,
        default: "'Open Sans', sans-serif",
      },
      fontSize: {
        label: "Font Size",
        type: "select",
        plugin: "fontSize",
        options: getFontSizeOptions(),
        default: "16px",
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-body-fontFamily"),
        default: "400",
      },
    },
  },
  pageSection: {
    label: "Page Section",
    styles: {
      contentWidth: {
        label: "Content Width",
        type: "select",
        plugin: "maxWidth",
        options: [
          { label: "Compact (768px)", value: "768px" },
          { label: "Narrow (960px)", value: "960px" },
          { label: "Standard (1024px)", value: "1024px" },
          { label: "Wide (1280px)", value: "1280px" },
          { label: "Extra Wide (1440px)", value: "1440px" },
        ],
        default: "1024px",
      },
      topPadding: {
        label: "Top Padding",
        type: "select",
        plugin: "padding",
        options: getSpacingOptions(),
        default: "0px",
      },
      bottomPadding: {
        label: "Bottom Padding",
        type: "select",
        plugin: "padding",
        options: getSpacingOptions(),
        default: "0px",
      },
    },
  },
  header: {
    label: "Header",
    styles: {
      backgroundColor: {
        label: "Background Color",
        type: "select",
        plugin: "backgroundColor",
        options: getColorOptions(),
        default: "var(--colors-palette-background)",
      },
      linkColor: {
        label: "Link Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-primary)",
      },
      linkFontSize: {
        label: "Link Font Size",
        type: "select",
        plugin: "fontSize",
        options: getFontSizeOptions(false),
        default: "16px",
      },
    },
  },
  footer: {
    label: "Footer",
    styles: {
      backgroundColor: {
        label: "Background Color",
        type: "select",
        plugin: "backgroundColor",
        options: getColorOptions(),
        default: "var(--colors-palette-background)",
      },
      linkColor: {
        label: "Link Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-primary)",
      },
      linkFontSize: {
        label: "Link Font Size",
        type: "select",
        plugin: "fontSize",
        options: getFontSizeOptions(false),
        default: "16px",
      },
    },
  },
  link: {
    label: "Link Styling",
    styles: {
      color: {
        label: "Text Color",
        type: "select",
        plugin: "colors",
        options: getColorOptions(),
        default: "var(--colors-palette-primary)",
      },
      fontSize: {
        label: "Font Size",
        type: "select",
        plugin: "fontSize",
        options: getFontSizeOptions(false),
        default: "12px",
      },
    },
  },
  button: {
    label: "Button",
    styles: {
      borderRadius: {
        label: "Border Radius",
        type: "select",
        plugin: "borderRadius",
        options: getBorderRadiusOptions(),
        default: "16px",
      },
      fontWeight: {
        label: "Font Weight",
        type: "select",
        plugin: "fontWeight",
        options: fontWeightOptions("--fontFamily-body-fontFamily"),
        default: "400",
      },
      fontSize: {
        label: "Font Size",
        type: "select",
        plugin: "fontSize",
        options: getFontSizeOptions(false),
        default: "12px",
      },
      backgroundColor: {
        label: "Background Color",
        type: "select",
        plugin: "backgroundColor",
        options: getColorOptions(),
        default: "var(--colors-palette-background)",
      },
      textColor: {
        label: "Text Color",
        plugin: "colors",
        type: "select",
        options: getColorOptions(),
        default: "var(--colors-palette-text)",
      },
    },
  },
};
