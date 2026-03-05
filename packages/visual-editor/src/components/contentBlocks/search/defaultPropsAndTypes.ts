import { SearchbarProps } from "./SearchBar.tsx";

export type VerticalLayout = "Grid" | "Flex" | "Map";
export type CardTypeProp = "Standard" | "accordion";
export type SearchBarHeightProps = "base" | "large" | "extraLarge";
export type SearchBarWidthProps = "quarter" | "half" | "full";
export type SearchBarAlignProps = "left" | "center" | "right";
export type SearchBarRoundedProps =
  | "none"
  | "small"
  | "medium"
  | "large"
  | "pill";

export const defaultSearchData: SearchbarProps = {
  styles: {
    showIcon: false,
    voiceSearch: false,
    isTypingEffect: false,
    enableVisualAutoComplete: false,
    limit: 3,
    height: "base",
    width: "full",
    rounded: "none",
    align: "left",
  },
};
