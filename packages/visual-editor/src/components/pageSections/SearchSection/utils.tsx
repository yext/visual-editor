import { UniversalLimit } from "@yext/search-headless-react";
import {
  DefaultRawDataType,
  StandardCard,
  VerticalConfigMap,
} from "@yext/search-ui-react";
import { LayoutSection } from "./LayoutSections.tsx";
import { VerticalLayout } from "./propsAndTypes.ts";

export const buildVerticalConfigMap = (
  verticals: {
    label: string;
    verticalKey?: string;
    layout?: VerticalLayout;
  }[]
): VerticalConfigMap<Record<string, DefaultRawDataType>> => {
  return verticals.reduce(
    (acc, v) => {
      if (!v.verticalKey) return acc;

      acc[v.verticalKey] = {
        label: v.label,
        viewAllButton: true,
        SectionComponent: (props) => (
          <LayoutSection {...props} layoutType={v.layout ?? "Grid"} />
        ),
        CardComponent: StandardCard,
      };

      return acc;
    },
    {} as VerticalConfigMap<Record<string, DefaultRawDataType>>
  );
};

export const buildUniversalLimit = (
  verticals: {
    label: string;
    verticalKey?: string;
    universalLimit?: number;
  }[]
): UniversalLimit => {
  return verticals.reduce<UniversalLimit>((acc, v) => {
    if (!v.verticalKey || typeof v.universalLimit !== "number") {
      return acc;
    }

    acc[v.verticalKey] = v.universalLimit;
    return acc;
  }, {});
};

const isValidVertical = (v: any): boolean => {
  if (!v || typeof v !== "object") return false;
  if (v.pageType === "universal") {
    return typeof v.label === "string";
  }
  return (
    typeof v.label === "string" &&
    typeof v.verticalKey === "string" &&
    (v.layout === "Grid" || v.layout === "Flex" || v.layout === "Map") &&
    typeof v.universalLimit === "number" &&
    typeof v.verticalLimit === "number"
  );
};

export const isValidVerticalConfig = (verticals: any[]): boolean => {
  return (
    Array.isArray(verticals) &&
    verticals.length > 0 &&
    verticals.every(isValidVertical)
  );
};
