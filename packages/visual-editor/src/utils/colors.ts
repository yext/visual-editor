import { getThemeValue } from "./getThemeValue.ts";
import { type ThemeColor } from "./themeConfigOptions.ts";
import { type StreamDocument } from "./types/StreamDocument.ts";

/**
 * hexToRGB converts a hex color to rgb
 * @param H hex string beginning with '#'
 * @returns {number[] | undefined} [r, g, b] if conversion succeeds
 */
export const hexToRGB = (H: string): number[] | undefined => {
  // Based on https://css-tricks.com/converting-color-spaces-in-javascript/
  let r: string, g: string, b: string;

  if (H.length == 4) {
    // 3 character hex
    r = "0x" + H[1] + H[1];
    g = "0x" + H[2] + H[2];
    b = "0x" + H[3] + H[3];
  } else if (H.length == 7) {
    // 6 character hex
    r = "0x" + H[1] + H[2];
    g = "0x" + H[3] + H[4];
    b = "0x" + H[5] + H[6];
  } else {
    return;
  }

  return [+r, +g, +b];
};

/**
 * Converts a color string returned by window.getComputedStyle to a hex color string.
 * getComputedStyle can return a variety of color values.
 * @param colorString The computed style color string (e.g., "rgb(255, 0, 0)").
 * @returns The hex color string (e.g., "#ff0000") or an empty string if conversion fails.
 */
export const convertComputedStyleColorToHex = (colorString: string): string => {
  // A helper function to convert a value to a 2-char hex string
  const toHex = (c: number) => {
    const hex = Math.round(c).toString(16).toUpperCase();
    return hex.length === 1 ? "0" + hex : hex;
  };

  // 1. Handle rgb() format
  const rgbMatch = colorString.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);

  if (rgbMatch) {
    const [, r, g, b] = rgbMatch.map(parseFloat);
    if ([r, g, b].some((c) => c < 0 || c > 255)) {
      return "";
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // 2. Handle rgba() format
  const rgbaMatch = colorString.match(
    /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)$/
  );
  if (rgbaMatch) {
    const [, r, g, b, a] = rgbaMatch.map(parseFloat);
    if ([r, g, b].some((c) => c < 0 || c > 255)) {
      return "";
    }

    // We'll only return a hex if the color is fully opaque (alpha === 1)
    if (a === 1) {
      return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }
  }

  // 3. Handle color(srgb ...) format
  const srgbMatch = colorString.match(
    /^color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)\)$/
  );
  if (srgbMatch) {
    // The values from color(srgb ...) are floats from 0-1, so we multiply by 255
    const [, r, g, b] = srgbMatch.map(parseFloat).map((c) => c * 255);
    if ([r, g, b].some((c) => c < 0 || c > 255)) {
      return "";
    }

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  // If no format is matched, return empty
  return "";
};

/**
 * luminanceFromRGB returns the luminance value from an rgb color
 * @param H [r, g, b]
 * @returns {number | undefined} luminance if conversion succeeds
 */
