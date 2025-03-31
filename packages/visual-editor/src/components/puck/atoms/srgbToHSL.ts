/**
 * srgbToHSL converts srgb colors to hsl values.
 * @param rgb [r, g, b]
 * @returns {number[] | undefined} [h, s, l] if conversion succeeds
 */
export const srgbToHSL = (rgb: number[]): number[] | undefined => {
  // based on https://codepen.io/himonoye/pen/ByaraoG?editors=1111
  // and https://www.rapidtables.com/convert/color/rgb-to-hsl.html
  if (rgb.length !== 3 || rgb.some((v) => v > 1 || v < 0)) {
    return;
  }

  const r = rgb[0],
    g = rgb[1],
    b = rgb[2];
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
