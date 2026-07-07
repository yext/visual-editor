import type { CSSProperties } from "react";
import type { BaseTextStyles } from "../fields/styledFields/baseText.tsx";
import { getThemeColorCssValue, normalizeThemeColorToken } from "./colors.ts";
import type { ThemeColor } from "./themeConfigOptions.ts";

const RICH_TEXT_TYPOGRAPHY_VARIABLES = {
  fontFamily: "--fontFamily-body-fontFamily",
  fontSize: "--fontSize-body-fontSize",
  fontWeight: "--fontWeight-body-fontWeight",
  fontStyle: "--fontStyle-body-fontStyle",
  textTransform: "--textTransform-body-textTransform",
} satisfies Record<keyof BaseTextStyles, string>;

const resolveTextStyleValue = (value?: string): string | undefined =>
  value && value !== "default" ? value : undefined;

const isResolvedCssColor = (color?: string): boolean =>
  !!color &&
  (color.startsWith("#") ||
    color.startsWith("var(") ||
    color.startsWith("rgb(") ||
    color.startsWith("rgba(") ||
    color.startsWith("hsl(") ||
    color === "transparent" ||
    color === "inherit");

const getRichTextColorStyle = (
  color?: ThemeColor | string
): CSSProperties | undefined => {
  if (typeof color === "string" && isResolvedCssColor(color)) {
    return { color };
  }

  const normalizedColor = normalizeThemeColorToken(color);
  if (!normalizedColor) {
    return undefined;
  }

  const resolvedColor = getThemeColorCssValue(normalizedColor);
  return resolvedColor ? { color: resolvedColor } : undefined;
};

/**
 * Builds the CSS variable payload used by rich text renderers.
 *
 * Operation overview:
 * 1. Normalize the optional typography overrides by dropping `"default"` values.
 * 2. Resolve the optional text color into a concrete CSS color declaration.
 * 3. Mirror each typography override onto the rich-text CSS variable contract.
 */
export const getRichTextStyle = ({
  color,
  typography,
}: {
  color?: ThemeColor | string;
  typography?: Partial<BaseTextStyles>;
}): CSSProperties | undefined => {
  const richTextStyle: CSSProperties & {
    "--fontFamily-body-fontFamily"?: string;
    "--fontSize-body-fontSize"?: string;
    "--fontWeight-body-fontWeight"?: string;
    "--fontStyle-body-fontStyle"?: string;
    "--textTransform-body-textTransform"?: string;
  } = {
    ...getRichTextColorStyle(color),
  };

  for (const [property, cssVariable] of Object.entries(
    RICH_TEXT_TYPOGRAPHY_VARIABLES
  ) as [keyof BaseTextStyles, string][]) {
    const resolvedValue = resolveTextStyleValue(typography?.[property]);
    if (!resolvedValue) {
      continue;
    }

    richTextStyle[property] = resolvedValue as never;
    richTextStyle[cssVariable as keyof typeof richTextStyle] =
      resolvedValue as never;
  }

  return Object.keys(richTextStyle).length > 0 ? richTextStyle : undefined;
};
