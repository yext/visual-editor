import { themeVariable } from "./dynamicTheme.ts";
import { getThemeValue } from "./getThemeValue.ts";
import { type ThemeColor } from "./themeConfigOptions.ts";
import { type StreamDocument } from "./types/StreamDocument.ts";

/** An authored theme color with render-ready CSS for both selected and contrasting colors. */
export type ResolvedThemeColor = ThemeColor & {
  selectedColorCss: string;
  contrastingColorCss: string;
};

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
 * Resolves a shared color reference or a component-authored literal to CSS.
 */
export const getThemeColorCssValue = (
  colorToken?: ThemeColor | string,
  solid = false
): string | undefined => {
  if (
    colorToken &&
    typeof colorToken === "object" &&
    colorToken.colorId !== undefined
  ) {
    return `var(${themeVariable("colors", colorToken.colorId, `${colorToken.channel}${solid ? "-solid" : ""}`)}, var(--ve-default-${solid ? "solid" : "color"}-${colorToken.channel}))`;
  }
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

  return isResolvedCssColor(normalizedColorToken)
    ? normalizedColorToken
    : undefined;
};

export const isCustomThemeColorToken = (colorToken?: string): boolean => {
  return !!colorToken && colorToken.startsWith("[") && colorToken.endsWith("]");
};

export const normalizeThemeColorToken = (
  color?: ThemeColor | string
): string | undefined => {
  if (!color) {
    return undefined;
  }

  if (typeof color === "string") {
    return color === "default" ? undefined : color;
  }

  if (color.colorId !== undefined) {
    return getThemeColorCssValue(color);
  }
  return color.selectedColor === "default" ? undefined : color.selectedColor;
};

const isResolvedCssColor = (color?: string): boolean =>
  !!color &&
  (color.startsWith("#") ||
    color.startsWith("var(") ||
    color.startsWith("rgb(") ||
    color.startsWith("rgba(") ||
    color.startsWith("hsl(") ||
    color === "transparent" ||
    color === "inherit");

export const getResolvedTextColorStyle = (
  color?: ThemeColor | string
): { color?: string } | undefined => {
  if (typeof color === "string" && isResolvedCssColor(color)) {
    return { color };
  }

  const resolvedColor = getThemeColorCssValue(color, true);
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

  if (/^#[0-9A-F]{3,4}$/.test(normalizedHex)) {
    return `#${normalizedHex[1]}${normalizedHex[1]}${normalizedHex[2]}${normalizedHex[2]}${normalizedHex[3]}${normalizedHex[3]}`;
  }

  const hsl = /^hsla?\(([^)]+)\)$/.exec(colorValue);
  if (hsl) {
    const parts = hsl[1]
      .trim()
      .split(/\s*[,/]\s*|\s+/)
      .map(Number.parseFloat);
    if (parts.length >= 3 && parts.every(Number.isFinite)) {
      return hslToHex(parts[0], parts[1], parts[2]);
    }
  }
  const rgb = /^rgba?\(([^)]+)\)$/.exec(colorValue);
  if (rgb) {
    const parts = rgb[1]
      .trim()
      .split(/\s*[,/]\s*|\s+/)
      .slice(0, 3);
    if (parts.length === 3) {
      const numbers = parts.map(
        (part) => Number.parseFloat(part) * (part.endsWith("%") ? 2.55 : 1)
      );
      if (
        numbers.every(
          (number) => Number.isFinite(number) && number >= 0 && number <= 255
        )
      ) {
        return `#${numbers.map((number) => Math.round(number).toString(16).padStart(2, "0")).join("")}`.toUpperCase();
      }
    }
  }
  const computedStyleHex = convertComputedStyleColorToHex(colorValue);
  return computedStyleHex || undefined;
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
  const normalizedHue = (((hue % 360) + 360) % 360) / 360;
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

  if (
    colorToken &&
    typeof colorToken === "object" &&
    colorToken.colorId !== undefined
  ) {
    const resolved =
      getThemeValue(
        themeVariable("colors", colorToken.colorId, colorToken.channel),
        streamDocument
      ) ??
      getThemeValue(`--ve-default-color-${colorToken.channel}`, streamDocument);
    return normalizeHexColor(resolved);
  }
  return normalizeHexColor(normalizedColorToken);
};

