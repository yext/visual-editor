export type SearchBarHeightProps = "base" | "large" | "extraLarge";
export type SearchBarWidthProps = "small" | "half" | "full";
export type SearchBarAlignProps = "left" | "center" | "right";
export type SearchBarRoundedProps =
  | "none"
  | "small"
  | "medium"
  | "large"
  | "pill";

export interface SearchbarProps {
  styles: {
    showIcon: boolean;
    voiceSearch: boolean;
    isTypingEffect: boolean;
    enableVisualAutoComplete: boolean;
    visualAutoCompleteVerticalKey?: string;
    limit?: number;
    height?: SearchBarHeightProps;
    width?: SearchBarWidthProps;
    align?: SearchBarAlignProps;
    rounded: SearchBarRoundedProps;
  };
  parentData?: {
    showSearchResultsSection: boolean;
  };
}

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
