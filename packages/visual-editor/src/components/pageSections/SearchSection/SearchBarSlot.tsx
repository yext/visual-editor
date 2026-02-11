import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { YextField } from "../../../editor/YextField.tsx";
import { msg } from "../../../utils/index.ts";

export interface SearchBarSlotProps {
  styles: { showIcon: boolean };
}
const defaultSearchBarProps: SearchBarSlotProps = {
  styles: {
    showIcon: false,
  },
};

const searchBarSlotFields: Fields<SearchBarSlotProps> = {
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

const SearchBarSlotInternal: PuckComponent<SearchBarSlotProps> = (props) => {
  const { puck } = props;
  if (puck.isEditing) {
    return (
      <div className="h-12 border border-dashed text-center flex items-center justify-center">
        Search Bar
      </div>
    );
  }
  return <div className="h-18 border-red-900 border">Search Slot</div>;
};

export const SearchBarSlot: ComponentConfig<{ props: SearchBarSlotProps }> = {
  label: msg("components.searchBarSlot", "SearchBar Slot"),
  fields: searchBarSlotFields,
  defaultProps: defaultSearchBarProps,
  render: (props) => <SearchBarSlotInternal {...props} />,
};
