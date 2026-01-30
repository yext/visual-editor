import * as React from "react";
import * as TogglePrimitive from "@radix-ui/react-toggle";
import { themeManagerCn } from "../../utils/cn";

function Toggle({
  className,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      style={{
        // @ts-ignore: the css variable here resolves to a valid enum value
        textTransform: "var(--textTransform-button-textTransform)",
      }}
      className={themeManagerCn(
        "inline-flex items-center justify-center gap-2 rounded-full text-black " +
          "bg-gray-100 ",
        "whitespace-nowrap text-black hover:underline " +
          "font-button-fontFamily text-button-fontSize font-button-fontWeight tracking-button-letterSpacing ",
        "data-[state=on]:bg-palette-secondary data-[state=on]:text-palette-secondary-dark " +
          "self-start w-auto",
        className
      )}
      {...props}
    />
  );
}

export { Toggle };
