import * as React from "react";
import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "../../../utils/cn.ts";

const Popover = PopoverPrimitive.Root;

const PopoverTrigger = PopoverPrimitive.Trigger;

const PopoverAnchor = PopoverPrimitive.Anchor;

const PopoverContent = React.forwardRef<
  React.ElementRef<typeof PopoverPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>
>(({ className, align = "center", sideOffset = 4, ...props }, ref) => (
  <PopoverPrimitive.Portal>
    <PopoverPrimitive.Content
      ref={ref}
      align={align}
      sideOffset={sideOffset}
      className={cn(
        "ve-z-50 ve-w-72 ve-rounded-sm ve-border ve-shadow-md ve-outline-none data-[state=open]:ve-animate-in data-[state=closed]:ve-animate-out data-[state=closed]:ve-fade-out-0 data-[state=open]:ve-fade-in-0 data-[state=closed]:ve-zoom-out-95 data-[state=open]:ve-zoom-in-95 data-[side=bottom]:ve-slide-in-from-top-2 data-[side=left]:ve-slide-in-from-right-2 data-[side=right]:ve-slide-in-from-left-2 data-[side=top]:ve-slide-in-from-bottom-2",
        className
      )}
      {...props}
    />
  </PopoverPrimitive.Portal>
));
PopoverContent.displayName = PopoverPrimitive.Content.displayName;

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
