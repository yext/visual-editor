import * as React from "react";
import {
  BackgroundStyle,
  BackgroundProvider,
  backgroundColors,
  themeManagerCn,
  useDocument,
} from "@yext/visual-editor";

export interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: BackgroundStyle;
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "aside";
}

export const Background = React.forwardRef<HTMLDivElement, BackgroundProps>(
  ({ className, background, as, children, ...props }, ref) => {
    const document = useDocument();
    const Component = as ?? "div";
    const selectedBackground = background ?? backgroundColors.background1.value;
    let publishedTheme: Record<string, string> | undefined;
    let cssVariables: string | undefined;

    // In the editor, we must get the colors from the CSS variables because
    // that is where they are updated. However, during page generation, we must
    // we must get the colors from document.__.theme because the CSS variables do not exist.
    // On the hydrated live page, either will work; this uses the CSS variables.
    if (
      typeof window !== "undefined" &&
      typeof window.document !== "undefined"
    ) {
      const styleTag = window.document.getElementById(
        "visual-editor-theme"
      ) as HTMLStyleElement;
      cssVariables = styleTag?.innerText ?? "";
    } else if (document?.__?.theme) {
      try {
        publishedTheme = JSON.parse(document.__.theme) as Record<
          string,
          string
        >;
      } catch {
        // continue
      }
    }

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

      // Handle page generation
      if (publishedTheme) {
        let isDarkBackground;
        const contrastColor = publishedTheme[paletteColorContrastCSSVariable];

        if (contrastColor) {
          isDarkBackground = contrastColor === "#FFFFFF";
        } else {
          // Handle color palette defaults
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
        }

        return {
          bgColor: selectedBackground.bgColor,
          textColor: selectedBackground.textColor,
          isDarkBackground,
        };
      }

      // Handle editor and hydrated live page
      if (cssVariables) {
        // Get value for contrast color from `--colors-palette-x-contrast:#xxxxxx!important;`
        const regex = new RegExp(
          `${paletteColorContrastCSSVariable}\\s*:\\s*([^;!]+)`,
          "i"
        );
        const match = cssVariables.match(regex);

        return {
          bgColor: selectedBackground.bgColor,
          textColor: selectedBackground.textColor,
          isDarkBackground: Boolean(match && match[1].trim() === "#FFFFFF"),
        };
      }

      // Fall back
      return {
        bgColor: selectedBackground.bgColor,
        textColor: selectedBackground.textColor,
        isDarkBackground: false,
      };
    }, [selectedBackground, publishedTheme, cssVariables]);

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
