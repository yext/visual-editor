import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

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

type ComboboxOption = {
  label: string;
  value: any;
};

type ComboboxProps = {
  defaultValue: ComboboxOption;
  onChange: (value: any) => void;
  options: Array<ComboboxOption>;
};

export const Combobox = ({
  defaultValue,
  onChange,
  options,
}: ComboboxProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="ve-w-full ve-justify-between ve-rounded-sm"
        >
          {defaultValue
            ? options.find((option) => option.value === defaultValue.value)
                ?.label
            : `Select an option`}
          <ChevronsUpDown className="ve-ml-2 ve-h-4 ve-w-4 ve-shrink-0 ve-opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="ve-w-full ve-p-0 ve-bg-opacity-100 ve-bg-white">
        <Command>
          <CommandInput placeholder={`Search`} />
          <CommandList>
            <CommandEmpty>{`No matches found.`}</CommandEmpty>
            <CommandGroup>
              {options.map((option) => (
                <CommandItem
                  key={option.label}
                  value={option.value.toString()}
                  onSelect={(currentValue) => {
                    onChange(
                      options.find((o) => o.value.toString() === currentValue)
                        ?.value ?? options[0]?.value
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "ve-mr-2 ve-h-4 ve-w-4",
                      defaultValue.value === option.value
                        ? "ve-opacity-100"
                        : "ve-opacity-0"
                    )}
                  />
                  {option.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
