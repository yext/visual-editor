import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "../../utils/cn.ts";

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Root
      className={cn("ve-grid ve-gap-2", className)}
      {...props}
      ref={ref}
    />
  );
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadioGroupPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        "ve-aspect-square ve-h-4 ve-w-4 ve-rounded-full ve-border ve-border-[#dcdcdc] ve-ring-offset focus:ve-outline-none focus-visible:ve-ring-2 focus-visible:ve-ring-offset-2 disabled:ve-cursor-not-allowed disabled:ve-opacity-50",
        className
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="ve-flex ve-items-center ve-justify-center">
        <Circle className="ve-h-2.5 ve-w-2.5 ve-fill-current ve-text-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

export { RadioGroup, RadioGroupItem };
