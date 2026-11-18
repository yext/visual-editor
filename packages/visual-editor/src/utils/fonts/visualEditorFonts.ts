import { legacyThemeFontFamilies } from "../../internal/theme/legacyTheme.ts";
import { readThemeValues } from "../../internal/utils/internalThemeResolver.ts";
import {
  themeFields,
  type ThemeFields,
} from "../../internal/theme/themeFields.ts";
import { ThemeData } from "../../internal/types/themeData.ts";
import { PUCK_PREVIEW_IFRAME_ID, THEME_STYLE_TAG_ID } from "../applyTheme.ts";
import { StyleSelectOption } from "../themeResolver.ts";
import { defaultFonts as fontsJs } from "./font_registry.js";
import { msg } from "../i18n/platform.ts";
import { fontStyleOptions } from "../themeOptions.ts";

const variableFontRegex = /var\((--[^)]+)\)/;

export type FontWeightSupport =
  { weights: number[] } | { minWeight: number; maxWeight: number };

export type FontVariant = {
  style: "normal" | "italic";
  filePath: string;
} & FontWeightSupport;

export type Font = {
  fallback: "sans-serif" | "serif" | "monospace" | "cursive";
  italics: boolean; // whether the font supports italics
  facePath?: string;
  variants?: FontVariant[];
} & FontWeightSupport;

export type FontRegistry = Record<string, Font>;

// List of variable Google Fonts https://fonts.google.com/?categoryFilters=Technology:%2FTechnology%2FVariable
// prettier-ignore
export const defaultFonts: FontRegistry = fontsJs as FontRegistry;

/**
 * Builds font-family select options from a font registry. The label and CSS
 * font-family value are both derived from the font family name so theme data
 * remains human-readable.
 */
export const constructFontSelectOptions = (
  fonts: FontRegistry
): { label: string; value: string }[] => {
  return Object.entries(fonts).map(([fontFamily, fontDetails]) => ({
    label: fontFamily,
    value: `'${fontFamily}', '${fontFamily} Fallback', ${fontDetails.fallback}`,
  }));
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
  return fontLinkDataToHTML(generateGoogleFontLinkData(fonts));
};

export type FontLinkData = {
  href: string;
  rel: string;
  crossOrigin?: "anonymous" | "use-credentials";
};

const isNormalizedAssetPath = (path: string): boolean => {
  return (
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("/") ||
    path.startsWith("./") ||
    path.startsWith("../")
  );
};

export const normalizeAssetPath = (
  path: string,
  relativePrefixToRoot: string
): string => {
  return isNormalizedAssetPath(path) ? path : `${relativePrefixToRoot}${path}`;
};

