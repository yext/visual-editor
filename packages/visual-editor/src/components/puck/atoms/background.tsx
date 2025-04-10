import * as React from "react";
import {
  BackgroundStyle,
  BackgroundProvider,
  backgroundColors,
  themeManagerCn,
} from "../../../index.ts";

export interface BackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: BackgroundStyle;
  as?: "div" | "section" | "nav" | "header" | "footer" | "main" | "aside";
}

export const Background = React.forwardRef<HTMLDivElement, BackgroundProps>(
  ({ className, background, as, children, ...props }, ref) => {
    const Component = as ?? "div";

    return (
      <BackgroundProvider
        value={background ?? backgroundColors.background1.value}
      >
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
