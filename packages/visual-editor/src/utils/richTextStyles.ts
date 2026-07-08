import type { CSSProperties } from "react";
import type { BaseTextStyles } from "../fields/styledFields/baseText.tsx";
import { getResolvedTextColorStyle } from "./colors.ts";
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
  const richTextTypographyStyle: Record<string, string> = {};

  for (const [property, cssVariable] of Object.entries(
    RICH_TEXT_TYPOGRAPHY_VARIABLES
  ) as [keyof BaseTextStyles, string][]) {
    const resolvedValue = resolveTextStyleValue(typography?.[property]);
    if (!resolvedValue) {
      continue;
    }

    richTextTypographyStyle[property] = resolvedValue;
    richTextTypographyStyle[cssVariable] = resolvedValue;
  }

  const richTextStyle = {
    ...getResolvedTextColorStyle(color),
    ...richTextTypographyStyle,
  };

  return Object.keys(richTextStyle).length > 0 ? richTextStyle : undefined;
};
