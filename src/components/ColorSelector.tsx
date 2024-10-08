import React, { useState } from "react";
import { Field, FieldLabel } from "@measured/puck";
import { RenderProps } from "../internal/utils/renderEntityFields.tsx";
import { Color, ColorResult, SketchPicker } from "react-color";

export type ColorSelectorProps = {
  label: string;
};

export const ColorSelector = (props: ColorSelectorProps): Field => {
  return {
    type: "custom",
    label: props.label,
    render: ({ field, value, onChange }: RenderProps) => {
      const [isOpen, setIsOpen] = useState(false);

      const fieldStyles = colorPickerStyles(value);
      return (
        <>
          <FieldLabel
            label={field.label || "Label is undefined"}
            className="ve-mt-2.5"
          >
            <div
              style={fieldStyles.swatch}
              onClick={() => setIsOpen((current) => !current)}
            >
              <div style={fieldStyles.color} />
            </div>
            {isOpen && (
              <div style={fieldStyles.popover}>
                <div
                  style={fieldStyles.cover}
                  onClick={() => setIsOpen(false)}
                />
                <SketchPicker
                  disableAlpha={true}
                  color={value}
                  onChange={(colorResult: ColorResult) => {
                    onChange(colorResult.hex);
                  }}
                />
              </div>
            )}
          </FieldLabel>
        </>
      );
    },
  };
};

const colorPickerStyles = (color: Color) => {
  return {
    color: {
      width: "36px",
      height: "14px",
      borderRadius: "2px",
      background: color,
    } as React.CSSProperties,
    swatch: {
      padding: "5px",
      background: "#fff",
      borderRadius: "1px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
      display: "inline-block",
      cursor: "pointer",
    } as React.CSSProperties,
    popover: {
      position: "absolute",
      zIndex: "2",
    } as React.CSSProperties,
    cover: {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
    } as React.CSSProperties,
  };
};
