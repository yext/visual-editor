import type { CSSProperties } from "react";
import type { BaseTextStyles } from "../styledFields/baseText.tsx";
import type { StyledTextValue } from "../styledFields/StyledTextField.tsx";
import type { StyledButtonValue } from "../styledFields/StyledButtonField.tsx";
import type { StyledLinkValue } from "../styledFields/StyledLinkField.tsx";
import type { StyledImageValue } from "../styledFields/StyledImageField.tsx";
import type { StyledPageSectionValue } from "../styledFields/StyledPageSection.tsx";
import { getThemeColorCssValue } from "../../utils/colors.ts";

/** Omits inherited typography choices so the theme can continue to supply them. */
function resolveTypography(value?: Partial<BaseTextStyles>): CSSProperties {
  const style: CSSProperties = {};
  if (value?.fontFamily && value.fontFamily !== "default") {
    style.fontFamily = value.fontFamily;
  }
  if (value?.fontSize && value.fontSize !== "default") {
    style.fontSize = value.fontSize;
  }
  if (value?.fontWeight && value.fontWeight !== "default") {
    style.fontWeight = value.fontWeight;
  }
  if (value?.fontStyle && value.fontStyle !== "default") {
    style.fontStyle = value.fontStyle;
  }
  if (value?.textTransform && value.textTransform !== "default") {
    style.textTransform = value.textTransform;
  }
  return style;
}

/** Converts authored text styling to a CSS object for its render component. */
export function resolveStyledText(value?: StyledTextValue): CSSProperties {
  const style = resolveTypography(value);
  const color = getThemeColorCssValue(value?.color);
  if (color) {
    style.color = color;
  }
  return style;
}

/** Converts authored button typography, spacing, and radius to CSS styles. */
export function resolveStyledButton(value?: StyledButtonValue): CSSProperties {
  const style = resolveTypography(value);
  if (value?.letterSpacing && value.letterSpacing !== "default") {
    style.letterSpacing = value.letterSpacing;
  }
  if (value?.borderRadius && value.borderRadius !== "default") {
    style.borderRadius = value.borderRadius;
  }
  return style;
}

/** Converts authored link typography and caret choice to CSS styles. */
export function resolveStyledLink(value?: StyledLinkValue): CSSProperties {
  const style: CSSProperties & { "--display-link-caret"?: string } =
    resolveTypography(value);
  if (value?.letterSpacing && value.letterSpacing !== "default") {
    style.letterSpacing = value.letterSpacing;
  }
  if (value?.includeCaret && value.includeCaret !== "default") {
    style["--display-link-caret"] = value.includeCaret;
  }
  return style;
}

/** Converts the authored image radius to CSS styles. */
export function resolveStyledImage(value?: StyledImageValue): CSSProperties {
  return value?.borderRadius && value.borderRadius !== "default"
    ? { borderRadius: value.borderRadius }
    : {};
}

/** Converts authored section width and vertical padding to CSS styles. */
export function resolveStyledPageSection(
  value?: StyledPageSectionValue
): CSSProperties {
  return {
    ...(value?.contentWidth && value.contentWidth !== "default"
      ? { maxWidth: value.contentWidth }
      : {}),
    ...(value?.verticalPadding && value.verticalPadding !== "default"
      ? {
          paddingTop: value.verticalPadding,
          paddingBottom: value.verticalPadding,
        }
      : {}),
  };
}
