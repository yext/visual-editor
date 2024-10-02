import React from "react";
import { SketchPicker, RGBColor } from "react-color";
import { PresetColor } from "react-color/lib/components/sketch/Sketch";

interface ColorPickerProps {
  disableAlpha: boolean;
  color: RGBColor;
  setColor: (color: RGBColor) => void;
  presetColors?: PresetColor[] | undefined;
}

const ColorPicker = (props: ColorPickerProps) => {
  return (
    <SketchPicker
      disableAlpha={props.disableAlpha}
      presetColors={props.presetColors}
      color={props.color}
      onChange={(color) => {
        props.setColor(color.rgb);
      }}
    ></SketchPicker>
  );
};

export default ColorPicker;
