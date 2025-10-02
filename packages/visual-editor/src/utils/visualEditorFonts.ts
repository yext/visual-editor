import { PUCK_PREVIEW_IFRAME_ID, THEME_STYLE_TAG_ID } from "./applyTheme.ts";
import { StyleSelectOption } from "./themeResolver.ts";
import { defaultFonts as fontsJs } from "./font_registry.js";
import { msg } from "./i18n/platform.ts";
import { ThemeData } from "../internal/types/themeData.ts";

export type FontRegistry = Record<string, FontSpecification>;
type FontSpecification = {
  italics: boolean; // whether the font supports italics
  fallback: "sans-serif" | "serif" | "monospace" | "cursive";
} & (
  | {
      // variable fonts
      minWeight: number; // minimum weight the font supports
      maxWeight: number; // maximum weight the font supports
    }
  | {
      // static fonts
      weights: number[]; // the weights the font supports
    }
);

// List of variable Google Fonts https://fonts.google.com/?categoryFilters=Technology:%2FTechnology%2FVariable
// prettier-ignore
export const defaultFonts: FontRegistry = fontsJs as FontRegistry;

export const constructFontSelectOptions = (fonts: FontRegistry) => {
  const fontOptions: StyleSelectOption[] = [];
  for (const fontName in fonts) {
    const fontDetails = fonts[fontName];
    fontOptions.push({
      label: fontName,
      value: `'${fontName}', ${fontDetails.fallback}`,
    });
  }
  return fontOptions;
};

/*
 * generateGoogleFontsURL takes a list of fonts and the available values for
 * their variable font axes and the <link> tags needed to load Google fonts
 * Note: Google does not return font file URLs if the params
 * fall outside of the font's supported values
 */
export const constructGoogleFontLinkTags = (fonts: FontRegistry): string => {
  if (Object.keys(fonts).length === 0) {
    return "";
  }
  return fontLinkDataToHTML(generateFontLinkData(fonts));
};

export type FontLinkData = {
  href: string;
  rel: string;
  crossOrigin?: string;
};

// Helper function to generate weight parameter for Google Fonts API
const generateWeightParam = (fontDetails: FontSpecification): string => {
  if ("weights" in fontDetails) {
    if (fontDetails.italics) {
      const normalWeights = fontDetails.weights
        .map((w: number) => `0,${w}`)
        .join(";");
      const italicWeights = fontDetails.weights
        .map((w: number) => `1,${w}`)
        .join(";");
      return `${normalWeights};${italicWeights}`;
    }
    return fontDetails.weights.join(";");
  } else {
    const weightRange =
      fontDetails.minWeight === fontDetails.maxWeight
        ? `${fontDetails.minWeight}`
        : `${fontDetails.minWeight}..${fontDetails.maxWeight}`;

    return fontDetails.italics
      ? `0,${weightRange};1,${weightRange}`
      : weightRange;
  }
};

// Preconnect links for Google Fonts
const PRECONNECT_LINKS: FontLinkData[] = [
  { href: "https://fonts.googleapis.com", rel: "preconnect" },
  {
    href: "https://fonts.gstatic.com",
    rel: "preconnect",
    crossOrigin: "anonymous",
  },
];

export const generateFontLinkData = (fonts: FontRegistry): FontLinkData[] => {
  const fontLinks = Object.entries(fonts).map(([fontName, fontDetails]) => {
    const axes = fontDetails.italics ? ":ital,wght@" : ":wght@";
    const weightParam = generateWeightParam(fontDetails);
    const param = `family=${fontName.replaceAll(" ", "+")}${axes}${weightParam}`;

    return {
      href: `https://fonts.googleapis.com/css2?${param}&display=swap`,
      rel: "stylesheet",
    };
  });

  return [...PRECONNECT_LINKS, ...fontLinks];
};

// Convert font link data to HTML string
export const fontLinkDataToHTML = (linkData: FontLinkData[]): string => {
  return linkData
    .map((link) => {
      const crossOriginAttr = link.crossOrigin ? ` crossorigin` : "";
      if (link.rel === "preconnect") {
        return `<link rel="${link.rel}" href="${link.href}"${crossOriginAttr}>`;
      } else {
        return `<link href="${link.href}" rel="${link.rel}"${crossOriginAttr}>`;
      }
    })
    .join("\n");
};

export const googleFontLinkTags = fontLinkDataToHTML(
  generateFontLinkData(defaultFonts)
);

// Create DOM elements directly from font data
export const createFontLinkElements = (
  fonts: FontRegistry
): HTMLLinkElement[] => {
  const linkData = generateFontLinkData(fonts);
  return linkData.map((link) => {
    const element = document.createElement("link");
    element.href = link.href;
    element.rel = link.rel;
    if (link.crossOrigin) {
      element.crossOrigin = link.crossOrigin;
    }
    return element;
  });
};

// Helper function to load Google Font links into a document
export const loadGoogleFontsIntoDocument = (
  document: Document,
  fonts: FontRegistry,
  idPrefix: string = "visual-editor-fonts"
) => {
  if (!document.getElementById(`${idPrefix}-0`)) {
    const links = createFontLinkElements(fonts);
    links.forEach((link, index) => {
      link.id = `${idPrefix}-${index}`;
      link.setAttribute("data-visual-editor-font", "true");
      document.head.appendChild(link);
    });
  }
};

