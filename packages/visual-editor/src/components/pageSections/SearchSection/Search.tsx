import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import {
  CloudRegion,
  Environment,
  provideHeadless,
  SearchConfig,
  SearchHeadlessProvider,
} from "@yext/search-headless-react";
import { SearchI18nextProvider } from "@yext/search-ui-react";
import React from "react";
import { SearchBarSlotProps } from "./SearchBarSlot.tsx";
import { SearchResultsSlotProps } from "./SearchResultsSlot.tsx";
//@ts-ignore
import "./search.css";
import { defaultSearchResultsProps } from "./propsAndTypes.ts";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import { msg } from "../../../utils/index.ts";

export interface SearchComponentProps {
  /** @internal */
  slots: {
    SearchBarSlot: Slot;
    SearchResultsSlot: Slot;
  };
}

const locatorFields: Fields<SearchComponentProps> = {
  slots: {
    type: "object",
    objectFields: {
      SearchBarSlot: { type: "slot" },
      SearchResultsSlot: { type: "slot" },
    },
  },
};
const EXPERIENCE_VERSION = "PRODUCTION";

const SearchWrapper: PuckComponent<SearchComponentProps> = ({
  slots,
  puck,
}) => {
  const streamDocument = useDocument();
  const searchConfig: SearchConfig = React.useMemo(
    () => ({
      apiKey: streamDocument?._env?.YEXT_PUBLIC_ADV_SEARCH_API_KEY,
      experienceKey: streamDocument?._env?.YEXT_PUBLIC_ADV_SEARCH_EXP_KEY,
      locale: streamDocument?.locale ?? "en",
      experienceVersion: EXPERIENCE_VERSION,
      cloudRegion: CloudRegion.US,
      environment: Environment.PROD,
    }),
    [
      streamDocument?._env?.YEXT_PUBLIC_ADV_SEARCH_API_KEY,
      streamDocument?._env?.YEXT_PUBLIC_ADV_SEARCH_EXP_KEY,
      streamDocument?.locale,
    ]
  );

  const searcher = React.useMemo(() => {
    if (!searchConfig.apiKey || !searchConfig.experienceKey) {
      return undefined;
    }
    return provideHeadless(searchConfig);
  }, [searchConfig]);

  React.useEffect(() => {
    searcher?.setSessionTrackingEnabled(true);
  }, [searcher]);

  if (!searcher) {
    console.warn(
      "Search Headless could not be initialized. Check API key / Experience key."
    );
    return <></>;
  }

  return (
    <SearchHeadlessProvider searcher={searcher}>
      <SearchI18nextProvider searcher={searcher}>
        <PageSection ref={puck.dragRef} className="">
          <slots.SearchBarSlot style={{ height: "auto" }} allow={[]} />
          <slots.SearchResultsSlot style={{ height: "auto" }} allow={[]} />
        </PageSection>
      </SearchI18nextProvider>
    </SearchHeadlessProvider>
  );
};

export const SearchComponent: ComponentConfig<{
  props: SearchComponentProps;
}> = {
  label: msg("components.searchWithSlots", "Search with Slots"),
  fields: locatorFields,
  defaultProps: {
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
