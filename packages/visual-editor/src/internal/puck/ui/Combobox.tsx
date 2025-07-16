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
import { pt } from "../../../utils/i18nPlatform.ts";

export type ComboboxOption = {
  label: string;
  value: any;
  color?: string; // ex. "bg-palette-primary-light"
};

export type ComboboxOptionGroup = {
  title?: string;
  description?: string;
  options: ComboboxOption[];
};

type ComboboxProps = {
  selectedOption: ComboboxOption;
  onChange: (value: string) => void;
  optionGroups: Array<ComboboxOptionGroup>;
  disabled?: boolean;
  disableSearch?: boolean;
};

export const Combobox = ({
  selectedOption,
  onChange,
  optionGroups,
  disabled,
  disableSearch,
}: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="puckSelect"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
        >
          {selectedOption ? (
            <div className="ve-flex ve-items-center">
              <ColorIndicator color={selectedOption.color} />
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
                      <CommandItem
                        className="ve-cursor-pointer"
                        key={option.label}
                        value={option.value}
                        onSelect={() => {
                          onChange(option.value);
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "ve-mr-2 ve-h-4 ve-w-4",
                            selectedOption.value === option.value
                              ? "ve-opacity-100"
                              : "ve-opacity-0"
                          )}
                        />
                        <ColorIndicator color={option.color} />
                        {option.label}
                      </CommandItem>
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

const ColorIndicator = ({ color }: { color?: string }) => {
  if (!color) {
    return;
  }
  return (
    <div
      className={cn(
        "ve-ring-1 ve-ring-inset ve-ring-ring ve-w-3 ve-h-3 ve-rounded-sm ve-mr-2 components",
        color
      )}
    />
  );
};
