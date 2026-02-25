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
    headingStyle: {
      headingLevel: 5,
    },
  },
};