const defaultWeightOptions = [
  { label: msg("theme.fontWeight.thin", "Thin (100)"), value: "100" },
  {
    label: msg("theme.fontWeight.extralight", "Extralight (200)"),
    value: "200",
  },
  { label: msg("theme.fontWeight.light", "Light (300)"), value: "300" },
  { label: msg("theme.fontWeight.normal", "Normal (400)"), value: "400" },
  { label: msg("theme.fontWeight.medium", "Medium (500)"), value: "500" },
  { label: msg("theme.fontWeight.semibold", "Semibold (600)"), value: "600" },
  { label: msg("theme.fontWeight.bold", "Bold (700)"), value: "700" },
  { label: msg("theme.fontWeight.extrabold", "Extrabold (800)"), value: "800" },
  { label: msg("theme.fontWeight.black", "Black (900)"), value: "900" },
];

type getFontWeightParams = {
  fontCssVariable?: string;
  weightOptions?: StyleSelectOption[];
  fontList?: FontRegistry;
};

/*
 * getFontWeightOptions returns the available font weights for a given CSS variable
 * for use in the theme.config.
 * Must return synchronously because the theme.config is processed synchronously
 */
export const getFontWeightOptions = (options: getFontWeightParams) => {
  const { fontCssVariable, weightOptions = defaultWeightOptions } = options;
  if (!fontCssVariable || typeof window === "undefined") {
    // return all options if no variable provided, or not in browser
    return weightOptions;
  }

  // get the preview iframe
  const iframe = document.getElementById(
    PUCK_PREVIEW_IFRAME_ID
  ) as HTMLIFrameElement;
  const styleElement = iframe?.contentDocument?.getElementById(
    "visual-editor-theme"
  ) as HTMLStyleElement;

  if (!styleElement) {
    return defaultWeightOptions;
  }

  return filterFontWeights(styleElement, options);
};

/*
 * getFontWeightOverrideOptions returns the available font weights for a given CSS variable
 * for use in the resolveFields function of individual components.
 * Must return a promise because resolveFields can run before the iframe is loaded.
 */
export const getFontWeightOverrideOptions = async (
  options: getFontWeightParams
) => {
  return new Promise<StyleSelectOption[]>((resolve) => {
    const getAndFilterFontWeights = () => {
      const iframe = document.getElementById(
        PUCK_PREVIEW_IFRAME_ID
      ) as HTMLIFrameElement;
      const styleTag = iframe.contentDocument?.getElementById(
        THEME_STYLE_TAG_ID
      ) as HTMLStyleElement;
      if (styleTag) {
        observer.disconnect();
        const weights = filterFontWeights(styleTag, options);
        resolve([{ label: "Default", value: "default" }, ...weights]);
      }
    };

    const observer = new MutationObserver(getAndFilterFontWeights);

    // Try to run, will succeed if the style tag has already loaded
    getAndFilterFontWeights();

    // If not, observe mutations until it loads
    observer.observe(document, {
      childList: true,
      subtree: true,
    });
  });
};

/*
 * filterFontWeights captures the font name from the CSS value and then returns
 * the available font weights for that font.
 */
const filterFontWeights = (
  styleElement: HTMLStyleElement,
  {
    fontCssVariable,
    weightOptions = defaultWeightOptions,
    fontList = defaultFonts,
  }: getFontWeightParams
) => {
  // get the font name from css variable in the style tag
  const styleContent = styleElement.textContent || styleElement.innerHTML;
  const regex = new RegExp( // matches Arial in "'Arial', sans-serif"
    `${fontCssVariable}:\\s*(['"]?([^',\\s]+(?:\\s+[^',\\s]+)*)['"]?)(?:,|\\s|;|$)`,
    "i"
  );
  const fontName = styleContent.match(regex)?.[2];

  if (!fontName || !fontList[fontName]) {
    return weightOptions;
  }

  const font = fontList[fontName];
  // filter the font weights by the font's allowed values
  if ("weights" in font) {
    return weightOptions.filter((weight) =>
      font.weights.map(String).includes(weight.value)
    );
  } else {
    return weightOptions.filter(
      (weight) =>
        Number(weight.value) <= font.maxWeight &&
        Number(weight.value) >= font.minWeight
    );
  }
};

// Returns FontRegistry only containing fonts used in ThemeData
export const extractInUseFontFamilies = (
  data: ThemeData,
  availableFonts: FontRegistry
): FontRegistry => {
  const fontFamilies = new Set<string>();

  // Iterate over all the keys in the theme data to find font names.
  for (const key in data) {
    // searches for keys with "fontFamily" like "--fontFamily-h1-fontFamily"
    if (typeof key === "string" && key.includes("fontFamily")) {
      const value = data[key];
      // key / value looks like "--fontFamily-h1-fontFamily": "'Open Sans', sans-serif"
      // parses fontName from the value
      if (typeof value === "string" && value.length > 0) {
        const firstFont = value.split(",")[0];
        const cleanedFontName = firstFont.trim().replace(/^['"]|['"]$/g, "");
        fontFamilies.add(cleanedFontName);
      }
    }
  }

  const inUseFonts: FontRegistry = {};

  // For each unique font family found, look it up in the availableFonts map.
  for (const fontName of fontFamilies) {
    if (availableFonts[fontName]) {
      inUseFonts[fontName] = availableFonts[fontName];
    } else {
      console.warn(
        `The font '${fontName}' is used in the theme but cannot be found in available fonts.`
      );
    }
  }

  return inUseFonts;
};