// Helper function to generate weight parameter for Google Fonts API
const generateWeightParam = (fontDetails: Font): string => {
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

export const generateGoogleFontLinkData = (
  fonts: FontRegistry
): FontLinkData[] => {
  const fontLinks = Object.entries(fonts).map(([fontFamily, fontDetails]) => {
    const axes = fontDetails.italics ? ":ital,wght@" : ":wght@";
    const weightParam = generateWeightParam(fontDetails);
    const param = `family=${fontFamily.replaceAll(" ", "+")}${axes}${weightParam}`;

    return {
      href: `https://fonts.googleapis.com/css2?${param}&display=swap`,
      rel: "stylesheet",
    };
  });

  return [...PRECONNECT_LINKS, ...fontLinks];
};

export const getFacePathsFromFonts = (fonts: FontRegistry): string[] => {
  return Object.values(fonts)
    .map((fontDetails) => fontDetails.facePath)
    .filter((facePath): facePath is string => Boolean(facePath));
};

/**
 * Builds stylesheet link data for custom font face paths.
 */
export const generateCustomFontLinkData = (
  facePaths: string[],
  relativePrefixToRoot: string
): FontLinkData[] => {
  return facePaths.map((facePath) => ({
    href: normalizeAssetPath(facePath, relativePrefixToRoot),
    rel: "stylesheet",
  }));
};

// Convert font link data to HTML string
export const fontLinkDataToHTML = (linkData: FontLinkData[]): string => {
  return linkData
    .map((link) => {
      const crossOriginAttr = link.crossOrigin
        ? ` crossorigin="${link.crossOrigin}"`
        : "";
      if (link.rel === "preconnect") {
        return `<link rel="${link.rel}" href="${link.href}"${crossOriginAttr}>`;
      } else {
        return `<link href="${link.href}" rel="${link.rel}"${crossOriginAttr}>`;
      }
    })
    .join("\n");
};

export const googleFontLinkTags = fontLinkDataToHTML(
  generateGoogleFontLinkData(defaultFonts)
);

/**
 * Creates link elements for both Google fonts and custom font stylesheets so
 * they can be appended directly into a document.
 */
export const createFontLinkElements = (
  googleFonts: FontRegistry,
  customFonts: FontRegistry
): HTMLLinkElement[] => {
  const googleFontLinkData = generateGoogleFontLinkData(googleFonts);
  const customFontLinkData = generateCustomFontLinkData(
    getFacePathsFromFonts(customFonts),
    "./"
  );

  return [...customFontLinkData, ...googleFontLinkData].map((link) => {
    const element = document.createElement("link");
    element.href = link.href;
    element.rel = link.rel;
    if (link.crossOrigin) {
      element.crossOrigin = link.crossOrigin;
    }
    return element;
  });
};

/**
 * Loads the provided font links into the document head once, using `idPrefix`
 * to avoid appending duplicate font tags across rerenders.
 */
export const loadFontsIntoDOM = (
  document: Document,
  googleFonts: FontRegistry,
  customFonts: FontRegistry,
  idPrefix: string = "visual-editor-fonts"
) => {
  if (!document.getElementById(`${idPrefix}-0`)) {
    const links = createFontLinkElements(googleFonts, customFonts);

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

type getFontStyleParams = {
  styleOptions?: StyleSelectOption[];
  fontList?: FontRegistry;
};

/*
 * getFontWeightOptions returns the available font weights for a CSS variable.
 * Component field controls use these options synchronously.
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
 * getFontWeightOptionsForFontFamily returns the available font weights for a
 * concrete font-family value. It must return synchronously because field
 * rendering needs options synchronously.
 */
export const getFontWeightOptionsForFontFamily = (
  fontFamilyValue: string | undefined,
  options: Omit<getFontWeightParams, "fontCssVariable"> = {}
) => {
  const { weightOptions = defaultWeightOptions, fontList = defaultFonts } =
    options;
  const fontName = fontFamilyValue
    ? extractFontFamilyName(fontFamilyValue)
    : undefined;
  return filterFontWeightOptions(fontName, weightOptions, fontList);
};

/*
 * getFontStyleOptionsForFontFamily returns the available font styles for a
 * concrete font-family value. It must return synchronously because field
 * rendering needs options synchronously.
 */
export const getFontStyleOptionsForFontFamily = (
  fontFamilyValue: string | undefined,
  options: getFontStyleParams = {}
) => {
  const { styleOptions = fontStyleOptions, fontList = defaultFonts } = options;
  const fontName = fontFamilyValue
    ? extractFontFamilyName(fontFamilyValue)
    : undefined;
  return filterFontStyleOptions(fontName, styleOptions, fontList);
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
  const fontName = getFontNameFromStyleElement(styleElement, fontCssVariable);
  return filterFontWeightOptions(fontName, weightOptions, fontList);
};

const filterFontWeightOptions = (
  fontName: string | undefined,
  weightOptions: StyleSelectOption[],
  fontList: FontRegistry
) => {
  const font = fontName ? fontList[fontName] : undefined;
  if (!font) {
    return weightOptions;
  }
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

const filterFontStyleOptions = (
  fontName: string | undefined,
  styleOptions: StyleSelectOption[],
  fontList: FontRegistry
) => {
  const font = fontName ? fontList[fontName] : undefined;
  if (!font) {
    return styleOptions;
  }
  return font.italics
    ? styleOptions
    : styleOptions.filter((style) => style.value === "normal");
};

const extractFontFamilyName = (value: string): string => {
  const firstFont = value.split(",")[0];
  return firstFont.trim().replace(/^['"]|['"]$/g, "");
};

const resolveFontFamilyValue = (
  value: string,
  data: Record<string, unknown>
): string => {
  let currentValue = value;
  for (let i = 0; i < 2; i++) {
    const match = currentValue.match(variableFontRegex);
    if (!match) {
      break;
    }
    const resolved = data[match[1]];
    if (typeof resolved !== "string" || resolved.length === 0) {
      break;
    }
    currentValue = resolved;
  }
  return currentValue;
};

export const getFontFamilyFromThemeValue = (
  value: string,
  data: Record<string, unknown>
): string => {
  return extractFontFamilyName(resolveFontFamilyValue(value, data));
};

const getFontNameFromStyleElement = (
  styleElement: HTMLStyleElement,
  fontCssVariable?: string
) => {
  if (!fontCssVariable) {
    return undefined;
  }

  const styleContent = styleElement.textContent || styleElement.innerHTML;
  const regex = new RegExp(
    // matches Arial in "'Arial', sans-serif"
    `${fontCssVariable}:\\s*(['"]?([^',\\s]+(?:\\s+[^',\\s]+)*)['"]?)(?:,|\\s|;|$)`,
    "i"
  );
  let fontName = styleContent.match(regex)?.[2];

  // Support "Default font" reference by resolving var(--fontFamily-headers-defaultFont).
  if (fontName?.startsWith("var(")) {
    const variableMatch = fontName.match(variableFontRegex);
    if (variableMatch?.[1]) {
      const variableName = variableMatch[1];
      // Escape regex special characters to prevent ReDoS from malformed CSS
      const escapedVariableName = variableName.replace(
        /[.*+?^${}()|[\]\\]/g,
        "\\$&"
      );
      const variableRegex = new RegExp(
        `${escapedVariableName}:\\s*([^;]+)`,
        "i"
      );
      const variableValue = styleContent.match(variableRegex)?.[1];
      if (variableValue) {
        const cleanedValue = variableValue.replace(/!important/g, "").trim();
        fontName = extractFontFamilyName(cleanedValue);
      }
    }
  }

  return fontName;
};

export const resolveThemeFonts = (
  data: ThemeData,
  customFonts: FontRegistry = {},
  fields: ThemeFields = themeFields
) => {
  const values = readThemeValues(data, fields);
  const googleFonts: FontRegistry = Object.fromEntries(
    legacyThemeFontFamilies.map((family) => [family, defaultFonts[family]])
  );
  const selectedCustomFonts: FontRegistry = {};
  for (const [fieldKey, field] of Object.entries(fields)) {
    if (field.type !== "fontFamily" || !values[fieldKey]) continue;
    const family = getFontFamilyFromThemeValue(values[fieldKey], {});
    if (customFonts[family]) selectedCustomFonts[family] = customFonts[family];
    else if (defaultFonts[family]) googleFonts[family] = defaultFonts[family];
  }
  return { googleFonts, customFonts: selectedCustomFonts };
};
