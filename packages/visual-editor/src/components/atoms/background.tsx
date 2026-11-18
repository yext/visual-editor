import * as React from "react";
import {
  ThemeColor,
  type SurfaceRole,
  type SurfaceValue,
} from "../../utils/themeOptions.ts";
import { BackgroundProvider } from "../../hooks/useBackground.tsx";
import { themeManagerCn } from "../../utils/cn.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { useThemeValueReader } from "../../hooks/useThemeValue.ts";
import {
  resolveBackgroundColor,
  getThemeColorCssValue,
  type ResolvedThemeColor,
} from "../../utils/colors.ts";

export interface BackgroundProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "color"
> {
  surfaceRole?: SurfaceRole | "inherit";
  /** Authoritative background for contrast and interaction colors; style is visual-only. */
  background?: SurfaceValue | ResolvedThemeColor;
  color?: ThemeColor;
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "aside";
}

export const Background = React.forwardRef<HTMLDivElement, BackgroundProps>(
  (
    {
      className,
      surfaceRole = "inherit",
      background,
      color,
      as,
      children,
      style,
      ...props
    },
    ref
  ) => {
    const streamDocument = useDocument();
    const Component = as ?? "div";
    const activeSurfaceRole =
      typeof background === "string" ? background : surfaceRole;
    const backgroundColor =
      typeof background === "string" ? undefined : background;
    const surface =
      activeSurfaceRole === "page" || activeSurfaceRole === "inherit"
        ? "background"
        : activeSurfaceRole;
    const resolved = useThemeValueReader(
      React.useCallback(
        () => resolveBackgroundColor(backgroundColor, surface, streamDocument),
        [backgroundColor, surface, streamDocument]
      )
    );
    const hasBoundary = activeSurfaceRole !== "inherit" || resolved.hasOverride;
    const content = (
      <Component
        className={themeManagerCn(
          "components",
          activeSurfaceRole !== "inherit" && `ve-theme-${activeSurfaceRole}`,
          resolved.hasOverride &&
            (resolved.context.isDarkColor
              ? "ve-theme-on-dark"
              : "ve-theme-on-light"),
          className
        )}
        style={{
          ...resolved.style,
          color: getThemeColorCssValue(color) ?? resolved.style.color,
          ...style,
        }}
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    );
    return hasBoundary ? (
      <BackgroundProvider value={resolved.context}>
        {content}
      </BackgroundProvider>
    ) : (
      content
    );
  }
);
Background.displayName = "Background";
