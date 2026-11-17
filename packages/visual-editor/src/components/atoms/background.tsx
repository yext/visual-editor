import * as React from "react";
import { ThemeColor } from "../../utils/themeConfigOptions.ts";
import { BackgroundProvider } from "../../hooks/useBackground.tsx";
import { themeManagerCn } from "../../utils/cn.ts";
import { useDocument } from "../../hooks/useDocument.tsx";

import {
  getBackgroundColorClasses,
  getBackgroundColorStyle,
  type ResolvedThemeColor,
  getThemeColorCssValue,
  getDefaultForegroundColor,
  isDarkColor,
} from "../../utils/colors.ts";
import { useThemeData } from "../../hooks/useThemeData.ts";
import { resolveThemeEntry } from "../../utils/dynamicTheme.ts";

export interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: ThemeColor | ResolvedThemeColor;
  backgroundId?: string;
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "aside";
}

export const Background = React.forwardRef<HTMLDivElement, BackgroundProps>(
  (
    { className, background, backgroundId, as, children, style, ...props },
    ref
  ) => {
    const streamDocument = useDocument();
    const theme = useThemeData();
    const pair = resolveThemeEntry(
      theme.colors,
      background?.colorId ?? backgroundId
    );
    const Component = as ?? "div";
    const appearance = className
      ?.split(/\s+/)
      .find(
        (name) => name === "ve-theme-on-dark" || name === "ve-theme-on-light"
      );
    const backgroundValue = {
      selectedColor:
        background?.selectedColor !== undefined
          ? (getThemeColorCssValue(background) ?? pair.background)
          : pair.background,
      contrastingColor:
        getThemeColorCssValue(getDefaultForegroundColor(background)) ??
        pair.foreground,
      isDarkColor: appearance
        ? appearance === "ve-theme-on-dark"
        : isDarkColor(
            background &&
              (background.colorId === undefined ||
                background.isDarkColor !== undefined)
              ? background
              : pair[background?.channel ?? "background"],
            streamDocument
          ),
    };
    return (
      <BackgroundProvider value={backgroundValue}>
        <Component
          data-ve-background={pair.id}
          className={themeManagerCn(
            "components",
            backgroundValue.isDarkColor
              ? "ve-theme-on-dark"
              : "ve-theme-on-light",
            getBackgroundColorClasses(background),
            className
          )}
          style={{
            ...getBackgroundColorStyle(background),
            ...style,
          }}
          ref={ref}
          {...props}
        >
          {children}
        </Component>
      </BackgroundProvider>
    );
  }
);
Background.displayName = "Background";
