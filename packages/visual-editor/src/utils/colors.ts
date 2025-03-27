// Based on https://css-tricks.com/converting-color-spaces-in-javascript/
export const hexToRGB = (h: string) => {
  let r: string, g: string, b: string;

  if (h.length == 4) {
    // 3 character hex
    r = "0x" + h[1] + h[1];
    g = "0x" + h[2] + h[2];
    b = "0x" + h[3] + h[3];
  } else if (h.length == 7) {
    // 6 character hex
    r = "0x" + h[1] + h[2];
    g = "0x" + h[3] + h[4];
    b = "0x" + h[5] + h[6];
  } else {
    return;
  }

  return [+r, +g, +b];
};

// Based on https://css-tricks.com/converting-color-spaces-in-javascript/
export const hexToHSL = (H: string) => {
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

export const luminanceFromRGB = (rgb: number[]) => {
  if (rgb.length !== 3 || rgb.some((v) => v > 255 || v < 0)) {
    return;
  }

  const a = rgb.map((v) => {
    v /= 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });
  return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
};

// WCAG 2.1 SC 1.4.3 (Level AA)
// The visual presentation of text and images of text has a contrast ratio of at least 4.5:1, except for
// large-scale text and images of large-scale text have a contrast ratio of at least 3:1.
// Large-scale text means with at least 18 point or 14 point bold.
// Based on https://dev.to/alvaromontoro/building-your-own-color-contrast-checker-4j7o
export const passesWcagAAColorContrast = (
  rgb1: number[],
  rgb2: number[],
  fontSizePt: number,
  fontWeight: number
) => {
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

// getContrastingColor returns the hex code for white or black
// depending on which meets WCAG color contrast standards
export const getContrastingColor = (
  hexColor: string,
  fontSizePx: number,
  fontWeight: number
) => {
  const rgb = hexToRGB(hexColor);
  const fontSizePt = fontSizePx * 0.75;

  if (!rgb) {
    return "#000000"; // error, fall back to black
  }

  // Compare with black
  if (passesWcagAAColorContrast(rgb, [0, 0, 0], fontSizePt, fontWeight)) {
    return "#000000";
  }

  // Compare with white
  if (passesWcagAAColorContrast(rgb, [255, 255, 255], fontSizePt, fontWeight)) {
    return "#FFFFFF";
  }

  // If neither is sufficiently contrasting, or there was an error, fallback to black
  return `#000000`;
};

export const srgbToHsl = (r: number, g: number, b: number) => {
  // based on https://codepen.io/himonoye/pen/ByaraoG?editors=1111
  // and https://www.rapidtables.com/convert/color/rgb-to-hsl.html
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sum = min + max;
  const diff = max - min;

  let sat = 0,
    hue = 0,
    light = 0;

  // Calculate Luminance
  light = sum / 2;

  // Calculate Saturation
  switch (diff) {
    case 0:
      break;
    default:
      sat = diff / (1 - Math.abs(2 * light - 1));
  }

  // Calculate Hue
  switch (max) {
    case min:
      break;
    case r:
      hue = (g - b) / diff + (g < b ? 6 : 0);
      break;
    case g:
      hue = (b - r) / diff + 2;
      break;
    case b:
      hue = (r - g) / diff + 4;
  }

  hue = Math.floor(hue * 60 * 10) / 10;
  sat = Math.floor(sat * 100 * 10) / 10;
  light = Math.floor(light * 100 * 10) / 10;

  return [hue, sat, light];
};