export const luminanceFromRGB = (rgb: number[]): number | undefined => {
  if (rgb.length !== 3 || rgb.some((v) => v > 255 || v < 0)) {
    return;
  }

  const a = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

/**
 * isColorContrastWcagCompliant checks color contrast based on WCAG 2.1 SC 1.4.3 (Level AA)
 * The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for
 * large-scale text and images of large-scale text have a contrast ratio of at least 3:1.
 * Large-scale text means with at least 18 point or 14 point bold.
 * @param rgb1 [r, g, b]
 * @param rgb2 [r, g, b]
 * @param fontSizePt the font size in points
 * @param fontWeight the numerical font weight (100-900)
 * @returns {boolean} Whether the colors pass the contrast check. False if color conversion fails
 */
export const isColorContrastWcagCompliant = (
  rgb1: number[],
  rgb2: number[],
  fontSizePt: number,
  fontWeight: number
): boolean => {
  // Based on https://dev.to/alvaromontoro/building-your-own-color-contrast-checker-4j7o
  if (rgb1.length !== 3 || rgb2.length !== 3) {
    return false;
  }

  const l1 = luminanceFromRGB(rgb1),
    l2 = luminanceFromRGB(rgb2);

  if (l1 === undefined || l2 === undefined) {
    return false;
  }

  const contrast =
    l1 > l2 ? (l2 + 0.05) / (l1 + 0.05) : (l1 + 0.05) / (l2 + 0.05);

  if (fontSizePt >= 18 || (fontSizePt >= 14 && fontWeight >= 700)) {
    return contrast < 1 / 3;
  } else {
    return contrast < 1 / 4.5;
  }
};

/**
 * getContrastingColor returns the hex code for white or black
 * depending on which meets WCAG color contrast standards
 * @param hexColor the hex string to contrast with
 * @param fontSizePx the font size in pixels (determines minimum contrast ratio)
 * @param fontWeight the numerical font weight (100-900) (determines minimum contrast ratio)
 * @returns '#000000' or '#FFFFFF' depending on which has proper contrast with hexColor.
 *          '#000000' is returned if color conversions fail.
 */
export const getContrastingColor = (
  hexColor: string,
  fontSizePx: number,
  fontWeight: number
): string => {
  const rgb = hexToRGB(hexColor);
  const fontSizePt = fontSizePx * 0.75;

  if (!rgb) {
    return "#000000"; // error, fall back to black
  }

  // Compare with black
  if (isColorContrastWcagCompliant(rgb, [0, 0, 0], fontSizePt, fontWeight)) {
    return "#000000";
  }

  // Compare with white
  if (
    isColorContrastWcagCompliant(rgb, [255, 255, 255], fontSizePt, fontWeight)
  ) {
    return "#FFFFFF";
  }

  // If neither is sufficiently contrasting, or there was an error, fallback to black
  return `#000000`;
};

/**
 * Resolves a ThemeColor token to a concrete CSS color value.
 * Supports base palette/contrast tokens, derived dark/light palette tokens,
 * literal white/black, and bracketed custom colors.
 */
export const getThemeColorCssValue = (
  colorToken?: ThemeColor | string
): string | undefined => {
  const normalizedColorToken = normalizeThemeColorToken(colorToken);
  if (!normalizedColorToken) {
    return undefined;
  }

  if (normalizedColorToken === "white" || normalizedColorToken === "black") {
    return normalizedColorToken;
  }

  if (
    normalizedColorToken.startsWith("[") &&
    normalizedColorToken.endsWith("]")
  ) {
    return normalizedColorToken.slice(1, -1);
  }

  const paletteMatch = normalizedColorToken.match(
    /^palette-(primary|secondary|tertiary|quaternary)-(light|dark)$/
  );
  if (paletteMatch) {
    const [, palette, tone] = paletteMatch;
    const lightness = tone === "light" ? "98" : "20";
    return `hsl(from var(--colors-palette-${palette}) h s ${lightness})`;
  }

  return `var(--colors-${normalizedColorToken})`;
};

export const isCustomThemeColorToken = (colorToken?: string): boolean => {
  return !!colorToken && colorToken.startsWith("[") && colorToken.endsWith("]");
};

/**
 * Normalizes a ThemeColor or color token for shared callers.
 * Treats the literal string `"default"` as unset.
 */
export const normalizeThemeColorToken = (
  color?: ThemeColor | string
): string | undefined => {
  if (!color) {
    return undefined;
  }

  if (typeof color === "string") {
    return color === "default" ? undefined : color;
  }

  return color.selectedColor === "default" ? undefined : color.selectedColor;
};

/**
 * Detects whether a color string is already a concrete CSS color value and
 * does not need theme-token resolution.
 */
const isResolvedCssColor = (color?: string): boolean =>
  !!color &&
  (color.startsWith("#") ||
    color.startsWith("var(") ||
    color.startsWith("rgb(") ||
    color.startsWith("rgba(") ||
    color.startsWith("hsl(") ||
    color === "transparent" ||
    color === "inherit");

/**
 * Resolves either a concrete CSS color or a ThemeColor token into an inline
 * text color style payload.
 */
export const getResolvedTextColorStyle = (
  color?: ThemeColor | string
): { color?: string } | undefined => {
  if (typeof color === "string" && isResolvedCssColor(color)) {
    return { color };
  }

  const resolvedColor = getThemeColorCssValue(color);
  return resolvedColor ? { color: resolvedColor } : undefined;
};

/**
 * Normalizes a color string into an uppercase hex value when possible.
 * Supports the literal tokens `white` and `black`, 3/6-digit hex, and
 * 8-digit hex values where the alpha channel is dropped for contrast checks.
 * Falls back to parsing computed-style color strings such as `rgb(...)`.
 */
const normalizeHexColor = (colorValue?: string): string | undefined => {
  if (!colorValue) {
    return undefined;
  }

  if (colorValue === "white") {
    return "#FFFFFF";
  }

  if (colorValue === "black") {
    return "#000000";
  }

  const normalizedHex = colorValue.toUpperCase();
  if (/^#[0-9A-F]{8}$/.test(normalizedHex)) {
    return normalizedHex.slice(0, 7);
  }

  if (/^#[0-9A-F]{6}$/.test(normalizedHex)) {
    return normalizedHex;
  }

  if (/^#[0-9A-F]{3}$/.test(normalizedHex)) {
    return `#${normalizedHex[1]}${normalizedHex[1]}${normalizedHex[2]}${normalizedHex[2]}${normalizedHex[3]}${normalizedHex[3]}`;
  }

  const computedStyleHex = convertComputedStyleColorToHex(colorValue);
  return computedStyleHex || undefined;
};

const getColorLuminance = (
  color?: ThemeColor | string,
  streamDocument?: StreamDocument | Record<string, any>
): number | undefined => {
  const colorHex = getThemeColorHexValue(color, streamDocument);
  if (!colorHex) {
    return undefined;
  }

  const rgb = hexToRGB(colorHex);
  return rgb ? luminanceFromRGB(rgb) : undefined;
};

const prefersWhiteForeground = (luminance: number): boolean => {
  const whiteContrast = (1 + 0.05) / (luminance + 0.05);
  const blackContrast = (luminance + 0.05) / 0.05;

  return whiteContrast >= blackContrast;
};

const rgbToHsl = (rgb: number[]) => {
  const [r, g, b] = rgb.map((value) => value / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  const delta = max - min;

  if (delta === 0) {
    return { hue: 0, saturation: 0, lightness: lightness * 100 };
  }

  const saturation =
    lightness > 0.5 ? delta / (2 - max - min) : delta / (max + min);

  let hue = 0;
  switch (max) {
    case r:
      hue = (g - b) / delta + (g < b ? 6 : 0);
      break;
    case g:
      hue = (b - r) / delta + 2;
      break;
    default:
      hue = (r - g) / delta + 4;
      break;
  }

  return {
    hue: hue * 60,
    saturation: saturation * 100,
    lightness: lightness * 100,
  };
};

const hueToRgb = (p: number, q: number, t: number) => {
  let normalizedT = t;

  if (normalizedT < 0) {
    normalizedT += 1;
  }
  if (normalizedT > 1) {
    normalizedT -= 1;
  }
  if (normalizedT < 1 / 6) {
    return p + (q - p) * 6 * normalizedT;
  }
  if (normalizedT < 1 / 2) {
    return q;
  }
  if (normalizedT < 2 / 3) {
    return p + (q - p) * (2 / 3 - normalizedT) * 6;
  }

  return p;
};

const hslToHex = (hue: number, saturation: number, lightness: number) => {
  const normalizedHue = hue / 360;
  const normalizedSaturation = saturation / 100;
  const normalizedLightness = lightness / 100;

  if (normalizedSaturation === 0) {
    const grayscaleValue = Math.round(normalizedLightness * 255);
    const hexValue = grayscaleValue.toString(16).padStart(2, "0");
    return `#${hexValue}${hexValue}${hexValue}`.toUpperCase();
  }

  const q =
    normalizedLightness < 0.5
      ? normalizedLightness * (1 + normalizedSaturation)
      : normalizedLightness +
        normalizedSaturation -
        normalizedLightness * normalizedSaturation;
  const p = 2 * normalizedLightness - q;

  const red = hueToRgb(p, q, normalizedHue + 1 / 3);
  const green = hueToRgb(p, q, normalizedHue);
  const blue = hueToRgb(p, q, normalizedHue - 1 / 3);

  return `#${[red, green, blue]
    .map((value) =>
      Math.round(value * 255)
        .toString(16)
        .padStart(2, "0")
    )
    .join("")}`.toUpperCase();
};

/**
 * Derives a concrete hex color for palette light/dark variants by reading the
 * base palette token, preserving its hue and saturation, and replacing only
 * the lightness component.
 */
const getDerivedPaletteHexColor = (
  baseColorToken: string,
  lightness: number,
  streamDocument?: StreamDocument | Record<string, any>
): string | undefined => {
  const baseColorHex = normalizeHexColor(
    getThemeValue(`--colors-${baseColorToken}`, streamDocument)
  );
  const baseColorRgb = baseColorHex ? hexToRGB(baseColorHex) : undefined;

  if (!baseColorRgb) {
    return undefined;
  }

  const { hue, saturation } = rgbToHsl(baseColorRgb);
  return hslToHex(hue, saturation, lightness);
};

/**
 * Resolves a ThemeColor token to a concrete hex color value in both browser and SSR contexts.
 */
export const getThemeColorHexValue = (
  colorToken?: ThemeColor | string,
  streamDocument?: StreamDocument | Record<string, any>
): string | undefined => {
  const normalizedColorToken = normalizeThemeColorToken(colorToken);
  if (!normalizedColorToken) {
    return undefined;
  }

  if (
    normalizedColorToken.startsWith("[") &&
    normalizedColorToken.endsWith("]")
  ) {
    return normalizeHexColor(normalizedColorToken.slice(1, -1));
  }

  const directHex = normalizeHexColor(normalizedColorToken);
  if (directHex) {
    return directHex;
  }

  const derivedPaletteMatch = normalizedColorToken.match(
    /^palette-(primary|secondary|tertiary|quaternary)-(light|dark)$/
  );
  if (derivedPaletteMatch) {
    const [, paletteName, tone] = derivedPaletteMatch;
    return getDerivedPaletteHexColor(
      `palette-${paletteName}`,
      tone === "light" ? 98 : 20,
      streamDocument
    );
  }

  return normalizeHexColor(
    getThemeValue(`--colors-${normalizedColorToken}`, streamDocument)
  );
};

/**
 * Resolves the default foreground color for a surface by computing whether the
 * background should use black or white text.
 */
export const getDefaultForegroundColor = (
  surfaceColor?: ThemeColor | string,
  streamDocument?: StreamDocument | Record<string, any>
): ThemeColor | undefined => {
  const normalizedSurfaceColor = normalizeThemeColorToken(surfaceColor);
  if (!normalizedSurfaceColor) {
    return undefined;
  }

  const luminance = getColorLuminance(surfaceColor, streamDocument);
  if (luminance !== undefined) {
    return prefersWhiteForeground(luminance)
      ? { selectedColor: "white", contrastingColor: "black" }
      : { selectedColor: "black", contrastingColor: "white" };
  }

  if (surfaceColor !== null && typeof surfaceColor === "object") {
    if (surfaceColor.contrastingColor === "black") {
      return { selectedColor: "black", contrastingColor: "white" };
    }

    if (surfaceColor.contrastingColor === "white") {
      return { selectedColor: "white", contrastingColor: "black" };
    }
  }

  return isDarkColor(surfaceColor, streamDocument)
    ? { selectedColor: "white", contrastingColor: "black" }
    : { selectedColor: "black", contrastingColor: "white" };
};

/**
 * Determines whether a ThemeColor should be treated as dark for background-aware rendering.
 * Falls back safely to `false` when the color cannot be resolved.
 */
export const isDarkColor = (
  color?: ThemeColor | string,
  streamDocument?: StreamDocument | Record<string, any>
): boolean => {
  if (color !== null && typeof color === "object") {
    if (color.isDarkColor !== undefined) {
      return color.isDarkColor;
    }

    if (color.contrastingColor === "white") {
      return true;
    }

    if (color.contrastingColor === "black") {
      return false;
    }
  }

  const normalizedColorToken = normalizeThemeColorToken(color);
  if (!normalizedColorToken) {
    return false;
  }

  const selectedColorHex = getThemeColorHexValue(
    normalizedColorToken,
    streamDocument
  );
  if (selectedColorHex) {
    const selectedRgb = hexToRGB(selectedColorHex);
    const selectedLuminance = selectedRgb
      ? luminanceFromRGB(selectedRgb)
      : undefined;

    if (selectedLuminance !== undefined) {
      return prefersWhiteForeground(selectedLuminance);
    }
  }

  const paletteColorContrastCSSVariable = `--colors-${normalizedColorToken}-contrast`;
  const contrastColor = getThemeValue(
    paletteColorContrastCSSVariable,
    streamDocument
  );

  if (contrastColor) {
    return contrastColor.toUpperCase() === "#FFFFFF";
  }

  // Ultimate fallback for unset theme variables (based on default theme)
  switch (normalizedColorToken) {
    case "palette-primary":
    case "palette-secondary":
    case "palette-quaternary":
      return true;
    case "palette-tertiary":
    case "default":
    default:
      return false;
  }
};

/**
 * Resolves ThemeColor classes for background contexts.
 * @param color a ThemeColor object
 * @returns a class string containing the selected background class and contrasting text class.
 */
export const getBackgroundColorClasses = (color?: ThemeColor): string => {
  return [
    color?.selectedColor && !isCustomThemeColorToken(color.selectedColor)
      ? `bg-${color.selectedColor}`
      : undefined,
    color?.contrastingColor && !isCustomThemeColorToken(color.contrastingColor)
      ? `text-${color.contrastingColor}`
      : undefined,
  ]
    .filter((value): value is string => !!value)
    .join(" ");
};

/**
 * Resolves inline styles for bracketed custom colors in background contexts.
 * @param color a ThemeColor object
 * @returns inline background/text color styles, e.g. `{ backgroundColor: "#FF6D66" }`
 */
export const getBackgroundColorStyle = (
  color?: ThemeColor
): { backgroundColor?: string; color?: string } | undefined => {
  const backgroundColor = isCustomThemeColorToken(color?.selectedColor)
    ? getThemeColorCssValue(color?.selectedColor)
    : undefined;
  const textColor = isCustomThemeColorToken(color?.contrastingColor)
    ? getThemeColorCssValue(color?.contrastingColor)
    : undefined;

  if (!backgroundColor && !textColor) {
    return undefined;
  }

  return {
    ...(backgroundColor ? { backgroundColor } : {}),
    ...(textColor ? { color: textColor } : {}),
  };
};

/**
 * Resolves inline surface styles using a shared dynamic foreground color.
 * This is primarily intended for custom templates and components that need
 * consistent default text contrast behavior.
 */
export const getSurfaceColorStyle = (
  surfaceColor?: ThemeColor | string,
  streamDocument?: StreamDocument | Record<string, any>,
  options?: {
    fallbackBackgroundColor?: string;
    fallbackTextColor?: string;
  }
): { backgroundColor?: string; color?: string } | undefined => {
  const backgroundColor = getThemeColorCssValue(surfaceColor);
  const foregroundColor = getThemeColorCssValue(
    getDefaultForegroundColor(surfaceColor, streamDocument)
  );
  const resolvedBackgroundColor =
    backgroundColor ?? options?.fallbackBackgroundColor;
  const resolvedTextColor = foregroundColor ?? options?.fallbackTextColor;

  if (!resolvedBackgroundColor && !resolvedTextColor) {
    return undefined;
  }

  return {
    ...(resolvedBackgroundColor
      ? { backgroundColor: resolvedBackgroundColor }
      : {}),
    ...(resolvedTextColor ? { color: resolvedTextColor } : {}),
  };
};

/**
 * Resolves ThemeColor class for text contexts.
 * @param color a ThemeColor object
 * @returns the selected text color class, if present.
 */
export const getTextColorClass = (color?: ThemeColor): string | undefined => {
  if (!color?.selectedColor || isCustomThemeColorToken(color.selectedColor)) {
    return undefined;
  }

  return `text-${color.selectedColor}`;
};

/**
 * Resolves inline styles for bracketed custom colors in text contexts.
 * @param color a ThemeColor object
 * @returns inline text color styles, e.g. `{ color: "#FF6D66" }`
 */
export const getTextColorStyle = (
  color?: ThemeColor
): { color?: string } | undefined => {
  if (!isCustomThemeColorToken(color?.selectedColor)) {
    return undefined;
  }

  return { color: getThemeColorCssValue(color?.selectedColor) };
};
