import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { themeManagerCn } from "../../utils/cn.ts";

import { useThemeData } from "../../hooks/useThemeData.ts";
import { resolveThemeEntry } from "../../utils/dynamicTheme.ts";

export const buttonVariants = cva(
  "components h-fit flex items-center justify-center whitespace-nowrap",
  {
    variants: {
      linkPadding: { none: "", yOnly: "py-3" },
    },
  }
);

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  actionId?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, actionId, asChild = false, linkPadding = "none", ...props },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";
    const theme = useThemeData();
    const action = resolveThemeEntry(theme.actions, actionId);

    return (
      <Comp
        data-ve-action={action.id}
        className={themeManagerCn(buttonVariants({ linkPadding }), className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
