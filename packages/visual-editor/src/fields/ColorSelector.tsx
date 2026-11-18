import React, { useEffect, useRef, useState } from "react";
import { CustomField, FieldLabel } from "@puckeditor/core";
import * as reactColor from "react-color";
import type { ColorResult } from "react-color";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "../internal/puck/ui/Popover.tsx";
import { pt } from "../utils/i18n/platform.ts";
import {
  parsePickerGradient,
  serializePickerGradient,
} from "../utils/colorPicker.ts";

// Native SSR exposes CommonJS exports on default; bundlers expose named exports.
const SketchPicker =
  reactColor.SketchPicker ??
  (reactColor.default as unknown as typeof reactColor).SketchPicker;

/** Preserve alpha in CSS hex syntax while keeping opaque saved values unchanged. */
export const pickerColorToHex = ({ hex, rgb }: ColorResult): string =>
  rgb.a === undefined || rgb.a === 1
    ? hex
    : `${hex}${Math.round(rgb.a * 255)
        .toString(16)
        .padStart(2, "0")}`;

type RenderProps = Parameters<CustomField<any>["render"]>[0];

export const ColorSelector = ({
  field,
  value,
  onChange,
  allowGradient = false,
}: RenderProps & { allowGradient?: boolean }) => {
  return (
    <FieldLabel
      label={field.label ?? "Color Picker"}
      el="div"
      className="ve-relative ve-mt-2.5"
    >
      <ColorPickerInput
        ariaLabel={field.label || pt("colorPicker.open", "Open color picker")}
        allowGradient={allowGradient}
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
  allowGradient = false,
}: {
  ariaLabel: string;
  value?: string;
  onChange: (color: string) => void;
  allowGradient?: boolean;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [draftColor, setDraftColor] = useState(value ?? "#000000");
  const [selectedStop, setSelectedStop] = useState(0);

  const draftRef = useRef(draftColor);

  const gradient = parsePickerGradient(draftColor);

  useEffect(() => {
    draftRef.current = value ?? "#000000";
    setDraftColor(draftRef.current);
  }, [value]);

  const updateDraft = (next: string, commit = false) => {
    draftRef.current = next;
    setDraftColor(next);
    if (commit && next !== value) {
      onChange(next);
    }
  };

  const handlePickerChange = (colorResult: ColorResult) => {
    const next = pickerColorToHex(colorResult);
    const current = parsePickerGradient(draftRef.current);
    if (current) {
      current.stops[selectedStop] = next;
      updateDraft(serializePickerGradient(current));
    } else {
      updateDraft(next);
    }
  };

  // Read the latest draft when react-color's debounced callback fires. This
  // also avoids restoring a previous stop or angle after another control changes.
  const handlePickerChangeComplete = () => {
    if (draftRef.current !== value) {
      onChange(draftRef.current);
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
        <div className="ve-rounded ve-bg-white ve-text-black ve-shadow-md">
          {allowGradient && (
            <div className="ve-flex ve-flex-col ve-gap-2 ve-p-3">
              <label>
                {pt("colorPicker.fill", "Fill")}
                <select
                  className="ve-ml-2 ve-rounded ve-border ve-p-1"
                  value={gradient?.type ?? "solid"}
                  onChange={(event) => {
                    const type = event.target.value;
                    if (type === "solid") {
                      updateDraft(
                        gradient?.stops[selectedStop] ?? draftColor,
                        true
                      );
                    } else {
                      updateDraft(
                        serializePickerGradient({
                          type: type as "linear" | "radial",
                          angle: gradient?.angle ?? 90,
                          stops: gradient?.stops ?? [draftColor, "#FFFFFF"],
                        }),
                        true
                      );
                    }
                  }}
                >
                  <option value="solid">
                    {pt("colorPicker.solid", "Solid")}
                  </option>
                  <option value="linear">
                    {pt("colorPicker.linear", "Linear gradient")}
                  </option>
                  <option value="radial">
                    {pt("colorPicker.radial", "Radial gradient")}
                  </option>
                </select>
              </label>
              {gradient && (
                <>
                  <div style={{ height: 24, background: draftColor }} />
                  <div
                    className="ve-flex ve-gap-2"
                    role="group"
                    aria-label={pt("colorPicker.stops", "Gradient colors")}
                  >
                    {gradient.stops.map((stop, index) => (
                      <button
                        key={index}
                        type="button"
                        className={`ve-rounded ve-border ve-p-2 ${selectedStop === index ? "ve-ring-2 ve-ring-blue-600" : ""}`}
                        aria-label={
                          index === 0
                            ? pt("colorPicker.start", "Start color")
                            : pt("colorPicker.end", "End color")
                        }
                        aria-pressed={selectedStop === index}
                        onClick={() => setSelectedStop(index)}
                      >
                        <span
                          style={{
                            display: "block",
                            width: 36,
                            height: 14,
                            background: stop,
                          }}
                        />
                      </button>
                    ))}
                  </div>
                  {gradient.type === "linear" && (
                    <label>
                      {pt("colorPicker.angle", "Angle")}
                      <input
                        className="ve-ml-2 ve-w-20 ve-rounded ve-border ve-p-1"
                        type="number"
                        min={0}
                        max={360}
                        value={gradient.angle}
                        onChange={(event) => {
                          const angle = event.target.valueAsNumber;
                          if (Number.isFinite(angle)) {
                            updateDraft(
                              serializePickerGradient({
                                ...gradient,
                                angle: Math.max(
                                  0,
                                  Math.min(360, Math.round(angle))
                                ),
                              }),
                              true
                            );
                          }
                        }}
                      />
                    </label>
                  )}
                </>
              )}
            </div>
          )}
          <SketchPicker
            color={gradient?.stops[selectedStop] ?? draftColor}
            onChange={handlePickerChange}
            onChangeComplete={handlePickerChangeComplete}
            styles={{ default: { picker: { boxShadow: "none" } } }}
          />
        </div>
      </PopoverContent>
    </Popover>
  );
};

const colorPickerStyles = (color: string) => {
  return {
    color: {
      width: "36px",
      height: "14px",
      borderRadius: "2px",
      background: color,
    } as React.CSSProperties,
    swatch: {
      padding: "5px",
      background:
        "repeating-conic-gradient(#ddd 0% 25%, #fff 0% 50%) 0 / 8px 8px",
      border: "none",
      borderRadius: "1px",
      boxShadow: "0 0 0 1px rgba(0,0,0,.1)",
      display: "inline-block",
      cursor: "pointer",
      lineHeight: 0,
    } as React.CSSProperties,
  };
};
