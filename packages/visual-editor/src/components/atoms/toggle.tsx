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
      style={{
        // @ts-expect-error ts(2322) the css variable here resolves to a valid enum value
        textTransform: "var(--textTransform-button-textTransform)",
      }}
      className={themeManagerCn(
        "inline-flex items-center justify-center gap-2 rounded-full text-black " +
          "bg-gray-100 ",
        "whitespace-nowrap border-black text-black border border-solid hover:underline " +
          "font-button-fontFamily text-button-fontSize font-button-fontWeight tracking-button-letterSpacing",
        "data-[state=on]:bg-palette-secondary data-[state=on]:border-palette-secondary data-[state=on]:text-palette-secondary-dark" +
          "self-start w-auto",
        className
      )}
      {...props}
    />
  );
}

export { Toggle };
