export type PickerGradient = {
  type: "linear" | "radial";
  angle: number;
  stops: [string, string];
};

// Keep the authored format small and deterministic, including during SSR.
export const pickerGradientPattern =
  /^(?:linear-gradient\((0|[1-9]\d?|[12]\d{2}|3[0-5]\d|360)deg|radial-gradient\((circle)), (#[\da-f]{6}(?:[\da-f]{2})?) 0%, (#[\da-f]{6}(?:[\da-f]{2})?) 100%\)$/i;

export const parsePickerGradient = (
  value: string
): PickerGradient | undefined => {
  const match = value.match(pickerGradientPattern);
  if (!match || (match[1] && Number(match[1]) > 360)) {
    return undefined;
  }
  return {
    type: match[2] ? "radial" : "linear",
    angle: Number(match[1] ?? 90),
    stops: [match[3], match[4]],
  };
};

export const serializePickerGradient = (gradient: PickerGradient): string =>
  `${gradient.type}-gradient(${gradient.type === "linear" ? `${gradient.angle}deg` : "circle"}, ${gradient.stops[0]} 0%, ${gradient.stops[1]} 100%)`;

// Automatic contrast uses the first stop, composited over white for opacity.
// Authors can still override foreground colors for the actual surrounding surface.
export const getPickerContrastHex = (color: string): string => {
  const hex = parsePickerGradient(color)?.stops[0] ?? color;
  if (/^#[\da-f]{8}$/i.test(hex)) {
    const alpha = parseInt(hex.slice(7), 16) / 255;
    return `#${[1, 3, 5]
      .map((offset) =>
        Math.round(
          parseInt(hex.slice(offset, offset + 2), 16) * alpha +
            255 * (1 - alpha)
        )
          .toString(16)
          .padStart(2, "0")
      )
      .join("")}`;
  }
  return hex;
};
