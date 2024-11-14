import { StyleSelectOption } from "./themeResolver.ts";

type FontList = Record<string, FontSpecification>;
type FontSpecification = {
  minWeight: number; // minimum weight the font supports
  maxWeight: number; // maximum weight the font supports
  italics: boolean; // whether the font supports italics
  fallback: "sans-serif" | "serif" | "monospace";
};

// List of variable Google Fonts https://fonts.google.com/?categoryFilters=Technology:%2FTechnology%2FVariable
// prettier-ignore
const defaultFontsSpecification: FontList = {
  Alegreya: { italics: true, minWeight: 400, maxWeight: 900, fallback: "serif" },
  Asap: { italics: true, minWeight: 100, maxWeight: 900, fallback: "sans-serif" },
  Bitter: { italics: true, minWeight: 100, maxWeight: 900, fallback: "serif" },
  Cabin: { italics: true, minWeight: 400, maxWeight: 700, fallback: "sans-serif" },
  Cinzel: { italics: false, minWeight: 400, maxWeight: 900, fallback: "serif" },
  "EB Garamond": { italics: true, minWeight: 400, maxWeight: 800, fallback: "serif" },
  "Exo 2": { italics: true, minWeight: 100, maxWeight: 900, fallback: "sans-serif" },
  Inconsolata: { italics: false, minWeight: 200, maxWeight: 900, fallback: "sans-serif" },
  "Josefin Sans": { italics: true, minWeight: 100, maxWeight: 700, fallback: "sans-serif" },
  Lora: { italics: true, minWeight: 400, maxWeight: 700, fallback: "serif" },
  Montserrat: { italics: true, minWeight: 100, maxWeight: 900, fallback: "sans-serif" },
  "Open Sans": { italics: true, minWeight: 300, maxWeight: 800, fallback: "sans-serif" },
  "Playfair Display": { italics: true, minWeight: 400, maxWeight: 900, fallback: "serif" },
  Raleway: { italics: true, minWeight: 100, maxWeight: 900, fallback: "sans-serif" },
  "Roboto Flex": { italics: false, minWeight: 100, maxWeight: 900, fallback: "sans-serif" },
  "Roboto Slab": { italics: false, minWeight: 100, maxWeight: 900, fallback: "serif" },
  "Source Code Pro": { italics: true, minWeight: 200, maxWeight: 900, fallback: "monospace" },
  "Source Sans 3": { italics: true, minWeight: 200, maxWeight: 900, fallback: "sans-serif" },
  "Ubuntu Sans": { italics: true, minWeight: 100, maxWeight: 800, fallback: 'sans-serif' },
};

const constructFontSelectOptions = (fonts: FontList) => {
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

// The list of fonts to be used in theme.config.ts
export const visualEditorFonts = constructFontSelectOptions(
  defaultFontsSpecification
);

/*
 * generateGoogleFontsURL takes a list of fonts and the available values for
 * their variable font axes and the <link> tags needed to load Google fonts
 * Note: Google does not return font file URLs if the params
 * fall outside of the font's supported values
 */
const constructGoogleFontLinkTags = (fonts: FontList) => {
  const prefix = `<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?`;

  const postfix = `display=swap" rel="stylesheet">`;
  let params = "";
  for (const fontName in fonts) {
    const fontDetails = fonts[fontName];
    const axes = fontDetails.italics ? ":ital,wght@" : ":wght@";
    const weightRange = `${fontDetails.minWeight}..${fontDetails.maxWeight}`;
    const weightParam = fontDetails.italics
      ? `0,${weightRange};1,${weightRange}`
      : weightRange;
    params +=
      "family=" + fontName.replaceAll(" ", "+") + axes + weightParam + "&";
  }
  return prefix + params + postfix;
};

export const googleFontLinkTags = constructGoogleFontLinkTags(
  defaultFontsSpecification
);
