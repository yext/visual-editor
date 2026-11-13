import * as React from "react";
import { type TypographyRole, ThemeColor } from "../../utils/themeOptions.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import { getTextColorClass, getTextColorStyle } from "../../utils/colors.ts";

// Omit 'color' from HTMLAttributes<HTMLParagraphElement> to avoid conflict
export interface BodyProps extends Omit<
  React.HTMLAttributes<HTMLParagraphElement>,
  "color"
> {
  color?: ThemeColor;
  typographyRole?: TypographyRole;
}

export const Body = React.forwardRef<HTMLParagraphElement, BodyProps>(
  ({ className, color, typographyRole = "body", style, ...props }, ref) => {
    return (
      <p
        className={themeManagerCn(
          "components",
          `ve-theme-${typographyRole}`,
          getTextColorClass(color),
          className
        )}
        style={{
          ...getTextColorStyle(color),
          ...style,
        }}
        ref={ref}
        {...props}
      >
        {props.children}
      </p>
    );
  }
);
Body.displayName = "Body";
