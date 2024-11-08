import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { yextCn } from "../../../utils/yextCn.ts";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={yextCn(
      "ve-relative ve-h-4 ve-w-full ve-overflow-hidden ve-rounded-full ve-bg-secondary",
      className
    )}
    {...props}
  >
    <ProgressPrimitive.Indicator
      className="ve-h-full ve-w-full ve-flex-1 ve-bg-primary ve-transition-all"
      style={{ transform: `translateX(-${100 - (value || 0)}%)` }}
    />
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
