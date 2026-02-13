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

export const searchConfig: SearchConfig = {
  apiKey: "fb73f1bf6a262bc3255bcb938088204f",
  experienceKey: "ukg-fins-rk-test-dont-touch",
  locale: "en",
  experienceVersion: EXPERIENCE_VERSION,
  cloudRegion: CloudRegion.US,
  environment: Environment.PROD,
};

const SearchWrapper: PuckComponent<SearchComponentProps> = ({
  slots,
  puck,
}) => {
  const streamDocument = useDocument();
  const { searchAnalyticsConfig, searcher } = React.useMemo(() => {
    const searchHeadlessConfig = provideHeadless(searchConfig);
    if (searchHeadlessConfig === undefined) {
      return { searchAnalyticsConfig: undefined, searcher: undefined };
    }

    const searchAnalyticsConfig = provideHeadless(searchConfig);
    return {
      searchAnalyticsConfig,
      searcher: provideHeadless(searchConfig),
    };
  }, [streamDocument.id, streamDocument.locale]);

  if (searcher === undefined || searchAnalyticsConfig === undefined) {
    console.warn(
      "Could not create Locator component because Search Headless or Search Analytics config is undefined. Please check your environment variables."
    );
    return <></>;
  }
  searcher.setSessionTrackingEnabled(true);
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
              showIcon: false,
            },
          } satisfies SearchResultsSlotProps,
        },
      ],
    },
  },
  render: (props) => <SearchWrapper {...props} />,
};
