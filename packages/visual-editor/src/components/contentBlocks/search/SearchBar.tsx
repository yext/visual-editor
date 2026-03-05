import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
} from "@puckeditor/core";
import { SearchBar, SearchI18nextProvider } from "@yext/search-ui-react";
import React from "react";
import { FaMicrophone } from "react-icons/fa";
import { resolveDataFromParent } from "../../../editor/ParentData.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import { useTypingEffect } from "./useTypeEffect.ts";
import {
  createVisualAutocompleteConfig,
  getAlignment,
  getHeight,
  getRounded,
  getWidth,
} from "./utils.tsx";
import {
  BackgroundStyle,
  ThemeOptions,
} from "../../../utils/themeConfigOptions.ts";
import {
  defaultSearchData,
  SearchBarAlignProps,
  SearchBarHeightProps,
  SearchBarRoundedProps,
  SearchBarWidthProps,
} from "./defaultPropsAndTypes.ts";
import {
  provideHeadless,
  SearchHeadlessProvider,
} from "@yext/search-headless-react";
import { themeManagerCn } from "../../../utils/cn.ts";
import { Body } from "../../atoms/body.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import {
  buildSearchConfigFromDocument,
  useEntityPreviewSearcher,
} from "./searchConfig.ts";

export interface SearchbarProps {
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
    backgroundColor?: BackgroundStyle;
  };
}

const searchBarFields: Fields<SearchbarProps> = {
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
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          hasSearch: true,
          options: "BACKGROUND_COLOR",
        }
      ),
    },
  }),
};

const SearchBarInternal: PuckComponent<SearchbarProps> = ({ styles, puck }) => {
  const { backgroundColor } = styles;
  const streamDocument = useDocument();
  const apiKey = streamDocument?._env?.YEXT_PUBLIC_ADV_SEARCH_API_KEY || "";
  const experienceKey =
    streamDocument?._env?.YEXT_PUBLIC_ADV_SEARCH_EXP_KEY || "";
  if (!apiKey || !experienceKey) {
    if (puck?.isEditing) {
      const missingMessages: string[] = [];

      if (!apiKey) {
        missingMessages.push(
          pt(
            "missingSearchApiKey",
            "Add your Search API key to view this section"
          )
        );
      }
      if (!experienceKey) {
        missingMessages.push(
          pt(
            "missingSearchExperienceKey",
            "Add your Search Experience key to view this section"
          )
        );
      }
      return (
        <div
          className={themeManagerCn(
            "relative h-[100px] w-full bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center py-8 gap-2.5"
          )}
        >
          <Body
            variant="base"
            className="text-gray-500 font-normal text-center whitespace-pre-line"
          >
            {missingMessages.join("\n")}
          </Body>
        </div>
      );
    }

    console.warn("Missing required configuration for Search Component", {
      apiKey: !!apiKey,
      experienceKey: !!experienceKey,
    });

    return <></>;
  }

  const searchConfig = React.useMemo(
    () => buildSearchConfigFromDocument(streamDocument),
    [streamDocument.id, streamDocument.locale]
  );

  const searcher = React.useMemo(() => {
    return provideHeadless(searchConfig);
  }, [searchConfig]);

  React.useEffect(() => {
    if (!searcher) return;
    searcher.setSessionTrackingEnabled(true);
  }, [searcher]);

  if (!searcher) {
    console.warn(
      "Could not create Search component because Search config is invalid."
    );
    return <></>;
  }

  return (
    <SearchHeadlessProvider searcher={searcher}>
      <SearchI18nextProvider searcher={searcher}>
        <PageSection ref={puck.dragRef} background={backgroundColor}>
          <SearchbarInternal styles={styles} puck={puck} />
        </PageSection>
      </SearchI18nextProvider>
    </SearchHeadlessProvider>
  );
};

const SearchbarInternal = ({
  styles,
  puck,
}: {
  styles: SearchbarProps["styles"];
  puck: any;
}) => {
  const {
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
  } = styles;

  const document = useDocument();

  const { placeholder } = useTypingEffect({
    env: "PRODUCTION",
    enabled: isTypingEffect,
  });

  const entityPreviewSearcher = useEntityPreviewSearcher(document);

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

  const heightClass = getHeight(height);

  const layoutClasses = `${getWidth(width)} ${getAlignment(align)}`;

  return (
    <div
      className={`relative !w-full flex my-2 items-center ${heightClass} ${
        puck?.isEditing ? "pt-4" : ""
      }`}
    >
      <SearchBar
        onSearch={({ query }) => {
          const trimmed = (query ?? "").trim();
          const target = `/search.html${
            trimmed ? `?searchTerm=${encodeURIComponent(trimmed)}` : ""
          }`;
          window.location.href = target;
        }}
        visualAutocompleteConfig={visualAutocompleteConfig}
        placeholder={isTypingEffect ? placeholder : "Search here...."}
        customCssClasses={{
          searchBarContainer: `h-16 ${getRounded(rounded)} !mb-0 relative ${
            isTypingEffect ? "isTypingEffect" : ""
          } ${layoutClasses}`,
          searchButtonContainer: `${
            voiceSearch ? "ml-14 my-auto" : showIcon ? "" : "none"
          }`,
          searchButton: `${showIcon ? "h-8 w-8" : ""}`,
          inputElement:
            "text-lg h-12 outline-none focus:outline-none focus:ring-0 focus:border-none px-5 py-2.5 rounded-[inherit]",
        }}
      />

      {voiceSearch && (
        <FaMicrophone className="h-6 w-6 right-14 ml-auto absolute top-1/2 z-50 -translate-y-1/2" />
      )}
    </div>
  );
};

export const SearchbarComponent: ComponentConfig<{ props: SearchbarProps }> = {
  label: msg("components.searchBar", "Searchbar "),
  fields: searchBarFields,
  defaultProps: defaultSearchData,
  resolveFields: (data) => {
    const updatedFields = resolveDataFromParent(searchBarFields, data);
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
    return updatedFields;
  },
  render: (props) => <SearchBarInternal {...props} />,
};
