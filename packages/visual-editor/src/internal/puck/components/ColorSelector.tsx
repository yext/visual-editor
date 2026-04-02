import React, { useEffect, useState } from "react";
import { CustomField, FieldLabel } from "@puckeditor/core";
import { Color, ColorResult, SketchPicker } from "react-color";

type RenderProps = Parameters<CustomField<any>["render"]>[0];

export const ColorSelector = ({ field, value, onChange }: RenderProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draftColor, setDraftColor] = useState<Color>(value);

  useEffect(() => {
    setDraftColor(value);
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
    <>
      <FieldLabel
        label={field.label || "Label is undefined"}
        el="div"
        className="ve-relative ve-mt-2.5"
      >
        <button
          type="button"
          aria-label={field.label || "Open color picker"}
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
              aria-label="Close color picker"
              style={fieldStyles.cover}
              onClick={() => setIsOpen(false)}
            />
            <SketchPicker
              disableAlpha={true}
              color={draftColor}
              onChange={handlePickerChange}
              onChangeComplete={handlePickerChangeComplete}
            />
          </div>
        )}
      </FieldLabel>
    </>
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
