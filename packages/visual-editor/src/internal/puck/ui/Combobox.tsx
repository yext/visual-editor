import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "../../../utils/cn.ts";
import { Button } from "./button.tsx";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./Command.tsx";
import { Popover, PopoverContent, PopoverTrigger } from "./Popover.tsx";
import { pt } from "../../../utils/i18n/platform.ts";
import { convertComputedStyleColorToHex } from "../../../utils/colors.ts";
import { ComboboxProps } from "../../types/combobox.ts";

export const Combobox = ({
  selectedOption,
  onChange,
  optionGroups,
  disabled,
  disableSearch,
  customTrigger,
}: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        {customTrigger ? (
          customTrigger
        ) : (
          <Button
            variant="puckSelect"
            role="combobox"
            aria-expanded={open}
            disabled={disabled}
          >
            {selectedOption ? (
              <div className="ve-flex ve-items-center">
                {selectedOption.icon && (
                  <img
                    src={selectedOption.icon}
                    alt=""
                    aria-hidden="true"
                    className="ve-w-4 ve-h-4 ve-mr-2"
                  />
                )}
                <ColorIndicator
                  color={selectedOption.color}
                  colorStyle={selectedOption.colorStyle}
                />
                <div
                  className="ve-pr-2 ve-truncate ve-text-left"
                  title={selectedOption?.label}
                >
                  {selectedOption?.label}
                </div>
              </div>
            ) : (
              <div
                className="ve-pr-2 ve-truncate ve-text-left"
                title={pt("selectAnOption", "Select an option")}
              >
                {pt("selectAnOption", "Select an option")}
              </div>
            )}
          </Button>
        )}
      </PopoverTrigger>
      <PopoverContent className="ve-w-full ve-p-0 ve-bg-opacity-100 ve-bg-white ve-min-w-[--radix-popover-trigger-width]">
        <Command>
          {!disableSearch && (
            <CommandInput placeholder={pt("search", "Search")} />
          )}
          <CommandList>
            <CommandEmpty>
              {pt("noMatchesFound", "No matches found.")}
            </CommandEmpty>
            {optionGroups.map((group, idx) => {
              return (
                <CommandGroup
                  heading={group.title && pt(group.title)}
                  key={`group${idx}`}
                >
                  {group.description && (
                    <p
                      data-cmdk-group-subheading
                      className="ve-w-[--radix-popover-trigger-width]"
                    >
                      {pt(group.description)}
                    </p>
                  )}
                  {group.options.map((option) => {
                    return (
                      <ComboboxCommandItem
                        className="ve-cursor-pointer"
                        key={option.label}
                        onSelect={() => {
                          onChange(option.value);
                          setOpen(false);
                        }}
                        option={option}
                        selected={selectedOption.value === option.value}
                      />
                    );
                  })}
                </CommandGroup>
              );
            })}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

const ComboboxCommandItem = ({
  className,
  onSelect,
  option,
  selected,
}: {
  className?: string;
  onSelect: () => void;
  option: ComboboxProps["optionGroups"][number]["options"][number];
  selected: boolean;
}) => {
  const [colorHexValue, setColorHexValue] = React.useState<string | undefined>(
    undefined
  );

  return (
    <CommandItem className={className} value={option.value} onSelect={onSelect}>
      <Check
        className={cn(
          "ve-mr-2 ve-h-4 ve-w-4",
          selected ? "ve-opacity-100" : "ve-opacity-0"
        )}
      />
      <ColorIndicator
        color={option.color}
        colorStyle={option.colorStyle}
        setHexValue={setColorHexValue}
      />
      {option.icon && (
        <img
          src={option.icon}
          alt=""
          aria-hidden="true"
          className="ve-w-4 ve-h-4 ve-mr-2"
        />
      )}
      <div className="ve-flex ve-flex-col ve-gap-0.5">
        {option.label}
        {colorHexValue && (
          <span className="ve-text-sm ve-text-[#5B5D60]">{colorHexValue}</span>
        )}
      </div>
    </CommandItem>
  );
};

const ColorIndicator = ({
  color,
  colorStyle,
  setHexValue,
}: {
  color?: string;
  colorStyle?: React.CSSProperties;
  setHexValue?: (s: string) => void;
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  let colorHexValue = undefined;

  React.useEffect(() => {
    if ((color || colorStyle) && ref.current && setHexValue) {
      colorHexValue = convertComputedStyleColorToHex(
        window.getComputedStyle(ref.current).backgroundColor
      );
      setHexValue(colorHexValue);
    }
  }, [color, colorStyle, setHexValue]);

  if (!color && !colorStyle) {
    return null;
  }

  return (
    <div
      ref={ref}
      style={colorStyle}
      className={cn(
        "ve-ring-1 ve-ring-inset ve-ring-ring ve-w-5 ve-h-5 ve-rounded-sm ve-mr-2 components",
        color
      )}
    />
  );
};
