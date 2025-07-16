import * as React from "react";
import {
  BackgroundStyle,
  BackgroundProvider,
  backgroundColors,
  themeManagerCn,
} from "@yext/visual-editor";

export interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: BackgroundStyle;
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "aside";
}

export const Background = React.forwardRef<HTMLDivElement, BackgroundProps>(
  ({ className, background, as, children, ...props }, ref) => {
    const Component = as ?? "div";
    const selectedBackground = background ?? backgroundColors.background1.value;

    const theme = window.document.getElementById(
      "visual-editor-theme"
    ) as HTMLStyleElement;

    // Determine if the background is light or dark
    const backgroundValue: Required<BackgroundStyle> = React.useMemo(() => {
      const paletteColorCSSVariable = selectedBackground.bgColor.replace(
        "bg-",
        ""
      ); // of the form `--palette-x`

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

      // Get value for contrast color from `--palette-x-contrast:#xxxxxx!important;`
      const regex = new RegExp(
        `${paletteColorCSSVariable}-contrast\\s*:\\s*([^;!]+)`,
        "i"
      );
      const match = theme.innerText.match(regex);

      return {
        bgColor: selectedBackground.bgColor,
        textColor: selectedBackground.textColor,
        isDarkBackground: Boolean(match && match[1].trim() === "#FFFFFF"),
      };
    }, [selectedBackground, theme.innerText]);

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
