import { SearchBarSlotProps } from "./SearchBarSlot.tsx";

export type VerticalLayout = "Grid" | "Flex" | "Map";
export type CardTypeProp = "Standard" | "Accordion";
export type SearchBarHeightProps = "base" | "large" | "extraLarge";
export type SearchBarWidthProps = "quarter" | "half" | "full";
export type SearchBarAlignProps = "left" | "center" | "right";
export type SearchBarRoundedProps =
  | "none"
  | "small"
  | "medium"
  | "large"
  | "pill";

export const UNIT_LABEL = "mi";
export const GRID_LAYOUT_CLASSES =
  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
export const FLEX_LAYOUT_CLASSES = "flex flex-col w-full";

export interface VerticalConfigProps {
  label: string;
  verticalKey?: string;
  layout?: VerticalLayout;
  universalLimit?: number;
  verticalLimit?: number;
  pageType?: "universal" | "vertical";
  cardType?: CardTypeProp;
  enableGenerativeDirectAnswer?: boolean;
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
        enableGenerativeDirectAnswer: false,
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
