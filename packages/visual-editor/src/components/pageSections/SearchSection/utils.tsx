import { UniversalLimit } from "@yext/search-headless-react";
import { VerticalConfigMap, DefaultRawDataType } from "@yext/search-ui-react";
import Cards from "./Cards.tsx";
import { LayoutSection } from "./LayoutSections.tsx";
import { VerticalLayout, CardTypeProp } from "./propsAndTypes.ts";

export const buildVerticalConfigMap = (
  verticals: {
    label: string;
    verticalKey?: string;
    layout?: VerticalLayout;
    cardType?: CardTypeProp;
  }[]
): VerticalConfigMap<Record<string, DefaultRawDataType>> => {
  return verticals.reduce(
    (acc, v) => {
      if (!v.verticalKey) return acc;
      const layoutType = v.layout ?? "Grid";
      const cardType = v.cardType ?? "Standard";
      acc[v.verticalKey] = {
        label: v.label,
        viewAllButton: true,
        SectionComponent: (props) => (
          <LayoutSection {...props} layoutType={layoutType} />
        ),
        CardComponent: (props) => <Cards {...props} cardType={cardType} />,
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

// export const buildVerticalConfigMap = (
//   verticals: {
//     label: string;
//     verticalKey?: string;
//     layout?: VerticalLayout;
//     cardType?: CardTypeProp;
//   }[]
// ): VerticalConfigMap<Record<string, DefaultRawDataType>> => {
//   return verticals.reduce(
//     (acc, v) => {
//       if (!v.verticalKey) return acc;

//       const layoutType = v.layout ?? "Grid";
//       const cardType = v.cardType ?? "Standard";

//       // Stable Section component per vertical
//       const SectionComponent: React.FC<SectionProps<DefaultRawDataType>> = (
//         props
//       ) => <LayoutSection {...props} layoutType={layoutType} />;

//       // Stable Card component per vertical
//       const CardComponent: React.FC<CardProps<DefaultRawDataType>> = (
//         props
//       ) => <Cards {...props} cardType={cardType} />;

//       acc[v.verticalKey] = {
//         label: v.label,
//         viewAllButton: true,
//         SectionComponent,
//         CardComponent,
//       };

//       return acc;
//     },
//     {} as VerticalConfigMap<Record<string, DefaultRawDataType>>
//   );
// };
