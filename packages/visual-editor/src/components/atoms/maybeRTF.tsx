import { Body, BodyProps } from "./body.tsx";
import { RichText } from "../../types/types.ts";
import type { BaseTextStyles } from "../../fields/styledFields/baseText.tsx";
import {
  getThemeColorCssValue,
  normalizeThemeColorToken,
} from "../../utils/colors.ts";
import { type ThemeColor } from "../../utils/themeConfigOptions.ts";
import "./maybeRTF.css";

export type RichTextStyleOverrides = Partial<BaseTextStyles> & {
  color?: ThemeColor | string;
};

export interface MaybeRTFProps extends Record<string, any> {
  data: RichText | string | undefined;
  bodyVariant?: BodyProps["variant"];
  /** Override the theme's styling */
  richTextStyleOverrides?: RichTextStyleOverrides;
}

const resolveTextStyleValue = (value?: string) =>
  value && value !== "default" ? value : undefined;

const getTextStyles = (
  typography?: Partial<BaseTextStyles>
): React.CSSProperties | undefined => {
  if (!typography) {
    return undefined;
  }

  const styles: React.CSSProperties & {
    "--fontFamily-body-fontFamily"?: string;
    "--fontSize-body-fontSize"?: string;
    "--fontWeight-body-fontWeight"?: string;
    "--fontStyle-body-fontStyle"?: string;
    "--textTransform-body-textTransform"?: string;
  } = {};

  const fontFamily = resolveTextStyleValue(typography.fontFamily);
  const fontSize = resolveTextStyleValue(typography.fontSize);
  const fontWeight = resolveTextStyleValue(typography.fontWeight);
  const fontStyle = resolveTextStyleValue(typography.fontStyle);
  const textTransform = resolveTextStyleValue(typography.textTransform);

  if (fontFamily) {
    styles.fontFamily = fontFamily;
    styles["--fontFamily-body-fontFamily"] = fontFamily;
  }
  if (fontSize) {
    styles.fontSize = fontSize;
    styles["--fontSize-body-fontSize"] = fontSize;
  }
  if (fontWeight) {
    styles.fontWeight = fontWeight;
    styles["--fontWeight-body-fontWeight"] = fontWeight;
  }
  if (fontStyle) {
    styles.fontStyle = fontStyle as React.CSSProperties["fontStyle"];
    styles["--fontStyle-body-fontStyle"] = fontStyle;
  }
  if (textTransform) {
    styles.textTransform =
      textTransform as React.CSSProperties["textTransform"];
    styles["--textTransform-body-textTransform"] = textTransform;
  }

  return Object.keys(styles).length ? styles : undefined;
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

const getRichTextColorStyle = (
  color?: ThemeColor | string
): React.CSSProperties | undefined => {
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

export const MaybeRTF = ({
  data,
  bodyVariant = "base",
  richTextStyleOverrides,
  style,
  className,
  ...props
}: MaybeRTFProps) => {
  const typographyStyles = getTextStyles(richTextStyleOverrides);
  const colorStyles = getRichTextColorStyle(richTextStyleOverrides?.color);
  const mergedStyle = {
    ...typographyStyles,
    ...colorStyles,
    ...style,
  };

  if (!data) {
    return <></>;
  }

  if (typeof data === "string") {
    return (
      <Body
        {...props}
        className={className}
        style={mergedStyle}
        variant={bodyVariant}
      >
        {data}
      </Body>
    );
  }

  if (typeof data === "object") {
    if ("html" in data && data.html) {
      return (
        <div
          {...props}
          style={mergedStyle}
          dangerouslySetInnerHTML={{ __html: data.html }}
          className={`rtf-theme rtf-wrapper ${bodyVariant !== "base" ? `rtf-body-${bodyVariant}` : ""}`}
        />
      );
    }
  }

  return <></>;
};
