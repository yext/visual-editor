import * as React from "react";
import { Command as CommandPrimitive } from "cmdk";
import { Search } from "lucide-react";

import { cn } from "../../../utils/cn.ts";

const Command = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive>
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "ve-flex ve-h-full ve-w-full ve-flex-col ve-overflow-hidden ve-rounded-sm",
      className
    )}
    {...props}
  />
));
Command.displayName = CommandPrimitive.displayName;

const CommandInput = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Input>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Input>
>(({ className, ...props }, ref) => (
  <div className="ve-flex ve-items-center ve-border-b ve-px-3">
    <Search className="ve-mr-2 ve-h-4 ve-w-4 ve-shrink-0 ve-opacity-50" />
    <CommandPrimitive.Input
      ref={ref}
      className={cn(
        "ve-flex ve-h-10 ve-w-full ve-rounded-sm ve-bg-transparent ve-py-3 ve-text-sm ve-outline-none placeholder:ve-text-muted-foreground disabled:ve-cursor-not-allowed disabled:ve-opacity-50",
        className
      )}
      {...props}
    />
  </div>
));

CommandInput.displayName = CommandPrimitive.Input.displayName;

const CommandList = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.List>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn(
      "ve-max-h-[300px] ve-overflow-y-auto ve-overflow-x-hidden",
      className
    )}
    {...props}
  />
));

CommandList.displayName = CommandPrimitive.List.displayName;

const CommandEmpty = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Empty>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Empty>
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="ve-py-6 ve-text-center ve-text-sm"
    {...props}
  />
));

CommandEmpty.displayName = CommandPrimitive.Empty.displayName;

const CommandGroup = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Group>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Group>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "ve-overflow-hidden ve-p-1 ve-text-foreground" +
        " [&_[cmdk-group-heading]]:ve-px-2 [&_[cmdk-group-heading]]:ve-pt-1.5 [&_[cmdk-group-heading]]:ve-pb-0 [&_[cmdk-group-heading]]:ve-text-sm [&_[cmdk-group-heading]]:ve-font-medium [&_[cmdk-group-heading]]:ve-text-muted-foreground" +
        " [&_[data-cmdk-group-subheading]]:ve-px-2 [&_[data-cmdk-group-subheading]]:ve-pt-0 [&_[data-cmdk-group-subheading]]:ve-pb-1.5 [&_[data-cmdk-group-subheading]]:ve-text-xs [&_[data-cmdk-group-subheading]]:ve-font-normal [&_[data-cmdk-group-subheading]]:ve-text-muted-foreground",
      className
    )}
    {...props}
  />
));

CommandGroup.displayName = CommandPrimitive.Group.displayName;

const CommandSeparator = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("ve--mx-1 ve-h-px ve-bg-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = CommandPrimitive.Separator.displayName;

const CommandItem = React.forwardRef<
  React.ElementRef<typeof CommandPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof CommandPrimitive.Item>
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "ve-relative ve-flex ve-cursor-default ve-gap-2 ve-select-none ve-items-center ve-rounded-sm ve-px-2 ve-py-1.5 ve-text-sm ve-outline-none data-[disabled=true]:ve-pointer-events-none data-[selected=true]:ve-bg-accent data-[selected=true]:ve-text-accent-foreground data-[disabled=true]:ve-opacity-50 [&_svg]:ve-pointer-events-none [&_svg]:ve-size-4 [&_svg]:ve-shrink-0",
      className
    )}
    {...props}
  />
));

CommandItem.displayName = CommandPrimitive.Item.displayName;

const CommandShortcut = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement>) => {
  return (
    <span
      className={cn(
        "ve-ml-auto ve-text-xs ve-tracking-widest ve-text-muted-foreground",
        className
      )}
      {...props}
    />
  );
};
CommandShortcut.displayName = "CommandShortcut";

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