/** Returns true when the color needs a white foreground for readable text. */
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

  const colorHex = getThemeColorHexValue(color, streamDocument);
  const rgb = colorHex ? hexToRGB(colorHex) : undefined;
  const luminance = rgb ? luminanceFromRGB(rgb) : undefined;
  if (luminance !== undefined) {
    return 1.05 / (luminance + 0.05) >= (luminance + 0.05) / 0.05;
  }

  return false;
};

/** Returns a readable foreground color for a themed surface. */
export const getDefaultForegroundColor = (
  surfaceColor?: ThemeColor | string,
  streamDocument?: StreamDocument | Record<string, any>
): ThemeColor | undefined => {
  if (
    surfaceColor &&
    typeof surfaceColor === "object" &&
    surfaceColor.contrastingColor?.startsWith("[")
  ) {
    return {
      selectedColor: surfaceColor.contrastingColor,
      contrastingColor: "black",
    };
  }
  if (
    surfaceColor &&
    typeof surfaceColor === "object" &&
    surfaceColor.colorId !== undefined
  ) {
    return { colorId: surfaceColor.colorId, channel: "foreground" };
  }
  if (!normalizeThemeColorToken(surfaceColor)) {
    return undefined;
  }

  if (surfaceColor !== null && typeof surfaceColor === "object") {
    if (surfaceColor.contrastingColor === "black") {
      return { selectedColor: "black", contrastingColor: "white" };
    }

    if (surfaceColor.contrastingColor === "white") {
      return { selectedColor: "white", contrastingColor: "black" };
    }

    if (surfaceColor.contrastingColor) {
      return {
        selectedColor: surfaceColor.contrastingColor,
        contrastingColor: isDarkColor(
          surfaceColor.contrastingColor,
          streamDocument
        )
          ? "white"
          : "black",
      };
    }
  }

  return isDarkColor(surfaceColor, streamDocument)
    ? { selectedColor: "white", contrastingColor: "black" }
    : { selectedColor: "black", contrastingColor: "white" };
};

/** Returns inline background and foreground colors for a themed surface. */
export const getSurfaceColorStyle = (
  surfaceColor?: ThemeColor | string,
  streamDocument?: StreamDocument | Record<string, any>,
  options?: {
    fallbackBackgroundColor?: string;
    fallbackTextColor?: string;
  }
):
  | { background?: string; backgroundColor?: string; color?: string }
  | undefined => {
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
    ...(resolvedBackgroundColor ? { background: resolvedBackgroundColor } : {}),
    ...(resolvedTextColor ? { color: resolvedTextColor } : {}),
  };
};

/**
 * Resolves ThemeColor classes for background contexts.
 * @param color a ThemeColor object
 * @returns a class string containing the selected background class and contrasting text class.
 */
export const getBackgroundColorClasses = (_color?: ThemeColor): string => "";

export const getBackgroundColorStyle = (
  color?: ThemeColor | ResolvedThemeColor
): { background?: string; color?: string } | undefined => {
  if (!color) {
    return undefined;
  }
  return {
    background:
      "selectedColorCss" in color
        ? color.selectedColorCss
        : getThemeColorCssValue(color),
    color:
      "contrastingColorCss" in color
        ? color.contrastingColorCss
        : getThemeColorCssValue(getDefaultForegroundColor(color)),
  };
};

export const getTextColorClass = (_color?: ThemeColor): string | undefined =>
  undefined;

export const getTextColorStyle = (
  color?: ThemeColor
): { color?: string } | undefined => {
  if (!color) {
    return undefined;
  }
  return { color: getThemeColorCssValue(color, true) };
};
