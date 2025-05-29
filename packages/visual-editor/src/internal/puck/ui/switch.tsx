import * as React from "react";
import * as SwitchPrimitives from "@radix-ui/react-switch";
import { cn } from "../../../utils/cn.ts";

interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root> {
  icon?: React.ReactNode; // Add the icon prop here
}

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  SwitchProps
>(({ className, icon, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      "ve-self-center ve-peer ve-inline-flex ve-h-5 ve-w-9 ve-shrink-0 ve-cursor-pointer ve-items-center ve-rounded-full ve-border-2 ve-border-transparent ve-transition-colors focus-visible:ve-outline-none focus-visible:ve-ring-2 focus-visible:ve-ring-ring focus-visible:ve-ring-offset-2 focus-visible:ve-ring-offset-background disabled:ve-cursor-not-allowed disabled:ve-opacity-50 data-[state=checked]:ve-bg-primary data-[state=unchecked]:ve-bg-input",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        "ve-self-center ve-pointer-events-none ve-block ve-h-4 ve-w-4 ve-rounded-full ve-bg-background ve-shadow-lg ve-ring-0 ve-transition-transform data-[state=checked]:ve-translate-x-4 data-[state=unchecked]:ve-translate-x-0"
      )}
    >
      {icon && (
        <span className="ve-flex ve-items-center ve-justify-center">
          {icon}
        </span>
      )}
    </SwitchPrimitives.Thumb>
  </SwitchPrimitives.Root>
));
Switch.displayName = SwitchPrimitives.Root.displayName;

export { Switch };
