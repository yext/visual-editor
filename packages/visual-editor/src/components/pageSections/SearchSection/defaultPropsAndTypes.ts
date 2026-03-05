import { SearchBarSlotProps } from "./SearchBarSlot.tsx";

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

export interface VerticalConfigProps {
  label: string;
  verticalKey?: string;
  layout?: VerticalLayout;
  universalLimit?: number;
  verticalLimit?: number;
  pageType?: "universal" | "vertical";
  cardType?: CardTypeProp;
}
export interface SearchResultsSlotProps {
  data: { verticals: VerticalConfigProps[] };
  styles: { enableGenerativeDirectAnswer: boolean };
}

export const defaultSearchResultsProps: SearchResultsSlotProps = {
  data: {
    verticals: [
      {
        label: "Locations",
        verticalKey: "locations",
        layout: "Flex",
        cardType: "Standard",
        universalLimit: 5,
        verticalLimit: 5,
      },
    ],
  },
  styles: {
    enableGenerativeDirectAnswer: false,
  },
};

export const defaultSearchData: SearchBarSlotProps = {
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
