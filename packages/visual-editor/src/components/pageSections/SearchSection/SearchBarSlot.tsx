import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
} from "@puckeditor/core";
import { SearchBar } from "@yext/search-ui-react";
import React from "react";
import { FaMicrophone } from "react-icons/fa";
import { resolveDataFromParent } from "../../../editor/ParentData.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { useEntityPreviewSearcher } from "./searchConfig.ts";
import { useTypingEffect } from "./useTypeEffect.ts";
import { createVisualAutocompleteConfig } from "./utils.tsx";

export interface SearchBarSlotProps {
  styles: {
    showIcon: boolean;
    voiceSearch: boolean;
    isTypingEffect: boolean;
    enableVisualAutoComplete: boolean;
    visualAutoCompleteVerticalKey?: string;
    limit?: number;
  };
  parentData?: {
    showSearchResultsSection: boolean;
  };
}
const defaultSearchBarProps: SearchBarSlotProps = {
  styles: {
    showIcon: false,
    voiceSearch: false,
    isTypingEffect: false,
    enableVisualAutoComplete: false,
    limit: 3,
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
      isTypingEffect: YextField(msg("fields.isTypingEffect", "Type Effect"), {
        type: "radio",
        options: [
          { label: msg("fields.options.show", "Show"), value: true },
          { label: msg("fields.options.hide", "Hide"), value: false },
        ],
      }),
      enableVisualAutoComplete: YextField(
        msg("fields.enableVisualAutoComplete", "Enable Visual Autocomplete"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.show", "Show"), value: true },
            { label: msg("fields.options.hide", "Hide"), value: false },
          ],
        }
      ),
      visualAutoCompleteVerticalKey: YextField(
        msg(
          "fields.visualAutoCompleteVerticalKey",
          "Visual Autocomplete Vertical Key"
        ),
        {
          type: "text",
        }
      ),
      limit: YextField(msg("fields.limit", "Limit"), {
        type: "number",
        min: 0,
        max: 5,
      }),
    },
  },
};

const SearchBarSlotInternal: PuckComponent<SearchBarSlotProps> = ({
  styles: {
    showIcon = false,
    voiceSearch = false,
    isTypingEffect = false,
    enableVisualAutoComplete = false,
    visualAutoCompleteVerticalKey = "products",
    limit = 3,
  },
  // parentData,
}: SearchBarSlotProps) => {
  const document = useDocument();
  const { placeholder } = useTypingEffect({
    env: "PRODUCTION",
    enabled: isTypingEffect,
  });

  const entityPreviewSearcher = useEntityPreviewSearcher(document);
  // const searchActions = useSearchActions();
  const visualAutocompleteConfig = React.useMemo(() => {
    return createVisualAutocompleteConfig(
      enableVisualAutoComplete,
      visualAutoCompleteVerticalKey,
      limit,
      entityPreviewSearcher
    );
  }, [
    enableVisualAutoComplete,
    visualAutoCompleteVerticalKey,
    limit,
    entityPreviewSearcher,
  ]);

  return (
    <div className="relative w-full border h-14 ">
      <SearchBar
        // onSearch={({ query }) => {
        //   const trimmed = (query ?? "").trim();

        //   if (!parentData?.showSearchResultsSection) {
        //     const target = `/search.html${
        //       trimmed ? `?searchTerm=${encodeURIComponent(trimmed)}` : ""
        //     }`;
        //     window.location.href = target;
        //     return;
        //   }

        //   searchActions.setQuery(trimmed);
        //   updateSearchUrl({ vertical: null, searchTerm: trimmed });
        // }}
        visualAutocompleteConfig={visualAutocompleteConfig}
        placeholder={isTypingEffect ? placeholder : "Search here...."}
        customCssClasses={{
          searchBarContainer:
            "w-full h-14 rounded-md [&>div]:border [&>div]:rounded-md !mb-0 relative " +
            (isTypingEffect ? "isTypingEffect" : ""),
          searchButtonContainer: voiceSearch
            ? "ml-14 my-auto"
            : showIcon
              ? ""
              : "none",
          searchButton: showIcon ? "h-8 w-8" : "",
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
  resolveFields: (data) => {
    const updatedFields = resolveDataFromParent(searchBarSlotFields, data);
    const isVisualAutoEnabled = data.props.styles.enableVisualAutoComplete;
    setDeep(
      updatedFields,
      "styles.objectFields.visualAutoCompleteVerticalKey.visible",
      isVisualAutoEnabled
    );
    setDeep(
      updatedFields,
      "styles.objectFields.limit.visible",
      isVisualAutoEnabled
    );
    return updatedFields;
  },
  render: (props) => <SearchBarSlotInternal {...props} />,
};
