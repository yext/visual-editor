import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
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

const SearchResultsSlotFields: Fields<SearchResultsSlotProps> = {
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
  const {
    styles: { showIcon = false },
    puck,
  } = props;
  console.log(showIcon);
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
