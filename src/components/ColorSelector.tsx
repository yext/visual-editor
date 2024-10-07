import React from "react";
import { Field, FieldLabel } from "@measured/puck";
import { RenderProps } from "../internal/utils/renderEntityFields.tsx";
import { ColorResult, RGBColor, SketchPicker } from "react-color";

export type ColorSelectorProps = {
  label: string;
};

export const ColorSelector = (props: ColorSelectorProps): Field => {
  return {
    type: "custom",
    label: props.label,
    render: ({ field, value, onChange }: RenderProps) => {
      return (
        <>
          <FieldLabel
            label={field.label || "Label is undefined"}
            className="ve-mt-2.5"
          >
            <SketchPicker
              disableAlpha={true}
              color={hexToRgb(value)}
              onChange={(colorResult: ColorResult) => {
                onChange(rgbToHex(colorResult.rgb));
              }}
            ></SketchPicker>
          </FieldLabel>
        </>
      );
    },
  };
};

// adapted from: https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function componentToHex(c: number) {
  const hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb: RGBColor) {
  return (
    "#" + componentToHex(rgb.r) + componentToHex(rgb.g) + componentToHex(rgb.b)
  );
}

function hexToRgb(hex: string): RGBColor {
  const parsed = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!parsed || parsed?.length < 3) {
    console.error(`Failed to parse hex color ${hex}`);
    return {
      r: 0,
      g: 0,
      b: 0,
    };
  }

  return {
    r: parseInt(parsed[1], 16),
    g: parseInt(parsed[2], 16),
    b: parseInt(parsed[3], 16),
  };
}
