import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Extends the default tailwind-merge config: https://github.com/dcastil/tailwind-merge/blob/v1.12.0/src/lib/default-config.ts
// API reference: https://github.com/dcastil/tailwind-merge/blob/v1.12.0/docs/api-reference.md
//
// Each classGroup is a set of class names that should be merged.
// For example, in "font-bold font-lg font-sm", "font-bold" is in the font-weight classGroup while "font-lg" and "font-sm" are font-size,
// so "font-lg" and "font-sm" should be merged while "font-bold" should be kept -> "font-bold font-sm".
// The classGroup names below come from the default config.
//
// Each classGroup has an array of class names that belong to that class group, which can include validation functions
// So, for
// "font-family": [
//   { font: [(value: string) => value.endsWith("-fontFamily")] },
// ],
// any class uses the tailwind utility "font" and ends with "-fontFamily" (like our font-heading1-fontFamily, font-body-fontFamily)
// will be merged with other fontFamily classes (such as "font-serif")

export const themeMangerTwMergeConfiguration = {
  extend: {
    classGroups: {
      "font-family": [
        { font: [(value: string) => value.endsWith("-fontFamily")] },
      ],
      "font-weight": [
        { font: [(value: string) => value.endsWith("-fontWeight")] },
      ],
      "font-size": [{ text: [(value: string) => value.endsWith("-fontSize")] }],
      "text-color": [{ text: [(value: string) => value.endsWith("-color")] }],
      "gap-y": [
        { "gap-y": [(value: string) => value.endsWith("-verticalSpacing")] },
      ],
      "max-w": [
        {
          "max-w": [(value: string) => value.endsWith("-maxWidth")],
        },
      ],
      "bg-color": [
        {
          "bg-color": [(value: string) => value.endsWith("-backgroundColor")],
        },
      ],
      rounded: [
        {
          rounded: [(value: string) => value.endsWith("-borderRadius")],
        },
      ],
    },
  },
};

const customTwMerge = extendTailwindMerge(themeMangerTwMergeConfiguration);

// For use in the component library
export function themeMangerCn(...inputs: ClassValue[]) {
  return customTwMerge(clsx(inputs));
}

const internalTwMerge = extendTailwindMerge({ prefix: "ve-" });

// For use in the editor
export function cn(...inputs: ClassValue[]) {
  return internalTwMerge(clsx(inputs));
}
