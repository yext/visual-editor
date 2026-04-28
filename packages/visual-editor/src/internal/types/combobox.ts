import type React from "react";

export type ComboboxOption = {
  label: string;
  value: any;
  color?: string; // Tailwind class for known colors, e.g. "bg-palette-primary-light".
  colorStyle?: React.CSSProperties; // Inline style for user-picked colors.
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
