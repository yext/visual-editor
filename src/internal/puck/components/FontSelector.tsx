import React, { useState } from "react";
import { FieldLabel } from "@measured/puck";
import { StyleSelectOption } from "../../../utils/themeResolver.ts";
import "../ui/puck.css";
import { ChevronDown } from "lucide-react";

type FontSelectorProps = {
  label: string;
  options: StyleSelectOption[];
  value: string;
  onChange: (value: any) => void;
};

export const FontSelector = ({
  label,
  onChange,
  value,
  options,
}: FontSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleFontChange = (font: string) => {
    onChange(font);
    setIsOpen(false);
  };

  const selectedFontLabel =
    options.find((option) => option.value === value)?.label ?? "Choose a font";

  return (
    <FieldLabel label={label} icon={<ChevronDown size={16} />}>
      <div style={{ position: "relative" }}>
        <button
          onClick={toggleDropdown}
          className="font-select"
          style={{ fontFamily: value }}
        >
          {selectedFontLabel}
        </button>

        {isOpen && (
          <div className="font-select-dropdown">
            {options.map((option) => (
              <button
                key={option.value}
                value={option.value}
                onClick={() => handleFontChange(option.value)}
                style={{
                  fontFamily: option.value,
                  backgroundColor:
                    option.value === value ? "var(--puck-color-grey-09)" : "",
                }}
                className="font-select-option"
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </FieldLabel>
  );
};
