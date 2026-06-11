import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { msg } from "../../utils/i18n/platform.ts";
import { ThemeOptions } from "../../utils/themeConfigOptions.ts";

type SearchbarStyleProps = {
  showIcon: boolean;
  voiceSearch: boolean;
  isTypingEffect: boolean;
  enableVisualAutoComplete: boolean;
  visualAutoCompleteVerticalKey?: string;
  limit?: number;
  width?: "small" | "half" | "full";
  align?: "start" | "center" | "end";
  rounded: string;
};

type SearchbarProps = {
  styles: SearchbarStyleProps;
};

const searchbarFieldFields: Fields<SearchbarProps> = {
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      showIcon: {
        label: msg("fields.showIcon", "Show Icon"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      voiceSearch: {
        label: msg("fields.voiceSearch", "Voice Search"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      isTypingEffect: {
        label: msg("fields.isTypingEffect", "Type Effect"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      enableVisualAutoComplete: {
        label: msg(
          "fields.enableVisualAutoComplete",
          "Enable Visual Autocomplete"
        ),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      rounded: {
        label: msg("fields.borderRadius", "Border Radius"),
        type: "radio",
        options: ThemeOptions.BUTTON_BORDER_RADIUS,
      },
      visualAutoCompleteVerticalKey: {
        label: msg(
          "fields.visualAutoCompleteVerticalKey",
          "Visual Autocomplete Vertical Key"
        ),
        type: "text",
      },
      limit: {
        label: msg("fields.limit", "Limit"),
        type: "number",
        min: 0,
        max: 5,
      },
      width: {
        label: msg("fields.width", "Width"),
        type: "radio",
        options: [
          {
            label: msg("fields.small", "Small"),
            value: "small",
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
      },
      align: {
        label: msg("fields.searchBarAlign", "Search Bar Align"),
        type: "radio",
        options: ThemeOptions.ALIGNMENT,
      },
    },
  },
};

const SearchbarFieldInternal: PuckComponent<SearchbarProps> = () =>
  //   {
  //   styles,
  //   puck,
  // }
  {
    return <></>;
  };

export const Searchbar: ComponentConfig<{
  props: SearchbarProps;
}> = {
  label: msg("components.searchbar", "Searchbar"),
  fields: searchbarFieldFields,
  defaultProps: {
    styles: {
      showIcon: false,
      voiceSearch: false,
      isTypingEffect: false,
      enableVisualAutoComplete: false,
      visualAutoCompleteVerticalKey: undefined,
      limit: 0,
      width: "full",
      align: "center",
      rounded: "pill",
    },
  },
  //   resolveFields: (data) => {
  //     const updatedFields = resolveDataFromParent(searchbarFieldFields, data);
  //     const isVisualAutoEnabled = !!data?.props?.styles?.enableVisualAutoComplete;
  //     setDeep(
  //       updatedFields,
  //       "styles.objectFields.visualAutoCompleteVerticalKey.visible",
  //       isVisualAutoEnabled
  //     );
  //     setDeep(
  //       updatedFields,
  //       "styles.objectFields.limit.visible",
  //       isVisualAutoEnabled
  //     );

  //     const showResults =
  //       data?.props?.parentData?.showSearchResultsSection ?? false;

  //     const showLayoutControls = !showResults;

  //     setDeep(
  //       updatedFields,
  //       "styles.objectFields.height.visible",
  //       showLayoutControls
  //     );
  //     setDeep(
  //       updatedFields,
  //       "styles.objectFields.width.visible",
  //       showLayoutControls
  //     );
  //     setDeep(
  //       updatedFields,
  //       "styles.objectFields.align.visible",
  //       showLayoutControls
  //     );
  //     setDeep(updatedFields, "data", false);
  //     return updatedFields;
  //   },
  render: (props) => <SearchbarFieldInternal {...props} />,
};
