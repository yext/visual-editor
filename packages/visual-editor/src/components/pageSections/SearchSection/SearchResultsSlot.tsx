import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { StandardCard } from "@yext/search-ui-react";
import { YextField } from "../../../editor/YextField.tsx";
import { msg } from "../../../utils/index.ts";

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

const SearchResultsSlotInternal: PuckComponent<SearchResultsSlotProps> = (
  props
) => {
  const { puck } = props;
  // const verticalConfigMap = React.useMemo(
  //   () => buildVerticalConfigMap(verticals),
  //   [verticals]
  // );

  if (puck.isEditing) {
    return (
      <div className="h-12 border border-dashed text-center flex items-center justify-center">
        Search Bar
      </div>
    );
  }
  return <div className="h-18 border-red-900 border">Search Result</div>;
};

export const SearchResultsSlot: ComponentConfig<{
  props: SearchResultsSlotProps;
}> = {
  label: msg("components.SearchResultsSlot", "Search Results Slot"),
  fields: SearchResultsSlotFields,
  defaultProps: defaultSearchResultsProps,
  render: (props) => <SearchResultsSlotInternal {...props} />,
};
