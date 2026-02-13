import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { YextField } from "../../../editor/YextField.tsx";
import { msg } from "../../../utils/index.ts";
import { SearchBar } from "@yext/search-ui-react";
import { FaMicrophone } from "react-icons/fa";

export interface SearchBarSlotProps {
  styles: { showIcon: boolean; voiceSearch: boolean };
}
const defaultSearchBarProps: SearchBarSlotProps = {
  styles: {
    showIcon: false,
    voiceSearch: false,
  },
};

const searchBarSlotFields: Fields<SearchBarSlotProps> = {
  styles: {
    type: "object",
    objectFields: {
      showIcon: YextField(msg("fields.showIcon", "Show Icon"), {
        type: "radio",
        options: [
          { label: msg("fields.options.show", "Show"), value: true },
          { label: msg("fields.options.hide", "Hide"), value: false },
        ],
      }),
      voiceSearch: YextField(msg("fields.voiceSearch", "Voice Search"), {
        type: "radio",
        options: [
          { label: msg("fields.options.show", "Show"), value: true },
          { label: msg("fields.options.hide", "Hide"), value: false },
        ],
      }),
    },
  },
};

const SearchBarSlotInternal: PuckComponent<SearchBarSlotProps> = ({
  styles: { showIcon = false, voiceSearch = false },
}: SearchBarSlotProps) => {
  console.log(showIcon);

  return (
    <div className="relative w-full border h-14 ">
      <SearchBar
        placeholder="Search here"
        customCssClasses={{
          searchBarContainer:
            "w-full h-14 rounded-md [&>div]:border [&>div]:border-[#137350] [&>div]:rounded-md !mb-0 relative",
          searchButtonContainer: voiceSearch ? "ml-14 my-auto" : "",
          searchButton: "h-8 w-8 ",
          inputElement:
            "text-lg h-14 outline-none focus:outline-none focus:ring-0 focus:border-none px-5 py-2.5",
        }}
      />
      {voiceSearch && (
        <FaMicrophone className="h-6 w-6 right-14 ml-auto absolute top-1/2 z-50  -translate-y-1/2" />
      )}
    </div>
  );
};

export const SearchBarSlot: ComponentConfig<{ props: SearchBarSlotProps }> = {
  label: msg("components.searchBarSlot", "SearchBar Slot"),
  fields: searchBarSlotFields,
  defaultProps: defaultSearchBarProps,
  render: (props) => <SearchBarSlotInternal {...props} />,
};
