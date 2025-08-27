import { cva, VariantProps } from "class-variance-authority";
import { Fields } from "@measured/puck";
import {
  SpacingSelector,
  BackgroundStyle,
  YextField,
  msg,
} from "@yext/visual-editor";

export const layoutVariants = cva("components w-full", {
  variants: {
    gap: {
      none: "",
      "0": "gap-0",
      "0.5": "gap-0.5",
      "1": "gap-1",
      "1.5": "gap-1.5",
      "2": "gap-2",
      "2.5": "gap-2.5",
      "3": "gap-3",
      "3.5": "gap-3.5",
      "4": "gap-4",
      "5": "gap-5",
      "6": "gap-6",
      "7": "gap-7",
      "8": "gap-8",
      "9": "gap-9",
      "10": "gap-10",
      "11": "gap-11",
      "12": "gap-12",
      "14": "gap-14",
      "16": "gap-16",
      "20": "gap-20",
      "24": "gap-24",
    },
    verticalPadding: {
      none: "",
      default: "py-pageSection-verticalPadding",
      "0": "py-0",
      "0.5": "py-0.5",
      "1": "py-1",
      "1.5": "py-1.5",
      "2": "py-2",
      "2.5": "py-2.5",
      "3": "py-3",
      "3.5": "py-3.5",
      "4": "py-4",
      "5": "py-5",
      "6": "py-6",
      "7": "py-7",
      "8": "py-8",
      "9": "py-9",
      "10": "py-10",
      "11": "py-11",
      "12": "py-12",
      "14": "py-14",
      "16": "py-16",
      "20": "py-20",
      "24": "py-24",
    },
    horizontalPadding: {
      none: "",
      "0": "px-0",
      "0.5": "px-0.5",
      "1": "px-1",
      "1.5": "px-1.5",
      "2": "px-2",
      "2.5": "px-2.5",
      "3": "px-3",
      "3.5": "px-3.5",
      "4": "px-4",
      "5": "px-5",
      "6": "px-6",
      "7": "px-7",
      "8": "px-8",
      "9": "px-9",
      "10": "px-10",
      "11": "px-11",
      "12": "px-12",
      "14": "px-14",
      "16": "px-16",
      "20": "px-20",
      "24": "px-24",
    },
    columnFormatting: {
      none: "",
      default: "md:grid md:grid-cols-12",
      forceHorizontal: "!grid grid-cols-12",
    },
  },
  defaultVariants: {
    gap: "none",
    verticalPadding: "none",
    horizontalPadding: "none",
    columnFormatting: "none",
  },
});

export interface layoutProps extends VariantProps<typeof layoutVariants> {
  backgroundColor?: BackgroundStyle;
}

export const layoutFields: Fields<layoutProps> = {
  backgroundColor: YextField(
    msg("fields.backgroundColor", "Background Color"),
    {
      type: "select",
      isOptional: true,
      options: "BACKGROUND_COLOR",
    }
  ),
  gap: SpacingSelector<layoutProps["gap"]>("Gap", "gap", false),
  verticalPadding: SpacingSelector<layoutProps["verticalPadding"]>(
    msg("fields.verticalPadding", "Top/Bottom Padding"),
    "padding",
    true
  ),
  horizontalPadding: SpacingSelector<layoutProps["horizontalPadding"]>(
    msg("fields.horizontalPadding", "Left/Right Padding"),
    "padding",
    false
  ),
};
