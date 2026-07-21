import React, { useEffect, useState } from "react";
import { CustomField, FieldLabel } from "@puckeditor/core";
import { Color, ColorResult, SketchPicker } from "react-color";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../internal/puck/ui/Popover.tsx";
import { pt } from "../utils/i18n/platform.ts";

type RenderProps = Parameters<CustomField<any>["render"]>[0];

export const ColorSelector = ({ field, value, onChange }: RenderProps) => {
  return (
    <FieldLabel
      label={field.label ?? "Color Picker"}
      el="div"
      className="ve-relative ve-mt-2.5"
    >
      <ColorPickerInput
        ariaLabel={field.label || pt("colorPicker.open", "Open color picker")}
        value={value}
        onChange={onChange}
      />
    </FieldLabel>
  );
};

export const ColorPickerInput = ({
  ariaLabel,
  value,
  onChange,
}: {
  ariaLabel: string;
  value?: Color;
  onChange: (color: string) => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draftColor, setDraftColor] = useState<Color>(value ?? "#000000");

  useEffect(() => {
    setDraftColor(value ?? "#000000");
  }, [value]);

  const handlePickerChange = (colorResult: ColorResult) => {
    setDraftColor(colorResult.hex);
  };

  const handlePickerChangeComplete = (colorResult: ColorResult) => {
    const nextColor = colorResult.hex;
    setDraftColor(nextColor);
    if (nextColor !== value) {
      onChange(nextColor);
    }
  };

  const fieldStyles = colorPickerStyles(draftColor);
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <button type="button" aria-label={ariaLabel} style={fieldStyles.swatch}>
          <div style={fieldStyles.color} />
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={8}
        className="ve-w-auto ve-border-0 ve-bg-transparent ve-p-0 ve-shadow-none"
      >
        <SketchPicker
          disableAlpha={true}
          color={draftColor}
          onChange={handlePickerChange}
          onChangeComplete={handlePickerChangeComplete}
        />
      </PopoverContent>
    </Popover>
  );
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
      border: "none",
      borderRadius: "1px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
      display: "inline-block",
      cursor: "pointer",
      lineHeight: 0,
    } as React.CSSProperties,
    popover: {
      position: "absolute",
      zIndex: "5",
    } as React.CSSProperties,
    cover: {
      position: "fixed",
      top: "0px",
      right: "0px",
      bottom: "0px",
      left: "0px",
      border: "none",
      background: "transparent",
      padding: "0px",
      cursor: "default",
    } as React.CSSProperties,
  };
};
