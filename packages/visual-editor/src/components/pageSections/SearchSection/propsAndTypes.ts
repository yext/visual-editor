import { SearchResultsSlotProps } from "./SearchResultsSlot.tsx";

export type VerticalLayout = "Grid" | "Flex" | "Map";

export interface VerticalConfig {
  label: string;
  verticalKey?: string;
  layout?: VerticalLayout;
  universalLimit?: number;
  verticalLimit?: number;
  pageType?: "universal" | "vertical";
}

export const defaultSearchResultsProps: SearchResultsSlotProps = {
  data: {
    verticals: [
      {
        label: "FAQs",
        verticalKey: "faq",
        layout: "Flex",
        universalLimit: 3,
        verticalLimit: 5,
      },
      {
        label: "Products",
        verticalKey: "product",
        layout: "Grid",
        universalLimit: 3,
        verticalLimit: 5,
      },
      {
        label: "Locations",
        verticalKey: "locations",
        layout: "Map",
        universalLimit: 3,
        verticalLimit: 5,
      },
    ],
  },
  styles: {
    showIcon: false,
  },
};
