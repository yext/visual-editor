import * as React from "react";
import {
  BackgroundStyle,
  backgroundColors,
} from "../../utils/themeConfigOptions.ts";
import { BackgroundProvider } from "../../hooks/useBackground.tsx";
import { themeManagerCn } from "../../utils/cn.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import { getThemeValue } from "../../utils/getThemeValue.ts";

export interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: BackgroundStyle;
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "aside";
}

export const Background = React.forwardRef<HTMLDivElement, BackgroundProps>(
  ({ className, background, as, children, ...props }, ref) => {
    const streamDocument = useDocument();
    const Component = as ?? "div";
    const selectedBackground = background ?? backgroundColors.background1.value;

    const backgroundValue: Required<BackgroundStyle> = React.useMemo(() => {
      // Our built-in backgrounds are always light or dark
      if (
        selectedBackground.textColor === "text-white" ||
        selectedBackground.textColor === "text-black"
      ) {
        return {
          bgColor: selectedBackground.bgColor,
          textColor: selectedBackground.textColor,
          isDarkBackground: selectedBackground.textColor === "text-white",
        };
      }

      // of the form `palette-x`
      const paletteColor = selectedBackground.bgColor.replace("bg-", "");
      // of the form `--colors-palette-x-contrast`
      const paletteColorContrastCSSVariable = `--colors-${paletteColor}-contrast`;

      const contrastColor = getThemeValue(
        paletteColorContrastCSSVariable,
        streamDocument
      );
      if (contrastColor) {
        return {
          bgColor: selectedBackground.bgColor,
          textColor: selectedBackground.textColor,
          isDarkBackground: contrastColor.toUpperCase() === "#FFFFFF",
        };
      }

      // Handle color palette defaults and fallback.
      let isDarkBackground;
      switch (paletteColorContrastCSSVariable) {
        case "--colors-palette-primary-contrast":
          isDarkBackground = true;
          break;
        case "--colors-palette-secondary-contrast":
          isDarkBackground = true;
          break;
        case "--colors-palette-tertiary-contrast":
          isDarkBackground = false;
          break;
        case "--colors-palette-quaternary-contrast":
          isDarkBackground = true;
          break;
        default:
          isDarkBackground = false;
          break;
      }

      return {
        bgColor: selectedBackground.bgColor,
        textColor: selectedBackground.textColor,
        isDarkBackground,
      };
    }, [selectedBackground, streamDocument]);

    return (
      <BackgroundProvider value={backgroundValue}>
        <Component
          className={themeManagerCn(
            "components",
            background?.bgColor,
            background?.textColor,
            className
          )}
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
