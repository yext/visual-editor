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
  console.log(
    "🟣 constructGoogleFontLinkTags called with fonts:",
    Object.keys(fonts)
  );

  const preconnectTags =
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n';

  const prefix = '<link href="https://fonts.googleapis.com/css2?';
  const postfix = 'display=swap" rel="stylesheet">';

  const fontEntries = Object.entries(fonts);
  console.log("🟣 Font entries to process:", fontEntries.length);
  const chunkSize = 7;
  const linkTags: string[] = [];

  for (let i = 0; i < fontEntries.length; i += chunkSize) {
    const chunk = fontEntries.slice(i, i + chunkSize);
    console.log(
      "🟣 Processing chunk:",
      chunk.map(([name]) => name)
    );

    const params = chunk
      .map(([fontName, fontDetails]) => {
        const axes = fontDetails.italics ? ":ital,wght@" : ":wght@";

        let weightParam;
        if ("weights" in fontDetails) {
          // static font, use enumerated weights
          if (fontDetails.italics) {
            weightParam =
              fontDetails.weights.map((w) => `0,${w};`).join("") +
              fontDetails.weights.map((w) => `1,${w};`).join("");
            // remove trailing semicolon
            weightParam = weightParam.slice(0, -1);
          } else {
            weightParam = fontDetails.weights.join(";");
          }
        } else {
          // variable font, use range of weights
          const weightRange =
            fontDetails.minWeight === fontDetails.maxWeight
              ? `${fontDetails.minWeight}`
              : `${fontDetails.minWeight}..${fontDetails.maxWeight}`;
          weightParam = fontDetails.italics
            ? `0,${weightRange};1,${weightRange}`
            : weightRange;
        }

        const param =
          "family=" + fontName.replaceAll(" ", "+") + axes + weightParam;
        console.log("🟣 Generated param for", fontName, ":", param);
        return param;
      })
      .join("&");

    const linkTag = `${prefix}${params}&${postfix}`;
    console.log("🟣 Generated link tag:", linkTag.substring(0, 100) + "...");
    linkTags.push(linkTag);
  }

  const result = linkTags.length ? preconnectTags + linkTags.join("\n") : "";
  console.log("🟣 Final Google Fonts link tags length:", result.length);
  return result;
};

export const googleFontLinkTags = constructGoogleFontLinkTags(defaultFonts);

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

export const extractInUseFontFamilies = (
  data: ThemeData,
  availableFonts: FontRegistry
): FontRegistry => {
  console.log(
    "🟠 extractInUseFontFamilies called with data:",
    Object.keys(data).length,
    "keys"
  );

  const fontKeys = Object.keys(data).filter((key) =>
    key.includes("fontFamily")
  );
  console.log("🟠 Font family keys found:", fontKeys);

  const fontValues = fontKeys.map((key) => data[key]);
  console.log("🟠 Font family values:", fontValues);

  const fontFamilies = new Set<string>();

  for (const key in data) {
    if (typeof key === "string" && key.includes("fontFamily")) {
      const value = data[key];
      if (typeof value === "string" && value.length > 0) {
        const firstFont = value.split(",")[0];
        const cleanedFontName = firstFont
          .trim()
          .replace(/^["'](.*)["']$/, "$1");
        fontFamilies.add(cleanedFontName);
        console.log(
          "🟠 Extracted font name:",
          cleanedFontName,
          "from value:",
          value
        );
      }
    }
  }

  console.log("🟠 All extracted font families:", Array.from(fontFamilies));

  const inUseFonts: FontRegistry = {};

  for (const fontName of fontFamilies) {
    if (availableFonts[fontName]) {
      inUseFonts[fontName] = availableFonts[fontName];
      console.log(
        "🟠 Added font to inUseFonts:",
        fontName,
        "with spec:",
        availableFonts[fontName]
      );
    } else {
      console.log("🟠 Font not found in availableFonts:", fontName);
    }
  }

  console.log("🟠 Final inUseFonts:", Object.keys(inUseFonts));
  return inUseFonts;
};
