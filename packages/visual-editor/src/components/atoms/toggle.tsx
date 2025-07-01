"use client";

import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { themeManagerCn } from "@yext/visual-editor";

function Toggle({
  className,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={themeManagerCn(
        "items-center justify-center gap-2 rounded-full text-black " +
          "data-[state=on]:bg-palette-secondary data-[state=on]:border-palette-secondary " +
          "whitespace-nowrap border-gray-200 border border-solid hover:underline " +
          "font-button-fontFamily text-button-fontSize font-button-fontWeight tracking-button-letterSpacing",
        className
      )}
      {...props}
    />
  );
}

export { Toggle };
