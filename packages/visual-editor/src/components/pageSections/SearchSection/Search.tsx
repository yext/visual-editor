import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import {
  provideHeadless,
  SearchHeadlessProvider,
} from "@yext/search-headless-react";
import { SearchI18nextProvider } from "@yext/search-ui-react";
import React from "react";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { Body } from "../../atoms/body.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import { SearchBarSlotProps } from "./SearchBarSlot.tsx";
import {
  defaultSearchResultsProps,
  SearchResultsSlotProps,
} from "./defaultPropsAndTypes.ts";
import "./search.css";
import { buildSearchConfigFromDocument } from "./searchConfig.ts";
import { themeManagerCn } from "../../../utils/cn.ts";
import { msg, pt } from "../../../utils/i18n/platform.ts";
import { YextField } from "../../../editor/YextField.tsx";

export interface SearchComponentProps {
  showSearchResultsSection: boolean;
  /** @internal */
  slots: {
    SearchBarSlot: Slot;
    SearchResultsSlot: Slot;
  };
}

const searchFields: Fields<SearchComponentProps> = {
  showSearchResultsSection: YextField(
    msg("fields.showSearchResultsSection", "Show Search Results Section"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
  slots: {
    type: "object",
    objectFields: {
      SearchBarSlot: { type: "slot" },
      SearchResultsSlot: { type: "slot" },
    },
    visible: false,
  },
};

const SearchWrapper: PuckComponent<SearchComponentProps> = ({
  showSearchResultsSection,
  slots,
  puck,
}) => {
  const streamDocument = useDocument();
  const apiKey = streamDocument?._env?.YEXT_PUBLIC_ADV_SEARCH_API_KEY;
  const experienceKey = streamDocument?._env?.YEXT_PUBLIC_ADV_SEARCH_EXP_KEY;
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
        <PageSection ref={puck.dragRef} className="">
          <slots.SearchBarSlot style={{ height: "auto" }} allow={[]} />
          {showSearchResultsSection && (
            <slots.SearchResultsSlot style={{ height: "auto" }} allow={[]} />
          )}
        </PageSection>
      </SearchI18nextProvider>
    </SearchHeadlessProvider>
  );
};

export const SearchComponent: ComponentConfig<{
  props: SearchComponentProps;
}> = {
  label: msg("components.searchWithSlots", "Search with Slots"),
  fields: searchFields,
  defaultProps: {
    showSearchResultsSection: false,
    slots: {
      SearchBarSlot: [
        {
          type: "SearchBarSlot",
          props: {
            styles: {
              showIcon: false,
              voiceSearch: false,
              isTypingEffect: false,
              enableVisualAutoComplete: false,
            },
            parentData: {
              showSearchResultsSection: false,
            },
          } satisfies SearchBarSlotProps,
        },
      ],
      SearchResultsSlot: [
        {
          type: "SearchResultsSlot",
          props: {
            data: {
              verticals: [
                {
                  label: "All",
                  pageType: "universal",
                },
                defaultSearchResultsProps.data.verticals[0],
              ],
            },
            styles: {
              enableGenerativeDirectAnswer: false,
            },
          } satisfies SearchResultsSlotProps,
        },
      ],
    },
  },
  render: (props) => <SearchWrapper {...props} />,
};
