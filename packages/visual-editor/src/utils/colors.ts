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
 * hexToHSL converts a hex color to hsl
 * @param H hex string beginning with '#'
 * @returns {number[] | undefined} [h, s, l] if conversion succeeds
 */
export const hexToHSL = (H: string): number[] | undefined => {
  // Based on https://css-tricks.com/converting-color-spaces-in-javascript/
  // Convert hex to RGB first
  const rgb = hexToRGB(H);
  if (!rgb || rgb.length !== 3) {
    return;
  }

  const r = rgb[0] / 255;
  const g = rgb[1] / 255;
  const b = rgb[2] / 255;
  const cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin;

  let h = 0,
    s = 0,
    l = 0;

  if (delta == 0) h = 0;
  else if (cmax == r) h = ((g - b) / delta) % 6;
  else if (cmax == g) h = (b - r) / delta + 2;
  else h = (r - g) / delta + 4;

  h = Math.round(h * 60);

  if (h < 0) h += 360;

  l = (cmax + cmin) / 2;
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));
  s = +(s * 100).toFixed(1);
  l = +(l * 100).toFixed(1);

  return [h, s, l];
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
