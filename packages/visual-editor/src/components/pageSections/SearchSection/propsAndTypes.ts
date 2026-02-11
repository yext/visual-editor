import { SearchResultsSlotProps } from "./SearchResultsSlot.tsx";

export type VerticalLayout = "Grid" | "Flex" | "Map";
export type CardTypeProp = "Standard" | "accordion";

export interface VerticalConfigProps {
  label: string;
  verticalKey?: string;
  layout?: VerticalLayout;
  universalLimit?: number;
  verticalLimit?: number;
  pageType?: "universal" | "vertical";
  cardType?: CardTypeProp;
}

export const defaultSearchResultsProps: SearchResultsSlotProps = {
  data: {
    verticals: [
      {
        label: "FAQs",
        verticalKey: "faq",
        layout: "Flex",
        cardType: "Standard",
        universalLimit: 3,
        verticalLimit: 5,
      },
    ],
  },
  styles: {
    showIcon: false,
  },
};
