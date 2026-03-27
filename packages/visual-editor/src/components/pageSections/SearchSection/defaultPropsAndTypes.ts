import { HeadingLevel, ThemeColor } from "../../../utils/themeConfigOptions.ts";

export type VerticalLayout = "Grid" | "Flex" | "Map";
export type CardTypeProp = "Standard" | "Accordion";
export type SearchBarHeightProps = "base" | "large" | "extraLarge";
export type SearchBarWidthProps = "small" | "half" | "full";
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

export interface SearchCtaStyles {
  background?: ThemeColor;
  textColor?: ThemeColor;
}

export interface HeadingStyles {
  headingLevel: HeadingLevel;
  color?: ThemeColor;
}

export interface SearchResultsSlotProps {
  data: { verticals: VerticalConfigProps[] };
  styles: {
    ctaStyles?: SearchCtaStyles;
    activeVerticalColor?: { color?: ThemeColor };
    headingStyles?: HeadingStyles;
  };
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
    ctaStyles: undefined,
    activeVerticalColor: undefined,
    headingStyles: { headingLevel: 3 },
  },
};
