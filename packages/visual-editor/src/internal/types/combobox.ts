import type React from "react";

export type ComboboxOption = {
  label: string;
  value: any;
  color?: string; // ex. "bg-palette-primary-light"
  colorStyle?: React.CSSProperties;
  icon?: string;
};

export type ComboboxOptionGroup = {
  title?: string;
  description?: string;
  options: ComboboxOption[];
};

export type ComboboxProps = {
  selectedOption: ComboboxOption;
  onChange: (value: any) => void;
  optionGroups: Array<ComboboxOptionGroup>;
  disabled?: boolean;
  disableSearch?: boolean;
  customTrigger?: React.ReactNode;
};
