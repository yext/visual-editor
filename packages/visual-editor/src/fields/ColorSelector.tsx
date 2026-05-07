import React, { useEffect, useState } from "react";
import { CustomField, FieldLabel } from "@puckeditor/core";
import reactColor from "react-color";
import type { Color, ColorResult } from "react-color";
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
    <div className="ve-relative">
      <button
        type="button"
        aria-label={ariaLabel}
        style={fieldStyles.swatch}
        onClick={() => {
          if (isOpen) {
            setIsOpen(false);
            return;
          }

          setIsOpen(true);
        }}
      >
        <div style={fieldStyles.color} />
      </button>
      {isOpen && (
        <div
          style={fieldStyles.popover}
          onClick={(event) => event.stopPropagation()}
          onPointerDown={(event) => event.stopPropagation()}
          onPointerUp={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            aria-label={pt("colorPicker.close", "Close color picker")}
            style={fieldStyles.cover}
            onClick={() => setIsOpen(false)}
          />
          <reactColor.SketchPicker
            disableAlpha={true}
            color={draftColor}
            onChange={handlePickerChange}
            onChangeComplete={handlePickerChangeComplete}
          />
        </div>
      )}
    </div>
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
      zIndex: "2",
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
