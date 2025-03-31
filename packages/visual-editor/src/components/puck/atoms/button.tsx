import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { themeManagerCn } from "../../../index.ts";

const buttonVariants = cva(
  "components h-fit flex items-center justify-center whitespace-nowrap transition-colors",
  {
    variants: {
      variant: {
        primary:
          "bg-palette-primary text-palette-primary-contrast border-palette-primary",
        secondary: "bg-none",
        link: "w-fit underline",
        directoryLink:
          "border-b-gray-400 border-b sm:border-transparent w-full sm:w-fit sm:underline py-3",
      },
      hasDarkBackground: {
        true: "",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: ["primary", "secondary"],
        className:
          "font-button-fontFamily text-button-fontSize font-button-fontWeight tracking-button-letterSpacing " +
          "hover:underline focus:underline active:underline sm:w-fit w-full px-6 py-3 border-2 border-solid rounded",
      },
      {
        variant: ["link", "directoryLink"],
        className:
          "bg-none justify-between gap-2 decoration-0 hover:no-underline " +
          "font-link-fontFamily text-link-fontSize font-link-fontWeight tracking-link-letterSpacing ",
      },
      {
        hasDarkBackground: false,
        variant: "secondary",
        className: "text-palette-primary-dark border-palette-primary-dark",
      },
      {
        hasDarkBackground: true,
        variant: "secondary",
        className: "text-white border-white",
      },
      {
        hasDarkBackground: false,
        variant: ["link", "directoryLink"],
        className: "text-palette-primary-dark",
      },
      {
        hasDarkBackground: true,
        variant: ["link", "directoryLink"],
        className: "text-white",
      },
    ],
    defaultVariants: {
      variant: "primary",
      hasDarkBackground: false,
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    const [hasDarkBackground, setHasDarkBackground] = React.useState(false);

    // handleRef determines if the active background color is light or dark and passes along the ref
    const handleRef = React.useCallback((node: HTMLButtonElement | null) => {
      // If the ref is resolved to an HTML element, get the parent color
      if (node) {
        // Loop until parent has a background color or there are no more parents
        let parent: HTMLElement | null = node;
        while (
          parent &&
          (window.getComputedStyle(parent).backgroundColor ===
            "rgba(0, 0, 0, 0)" || // skip transparent parents
            parent.className.includes("_DropZone")) // skip Puck wrappers
        ) {
          parent = parent.parentElement;
        }

        // Read the background color
        const backgroundColor = parent
          ? window.getComputedStyle(parent).backgroundColor
          : undefined;
        if (backgroundColor) {
          // Extract r g b from "color(srgb r g b)" or "rgb(r, g, b)"
          const srgb = backgroundColor
            .match(/color\(srgb\s([0-9.]+)\s([0-9.]+)\s([0-9.]+)\)/)
            ?.slice(1)
            ?.map(Number);
          const rgb = backgroundColor
            .match(/rgb\(([0-9.]+),\s([0-9.]+),\s([0-9.]+)\)/)
            ?.slice(1)
            ?.map(Number);

          // Convert to hsl and compare with lightness threshold
          const hsl = srgb
            ? srgbToHSL(srgb)
            : rgb
              ? srgbToHSL(rgb.map((c) => c / 255))
              : undefined;
          if (hsl?.[2] && !isNaN(hsl[2])) {
            setHasDarkBackground(hsl[2] < 50);
          }
        }
      }

      // Normal React ref functionality
      if (typeof ref === "function") {
        ref(node);
      } else if (ref) {
        (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
          node;
      }
    }, []);

    return (
      <Comp
        className={themeManagerCn(
          buttonVariants({ variant, hasDarkBackground }),
          className
        )}
        // textTransform has to be applied via styles because there is no custom tailwind utility
        style={{
          // @ts-expect-error ts(2322) the css variable here resolves to a valid enum value
          textTransform:
            variant === "link"
              ? "var(--textTransform-link-textTransform)"
              : "var(--textTransform-button-textTransform)",
        }}
        ref={handleRef}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

/**
 * srgbToHSL converts srgb colors to hsl values.
 * @param rgb [r, g, b]
 * @returns {number[] | undefined} [h, s, l] if conversion succeeds
 */
export const srgbToHSL = (rgb: number[]): number[] | undefined => {
  // based on https://codepen.io/himonoye/pen/ByaraoG?editors=1111
  // and https://www.rapidtables.com/convert/color/rgb-to-hsl.html
  if (rgb.length !== 3 || rgb.some((v) => v > 1 || v < 0)) {
    return;
  }

  const r = rgb[0],
    g = rgb[1],
    b = rgb[2];
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const sum = min + max;
  const diff = max - min;

  let sat = 0,
    hue = 0,
    light = 0;

  // Calculate Luminance
  light = sum / 2;

  // Calculate Saturation
  switch (diff) {
    case 0:
      break;
    default:
      sat = diff / (1 - Math.abs(2 * light - 1));
  }

  // Calculate Hue
  switch (max) {
    case min:
      break;
    case r:
      hue = (g - b) / diff + (g < b ? 6 : 0);
      break;
    case g:
      hue = (b - r) / diff + 2;
      break;
    case b:
      hue = (r - g) / diff + 4;
  }

  hue = Math.floor(hue * 60 * 10) / 10;
  sat = Math.floor(sat * 100 * 10) / 10;
  light = Math.floor(light * 100 * 10) / 10;

  return [hue, sat, light];
};

export { Button, buttonVariants };
