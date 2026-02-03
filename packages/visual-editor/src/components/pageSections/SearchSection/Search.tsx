import { ComponentConfig, Fields, WithPuckProps } from "@puckeditor/core";
import {
  CloudRegion,
  Environment,
  provideHeadless,
  SearchConfig,
  SearchHeadlessProvider,
} from "@yext/search-headless-react";
import { SearchBar, SearchI18nextProvider } from "@yext/search-ui-react";
import React from "react";
import { BasicSelector } from "../../../editor/BasicSelector.tsx";
import { DynamicOptionsSelectorType } from "../../../editor/DynamicOptionsSelector.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { msg } from "../../../utils/index.ts";
import {
  DEFAULT_LOCATOR_RESULT_CARD_PROPS,
  LocatorResultCardFields,
  LocatorResultCardProps,
} from "../../LocatorResultCard.tsx";
export interface SearchProps {
  /**
   * The visual theme for the map tiles, chosen from a predefined list of Mapbox styles.
   * @defaultValue 'mapbox://styles/mapbox/streets-v12'
   */
  mapStyle?: string;

  /**
   * Configuration for the filters available in the locator search experience.
   */
  filters: {
    /**
     * If 'true', displays a button to filter for locations that are currently open.
     * @defaultValue false
     */
    openNowButton: boolean;
    /**
     * If 'true', displays several distance options to filter searches to only locations within
     * a certain radius.
     * @defaultValue false
     */
    showDistanceOptions: boolean;
    /** Which fields are facetable in the search experience */
    facetFields?: DynamicOptionsSelectorType<string>;
  };

  /**
   * The starting location for the map.
   */
  mapStartingLocation?: {
    latitude: string;
    longitude: string;
  };

  /**
   * Props to customize the locator result card component.
   * Controls which fields are displayed and their styling.
   */
  resultCard: LocatorResultCardProps;
}
const locatorFields: Fields<SearchProps> = {
  mapStyle: BasicSelector<SearchProps["mapStyle"]>({
    label: msg("fields.mapStyle", "Map Style"),
    options: [
      {
        label: msg("fields.options.default", "Default"),
        value: "mapbox://styles/mapbox/streets-v12",
      },
      {
        label: msg("fields.options.satellite", "Satellite"),
        value: "mapbox://styles/mapbox/satellite-streets-v12",
      },
      {
        label: msg("fields.options.light", "Light"),
        value: "mapbox://styles/mapbox/light-v11",
      },
      {
        label: msg("fields.options.dark", "Dark"),
        value: "mapbox://styles/mapbox/dark-v11",
      },
      {
        label: msg("fields.options.navigationDay", "Navigation (Day)"),
        value: "mapbox://styles/mapbox/navigation-day-v1",
      },
      {
        label: msg("fields.options.navigationNight", "Navigation (Night)"),
        value: "mapbox://styles/mapbox/navigation-night-v1",
      },
    ],
  }),
  filters: {
    label: msg("fields.filters", "Filters"),
    type: "object",
    objectFields: {
      openNowButton: YextField(
        msg("fields.options.includeOpenNow", "Include Open Now Button"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        }
      ),
      showDistanceOptions: YextField(
        msg("fields.options.showDistanceOptions", "Include Distance Options"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        }
      ),
    },
  },
  mapStartingLocation: YextField(
    msg("fields.options.mapStartingLocation", "Map Starting Location"),
    {
      type: "object",
      objectFields: {
        latitude: YextField(msg("fields.latitude", "Latitude"), {
          type: "text",
        }),
        longitude: YextField(msg("fields.longitude", "Longitude"), {
          type: "text",
        }),
      },
    }
  ),
  resultCard: LocatorResultCardFields,
};
const EXPERIENCE_VERSION = "PRODUCTION";

export const searchConfig: SearchConfig = {
  apiKey: import.meta.env.YEXT_PUBLIC_SEARCH_API_KEY,
  experienceKey: import.meta.env.YEXT_PUBLIC_SEARCH_EXP_KEY,
  locale: "en",
  experienceVersion: EXPERIENCE_VERSION,
  cloudRegion: CloudRegion.US,
  environment: Environment.PROD,
};
const SearchWrapper = (props: WithPuckProps<SearchProps>) => {
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
        {/* <AnalyticsProvider
          apiKey={searchConfig.apiKey}
          {...searchAnalyticsConfig}
        > */}
        <SearchInternal {...props} />
        {/* </AnalyticsProvider> */}
      </SearchI18nextProvider>
    </SearchHeadlessProvider>
  );
};

const SearchInternal = (props: WithPuckProps<SearchProps>) => {
  console.log(props);

  return (
    <>
      <SearchBar
        customCssClasses={{
          focusedOption: "bg-gray-200 hover:bg-gray-200 block",
          option: "hover:bg-gray-100 px-4 py-3",
          inputElement: "rounded-md p-4 h-11",
          searchBarContainer: "border-4 rounded-md",
        }}
      />
    </>
  );
};
/**
 * Available on Search templates.
 */
export const SearchComponent: ComponentConfig<{ props: SearchProps }> = {
  fields: locatorFields,
  defaultProps: {
    filters: {
      openNowButton: false,
      showDistanceOptions: false,
    },
    resultCard: DEFAULT_LOCATOR_RESULT_CARD_PROPS,
  },
  label: msg("components.search", "Search"),
  render: (props) => <SearchWrapper {...props} />,
};
