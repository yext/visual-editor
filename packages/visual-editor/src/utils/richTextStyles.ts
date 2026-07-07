import type { CSSProperties } from "react";
import type { BaseTextStyles } from "../fields/styledFields/baseText.tsx";
import { getThemeColorCssValue, normalizeThemeColorToken } from "./colors.ts";
import type { ThemeColor } from "./themeConfigOptions.ts";

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
 * Builds the CSS variable payload used by rich text renderers so typography and
 * color overrides stay consistent across plain HTML and resolved React output.
 */
export const getRichTextStyle = ({
  color,
  typography,
}: {
  color?: ThemeColor | string;
  typography?: Partial<BaseTextStyles>;
}): CSSProperties | undefined => {
  const fontFamily = resolveTextStyleValue(typography?.fontFamily);
  const fontSize = resolveTextStyleValue(typography?.fontSize);
  const fontWeight = resolveTextStyleValue(typography?.fontWeight);
  const fontStyle = resolveTextStyleValue(typography?.fontStyle);
  const textTransform = resolveTextStyleValue(typography?.textTransform);

  const richTextStyle: CSSProperties & {
    "--fontFamily-body-fontFamily"?: string;
    "--fontSize-body-fontSize"?: string;
    "--fontWeight-body-fontWeight"?: string;
    "--fontStyle-body-fontStyle"?: string;
    "--textTransform-body-textTransform"?: string;
  } = {
    ...getRichTextColorStyle(color),
  };

  if (fontFamily) {
    richTextStyle.fontFamily = fontFamily;
    richTextStyle["--fontFamily-body-fontFamily"] = fontFamily;
  }
  if (fontSize) {
    richTextStyle.fontSize = fontSize;
    richTextStyle["--fontSize-body-fontSize"] = fontSize;
  }
  if (fontWeight) {
    richTextStyle.fontWeight = fontWeight;
    richTextStyle["--fontWeight-body-fontWeight"] = fontWeight;
  }
  if (fontStyle) {
    richTextStyle.fontStyle = fontStyle as CSSProperties["fontStyle"];
    richTextStyle["--fontStyle-body-fontStyle"] = fontStyle;
  }
  if (textTransform) {
    richTextStyle.textTransform =
      textTransform as CSSProperties["textTransform"];
    richTextStyle["--textTransform-body-textTransform"] = textTransform;
  }

  return Object.keys(richTextStyle).length > 0 ? richTextStyle : undefined;
};
