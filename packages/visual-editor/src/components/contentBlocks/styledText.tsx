import * as React from "react";
import { type StyledTextValue } from "../../fields/styledFields/StyledTextField.tsx";
import { getTextColorClass, getTextColorStyle } from "../../utils/colors.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import { type ThemeColor } from "../../utils/themeConfigOptions.ts";

export type StyledTextTag =
  | "div"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "p"
  | "span"
  | "strong";

export type StyledTextAlignment = "left" | "center" | "right";

/**
 * Resolves the editor's StyledTextValue into CSS properties that can be applied
 * to plain text or forwarded into richer shared renderers.
 */
export const getStyledTextStyle = (
  styles?: StyledTextValue
): React.CSSProperties | undefined => {
  if (!styles) {
    return undefined;
  }

  const resolvedStyle: React.CSSProperties = {};

  if (styles.fontFamily !== "default") {
    resolvedStyle.fontFamily = styles.fontFamily;
  }
  if (styles.fontSize !== "default") {
    resolvedStyle.fontSize = styles.fontSize;
  }
  if (styles.fontWeight !== "default") {
    resolvedStyle.fontWeight = styles.fontWeight;
  }
  if (styles.fontStyle !== "default") {
    resolvedStyle.fontStyle = styles.fontStyle;
  }
  if (styles.textTransform !== "default") {
    resolvedStyle.textTransform = styles.textTransform;
  }

  return Object.keys(resolvedStyle).length > 0 ? resolvedStyle : undefined;
};

export const styledTextAlignClassName: Record<StyledTextAlignment, string> = {
  left: "text-left",
  center: "text-center",
  right: "text-right",
};

type StyledTextElementProps = {
  align?: StyledTextAlignment;
  as?: StyledTextTag;
  children: React.ReactNode;
  className?: string;
  color?: ThemeColor;
  style?: React.CSSProperties;
};

/**
 * Shared semantic text element that applies theme text color handling and
 * StyledTextValue typography without duplicating component-level resolver code.
 */
export const StyledTextElement = React.forwardRef<
  HTMLElement,
  StyledTextElementProps
>(({ align, as = "span", children, className, color, style }, ref) => {
  const Tag = as;
  const alignClassName = align ? styledTextAlignClassName[align] : undefined;

  return (
    <Tag
      className={themeManagerCn(
        "components",
        getTextColorClass(color),
        as === "span" && "block",
        alignClassName,
        className
      )}
      style={{
        ...getTextColorStyle(color),
        ...style,
      }}
      ref={ref as never}
    >
      {children}
    </Tag>
  );
});
StyledTextElement.displayName = "StyledTextElement";
