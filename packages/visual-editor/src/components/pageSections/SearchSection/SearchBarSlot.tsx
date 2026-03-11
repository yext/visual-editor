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
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  defaultSearchData,
  SearchBarAlignProps,
  SearchBarHeightProps,
  SearchBarRoundedProps,
  SearchBarWidthProps,
} from "./defaultPropsAndTypes.ts";
import { useEntityPreviewSearcher } from "./searchConfig.ts";
import { useTypingEffect } from "./useTypeEffect.ts";
import {
  createVisualAutocompleteConfig,
  getAlignment,
  getHeight,
  getRounded,
  getWidth,
} from "./utils.tsx";

export interface SearchBarSlotProps {
  styles: {
    showIcon: boolean;
    voiceSearch: boolean;
    isTypingEffect: boolean;
    enableVisualAutoComplete: boolean;
    visualAutoCompleteVerticalKey?: string;
    limit?: number;
    height?: SearchBarHeightProps;
    width?: SearchBarWidthProps;
    align?: SearchBarAlignProps;
    rounded: SearchBarRoundedProps;
  };
  parentData?: {
    showSearchResultsSection: boolean;
  };
}

const searchBarSlotFields: Fields<SearchBarSlotProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      showIcon: YextField(msg("fields.showIcon", "Show Icon"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      voiceSearch: YextField(msg("fields.voiceSearch", "Voice Search"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      isTypingEffect: YextField(msg("fields.isTypingEffect", "Type Effect"), {
        type: "radio",
        options: "SHOW_HIDE",
      }),
      enableVisualAutoComplete: YextField(
        msg("fields.enableVisualAutoComplete", "Enable Visual Autocomplete"),
        {
          type: "radio",
          options: "SHOW_HIDE",
        }
      ),
      rounded: YextField(msg("fields.borderRadius", "Border Radius"), {
        type: "select",
        options: [
          {
            label: msg("fields.none", "None"),
            value: "none",
          },
          {
            label: msg("fields.small", "Small"),
            value: "small",
          },
          {
            label: msg("fields.medium", "Medium"),
            value: "medium",
          },
          {
            label: msg("fields.large", "Large"),
            value: "large",
          },
          {
            label: msg("fields.pill", "Pill"),
            value: "pill",
          },
        ],
      }),
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
      height: YextField(msg("fields.height", "Height"), {
        type: "radio",
        options: [
          {
            label: msg("fields.base", "Base"),
            value: "base",
          },
          {
            label: msg("fields.large", "Large"),
            value: "large",
          },
          {
            label: msg("fields.extraLarge", "Extra Large"),
            value: "extraLarge",
          },
        ],
      }),
      width: YextField(msg("fields.width", "Width"), {
        type: "radio",
        options: [
          {
            label: msg("fields.quarter", "Quarter"),
            value: "quarter",
          },
          {
            label: msg("fields.half", "Half"),
            value: "half",
          },
          {
            label: msg("fields.full", "Full"),
            value: "full",
          },
        ],
      }),
      align: YextField(msg("fields.searchBarAlign", "Search Bar Align"), {
        type: "radio",
        options: ThemeOptions.ALIGNMENT,
      }),
    },
  }),
};

const SearchBarSlotInternal: PuckComponent<SearchBarSlotProps> = ({
  styles: {
    showIcon,
    voiceSearch,
    isTypingEffect,
    enableVisualAutoComplete,
    visualAutoCompleteVerticalKey = "products",
    limit = 3,
    height = "base",
    width = "full",
    align = "left",
    rounded = "none",
  },
  parentData,
  puck,
}) => {
  const document = useDocument();
  const { placeholder } = useTypingEffect({
    env: "PRODUCTION",
    enabled: isTypingEffect,
    locale: document.locale,
  });
  const entityPreviewSearcher = useEntityPreviewSearcher(document);
  const showResults = parentData?.showSearchResultsSection ?? false;
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
  const heightClass = !showResults ? getHeight(height) : "";
  const layoutClasses = !showResults
    ? `${getWidth(width)} ${getAlignment(align)}`
    : "w-full";

  return (
    <div
      className={`relative w-full flex my-2 items-center ${heightClass} ${puck.isEditing ? "pt-4" : ""}`}
    >
      <SearchBar
        visualAutocompleteConfig={visualAutocompleteConfig}
        placeholder={isTypingEffect ? placeholder : "Search here...."}
        customCssClasses={{
          searchBarContainer: `h-16 ${getRounded(rounded)} !mb-0 relative ${
            isTypingEffect ? "isTypingEffect" : ""
          } ${layoutClasses}`,
          searchButtonContainer: `${voiceSearch ? `ml-14 my-auto` : showIcon ? `` : `none`}`,
          searchButton: `${showIcon ? `h-8 w-8` : ``}`,
          inputElement: `text-lg h-12 outline-none focus:outline-none focus:ring-0 focus:border-none px-5 py-2.5 rounded-[inherit]`,
        }}
      />
      {voiceSearch && (
        <FaMicrophone
          className={`h-6 w-6 right-14 ml-auto absolute top-1/2 z-50  -translate-y-1/2`}
        />
      )}
    </div>
  );
};

export const SearchBarSlot: ComponentConfig<{ props: SearchBarSlotProps }> = {
  label: msg("components.searchBarSlot", "SearchBar Slot"),
  fields: searchBarSlotFields,
  defaultProps: defaultSearchData,
  resolveFields: (data) => {
    const updatedFields = resolveDataFromParent(searchBarSlotFields, data);
    const isVisualAutoEnabled = !!data?.props?.styles?.enableVisualAutoComplete;
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

    const showResults =
      data?.props?.parentData?.showSearchResultsSection ?? false;

    const showLayoutControls = !showResults;

    setDeep(
      updatedFields,
      "styles.objectFields.height.visible",
      showLayoutControls
    );
    setDeep(
      updatedFields,
      "styles.objectFields.width.visible",
      showLayoutControls
    );
    setDeep(
      updatedFields,
      "styles.objectFields.align.visible",
      showLayoutControls
    );
    setDeep(updatedFields, "data", false);
    return updatedFields;
  },
  render: (props) => <SearchBarSlotInternal {...props} />,
};
