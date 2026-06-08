import * as React from "react";
import {
  ThemeColor,
  backgroundColors,
} from "../../utils/themeConfigOptions.ts";
import { BackgroundProvider } from "../../hooks/useBackground.tsx";
import { themeManagerCn } from "../../utils/cn.ts";
import { useDocument } from "../../hooks/useDocument.tsx";
import {
  getBackgroundColorClasses,
  getBackgroundColorStyle,
  isDarkColor,
} from "../../utils/colors.ts";

export interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: ThemeColor;
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "aside";
}

export const Background = React.forwardRef<HTMLDivElement, BackgroundProps>(
  ({ className, background, as, children, style, ...props }, ref) => {
    const streamDocument = useDocument();
    const Component = as ?? "div";
    const selectedBackground = background ?? backgroundColors.background1.value;

    const backgroundValue: Required<ThemeColor> = React.useMemo(() => {
      return {
        selectedColor: selectedBackground.selectedColor,
        contrastingColor: selectedBackground.contrastingColor,
        isDarkColor: isDarkColor(selectedBackground, streamDocument),
      };
    }, [selectedBackground, streamDocument]);

    return (
      <BackgroundProvider value={backgroundValue}>
        <Component
          className={themeManagerCn(
            "components",
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
