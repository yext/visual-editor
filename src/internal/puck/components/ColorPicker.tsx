import React from "react";
import { SketchPicker, RGBColor } from "react-color";
import { PresetColor } from "react-color/lib/components/sketch/Sketch";

type ColorPickerProps = {
  disableAlpha: boolean;
  color: RGBColor;
  setColor: (color: RGBColor) => void;
  presetColors?: PresetColor[] | undefined;
};

const ColorPicker = (props: ColorPickerProps) => {
  const { disableAlpha, presetColors, color, setColor } = props;
  return (
    <SketchPicker
      disableAlpha={disableAlpha}
      presetColors={presetColors}
      color={color}
      onChange={(color) => {
        setColor(color.rgb);
      }}
    ></SketchPicker>
  );
};

export default ColorPicker;
