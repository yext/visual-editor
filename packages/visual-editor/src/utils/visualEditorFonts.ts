import { PUCK_PREVIEW_IFRAME_ID, THEME_STYLE_TAG_ID } from "./applyTheme.ts";
import { StyleSelectOption } from "./themeResolver.ts";
import { defaultFonts as fontsJs } from "./font_registry.js";

export type FontRegistry = Record<string, FontSpecification>;
type FontSpecification = {
  minWeight: number; // minimum weight the font supports
  maxWeight: number; // maximum weight the font supports
  italics: boolean; // whether the font supports italics
  fallback: "sans-serif" | "serif" | "monospace" | "cursive";
};

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
const constructGoogleFontLinkTags = (fonts: FontRegistry): string => {
  const preconnectTags =
    '<link rel="preconnect" href="https://fonts.googleapis.com">\n' +
    '<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n';

  const prefix = '<link href="https://fonts.googleapis.com/css2?';
  const postfix = 'display=swap" rel="stylesheet">';

  const fontEntries = Object.entries(fonts);
  const chunkSize = 7;
  const linkTags: string[] = [];

  for (let i = 0; i < fontEntries.length; i += chunkSize) {
    const chunk = fontEntries.slice(i, i + chunkSize);

    const params = chunk
      .map(([fontName, fontDetails]) => {
        const axes = fontDetails.italics ? ":ital,wght@" : ":wght@";

        const weightRange =
          fontDetails.minWeight === fontDetails.maxWeight
            ? `${fontDetails.minWeight}`
            : `${fontDetails.minWeight}..${fontDetails.maxWeight}`;

        const weightParam = fontDetails.italics
          ? `0,${weightRange};1,${weightRange}`
          : weightRange;

        return "family=" + fontName.replaceAll(" ", "+") + axes + weightParam;
      })
      .join("&");

    linkTags.push(`${prefix}${params}&${postfix}`);
  }

  return preconnectTags + linkTags.join("\n");
};

export const googleFontLinkTags = constructGoogleFontLinkTags(defaultFonts);

const defaultWeightOptions = [
  { label: "Thin (100)", value: "100" },
  { label: "Extralight (200)", value: "200" },
  { label: "Light (300)", value: "300" },
  { label: "Normal (400)", value: "400" },
  { label: "Medium (500)", value: "500" },
  { label: "Semibold (600)", value: "600" },
  { label: "Bold (700)", value: "700" },
  { label: "Extrabold (800)", value: "800" },
  { label: "Black (900)", value: "900" },
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

  // filter the font weights by the font's allowed values
  return weightOptions.filter(
    (weight) =>
      Number(weight.value) <= fontList[fontName].maxWeight &&
      Number(weight.value) >= fontList[fontName].minWeight
  );
};
