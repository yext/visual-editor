import React, { useState } from "react";
import { FieldLabel } from "@measured/puck";
import { StyleSelectOption } from "../../../utils/themeResolver.ts";
import "../ui/puck.css";
import { ChevronDown, Search } from "lucide-react";
import { pt } from "../../../utils/i18n/platform.ts";

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
  const [searchTerm, setSearchTerm] = useState<string>("");

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    if (isOpen) {
      setSearchTerm("");
    }
  };

  const handleFontChange = (font: string) => {
    onChange(font);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedFontLabel =
    options.find((option) => option.value === value)?.label ??
    pt("fonts.choose", "Choose a font");

  return (
    <FieldLabel
      label={label}
      el="div"
      className="ve-relative"
      icon={<ChevronDown size={16} />}
    >
      <button
        onClick={toggleDropdown}
        className="font-select"
        style={{ fontFamily: value }}
      >
        {selectedFontLabel}
      </button>

      {isOpen && (
        <div className="font-select-dropdown">
          <div className="font-select-search">
            <Search size={16} />
            <input
              type="text"
              placeholder={pt("fonts.search", "Search fonts...")}
              className="font-search-input"
              value={searchTerm}
              onChange={handleSearchChange}
            />
          </div>
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option) => (
              <button
                key={option.value}
                value={option.value}
                onClick={(e) => {
                  e.preventDefault();
                  handleFontChange(option.value);
                }}
                style={{
                  fontFamily: option.value,
                  backgroundColor:
                    option.value === value ? "var(--puck-color-grey-09)" : "",
                }}
                className="font-select-option"
              >
                {option.label}
              </button>
            ))
          ) : (
            <div className="font-select-option ve-font-normal">
              {pt("fonts.notFound", "No fonts found.")}
            </div>
          )}
        </div>
      )}
    </FieldLabel>
  );
};
