import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  DefaultRawDataType,
  StandardCard,
  StandardSection,
  UniversalResults,
  VerticalConfigMap,
} from "@yext/search-ui-react";
import { YextField } from "../../../editor/YextField.tsx";
import { msg } from "../../../utils/index.ts";
import React from "react";
import { useSearchActions } from "@yext/search-headless-react";
import { FaEllipsisV } from "react-icons/fa";

export interface SearchResultsSlotProps {
  data: { verticals: VerticalConfig[] };
  styles: { showIcon: boolean };
}
type VerticalLayout = "Grid" | "Flex" | "Map";

interface VerticalConfig {
  label: string;
  verticalKey: string;
  layout: VerticalLayout;
  universalLimit: number;
  verticalLimit: number;
}

const defaultSearchResultsProps: SearchResultsSlotProps = {
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
export const verticalConfigMap = {
  faq: {
    label: "FAQs",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },
  "financial-professional": {
    label: "Professionals",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },

  locations: {
    label: "Locations",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },

  jobs: {
    label: "Jobs",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },

  events: {
    label: "Events",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },

  product: {
    label: "Products",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },
};
// const buildVerticalConfigMap = (verticals: VerticalConfig[]) => {
//   const map: Record<string, any> = {};

//   verticals.forEach((v) => {
//     const Section = (props: SectionProps<DefaultRawDataType>) => (
//       <SearchLayout layout={v.layout} data={props} />
//     );

//     map[v.verticalKey] = {
//       label: v.label,
//       viewAllButton: true,
//       SectionComponent: Section,
//       CardComponent: StandardCard,
//       universalLimit: v.universalLimit,
//       verticalLimit: v.verticalLimit,
//     };
//   });

//   return map;
// };

// const SearchLayout = ({
//   layout,
//   data: { results, CardComponent },
// }: {
//   layout: VerticalLayout;
//   data: SectionProps<DefaultRawDataType>;
// }) => {
//   if (!CardComponent) return null;

//   const className =
//     layout === "Grid"
//       ? "grid grid-cols-3 gap-4 w-full"
//       : layout === "Flex"
//         ? "flex flex-col gap-4 w-full"
//         : "flex flex-col w-full";

//   return (
//     <div className={className}>
//       {results.map((r, i) => (
//         <CardComponent key={i} result={r} />
//       ))}
//     </div>
//   );
// };

const SearchResultsSlotFields: Fields<SearchResultsSlotProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      verticals: {
        label: msg("fields.verticals", "Verticals"),
        type: "array",
        arrayFields: {
          label: YextField(msg("fields.label", "Label"), { type: "text" }),

          verticalKey: YextField(msg("fields.verticalKey", "Vertical Key"), {
            type: "text",
          }),

          layout: YextField(msg("fields.layout", "Layout"), {
            type: "radio",
            options: [
              { label: "Grid", value: "Grid" },
              { label: "Flex", value: "Flex" },
              { label: "Map", value: "Map" },
            ],
          }),

          universalLimit: YextField(
            msg("fields.universalLimit", "Universal Limit"),
            { type: "number" }
          ),

          verticalLimit: YextField(
            msg("fields.verticalLimit", "Vertical Limit"),
            {
              type: "number",
            }
          ),
        },
        getItemSummary: (item) => item?.label || "Vertical",
      },
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      showIcon: YextField(msg("fields.showIcon", "Show Icon"), {
        type: "radio",
        options: [
          { label: msg("fields.options.show", "Show"), value: true },
          { label: msg("fields.options.hide", "Hide"), value: false },
        ],
      }),
    },
  }),
};

export const VerticalConfig = [
  {
    label: "All",
    pageType: "universal",
  },
  {
    label: "FAQs",
    verticalKey: "faq",
    pageType: "standard",
    cardType: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },
  {
    label: "Professionals",
    verticalKey: "financial-professional",
    pageType: "grid-cols-3",
    cardType: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },
  {
    label: "Locations",
    verticalKey: "locations",
    pageType: "map",
    cardType: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },
  {
    label: "Jobs",
    verticalKey: "jobs",
    pageType: "standard",
    cardType: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },
  {
    label: "Events",
    verticalKey: "events",
    pageType: "standard",
    cardType: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },
  {
    label: "Products",
    verticalKey: "product",
    pageType: "grid-cols-3",
    cardType: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
    sortFields: ["name"], // ["fieldName, Ascending Label, Descending Label"] examples: ["name, Name (A-Z), Name (Z-A)"] or ["name, Name (A-Z), Name (Z-A)", "price.value, Price (Low - High), Price (High - Low)"]
  },
];

export const UniversalConfig: VerticalConfigMap<
  Record<string, DefaultRawDataType>
> = VerticalConfig.reduce(
  (configMap, item) => {
    if (item.verticalKey) {
      configMap[item.verticalKey] = {
        CardComponent: item.cardType,
        SectionComponent: StandardSection,
        label: item.label,
      };
    }
    return configMap;
  },
  {} as VerticalConfigMap<Record<string, DefaultRawDataType>>
);

const SearchResultsSlotInternal: PuckComponent<SearchResultsSlotProps> = () => {
  const searchActions = useSearchActions();
  React.useEffect(() => {
    searchActions
      .executeUniversalQuery()
      .then((res) => console.log(JSON.stringify(res)));
  }, []);

  // const verticalConfigMap = React.useMemo(
  //   () => buildVerticalConfigMap(verticals),
  //   [verticals]
  // );

  return (
    <div className="relative pt-8">
      <div className="border-b flex justify-start items-center">
        <ul className="flex items-center">
          <li>
            <a className="px-5 pt-1.5 pb-1 tracking-[1.1px] mb-0">FAQ</a>
          </li>
          <li>
            <a className="px-5 pt-1.5 pb-1 tracking-[1.1px] mb-0">FAQ</a>
          </li>
          <li>
            <a className="px-5 pt-1.5 pb-1 tracking-[1.1px] mb-0">FAQ</a>
          </li>
        </ul>
        <div className="ml-auto relative flex">
          <button className="px-5 pt-1.5 pb-1 tracking-[1.1px] visible mb-0 flex gap-2 items-center">
            <FaEllipsisV className="flex my-2.5 mr-[0.4375rem]" />
            More
          </button>
        </div>
      </div>
      <div>
        <UniversalResults
          verticalConfigMap={UniversalConfig}
          customCssClasses={{
            sectionHeaderIconContainer: "hidden",
            sectionHeaderLabel: "!pl-0",
          }}
        />
      </div>
    </div>
  );
  // return <div className="h-18 border-red-900 border">Search Result</div>;
};

export const SearchResultsSlot: ComponentConfig<{
  props: SearchResultsSlotProps;
}> = {
  label: msg("components.SearchResultsSlot", "Search Results Slot"),
  fields: SearchResultsSlotFields,
  defaultProps: defaultSearchResultsProps,
  render: (props) => <SearchResultsSlotInternal {...props} />,
};
