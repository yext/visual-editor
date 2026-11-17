/** Keep validation and the selector's saved CSS values identical. */
export const constructFontSelectOptions = (
  fonts: Record<string, { fallback: string }>
): { label: string; value: string }[] =>
  Object.entries(fonts).map(([fontFamily, fontDetails]) => ({
    label: fontFamily,
    value: `'${fontFamily}', '${fontFamily} Fallback', ${fontDetails.fallback}`,
  }));
