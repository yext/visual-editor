import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import {
  CloudRegion,
  Environment,
  provideHeadless,
  SearchConfig,
  SearchHeadlessProvider,
} from "@yext/search-headless-react";
import {
  DefaultRawDataType,
  SearchI18nextProvider,
  SectionProps,
  StandardCard,
} from "@yext/search-ui-react";
import React from "react";
import { YextField } from "../../../editor/YextField.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { msg } from "../../../utils/index.ts";
import { PageSection } from "../../atoms/pageSection.tsx";
import { SearchBarSlotProps } from "./SearchBarSlot.tsx";

export interface SearchComponentProps {
  /** @internal */
  slots: {
    SearchBarSlot: Slot;
    SearchResultsSlot: Slot;
  };
}

const locatorFields: Fields<SearchComponentProps> = {
  verticals: {
    label: msg("fields.verticals", "Verticals"),
    type: "array",
    arrayFields: {
      label: YextField(msg("fields.label", "Label"), { type: "text" }),

      verticalKey: YextField(msg("fields.verticalKey", "Vertical Key"), {
        type: "text",
      }),

      layout: YextField(msg("fields.layout", "Layout"), {
        type: "radio",
        options: [
          { label: "Grid", value: "Grid" },
          { label: "Flex", value: "Flex" },
          { label: "Map", value: "Map" },
        ],
      }),

      universalLimit: YextField(
        msg("fields.universalLimit", "Universal Limit"),
        { type: "number" }
      ),

      verticalLimit: YextField(msg("fields.verticalLimit", "Vertical Limit"), {
        type: "number",
      }),
    },
    getItemSummary: (item) => item?.label || "Vertical",
  },
  slots: {
    type: "object",
    visible: false,
    objectFields: {
      SearchBarSlot: { type: "slot" },
      SearchResultsSlot: { type: "slot" },
    },
  },
};
const EXPERIENCE_VERSION = "PRODUCTION";

export const searchConfig: SearchConfig = {
  apiKey: "fb73f1bf6a262bc3255bcb938088204f",
  experienceKey: "ukg-fins",
  locale: "en",
  experienceVersion: EXPERIENCE_VERSION,
  cloudRegion: CloudRegion.US,
  environment: Environment.PROD,
};

const SearchWrapper: PuckComponent<SearchComponentProps> = ({
  verticals,
  slots,
  puck,
}) => {
  const verticalConfigMap = React.useMemo(
    () => buildVerticalConfigMap(verticals),
    [verticals]
  );
  console.log(verticalConfigMap);

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
        <PageSection ref={puck.dragRef}>
          <slots.SearchBarSlot style={{ height: "auto" }} allow={[]} />
          <slots.SearchResultsSlot style={{ height: "auto" }} allow={[]} />
        </PageSection>
      </SearchI18nextProvider>
    </SearchHeadlessProvider>
  );
};

export const verticalConfigMap = {
  faq: {
    label: "FAQs",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },
  "financial-professional": {
    label: "Professionals",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },

  locations: {
    label: "Locations",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },

  jobs: {
    label: "Jobs",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },

  events: {
    label: "Events",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },

  product: {
    label: "Products",
    viewAllButton: true,
    CardComponent: StandardCard,
    universalLimit: 3,
    verticalLimit: 5,
  },
};

// const SearchInternal = ({ verticals }: WithPuckProps<SearchComponentProps>) => {
//   const verticalConfigMap = React.useMemo(
//     () => buildVerticalConfigMap(verticals),
//     [verticals]
//   );

//   return (
//     <PageSection>
//       <SearchBar />
//       <UniversalResults verticalConfigMap={verticalConfigMap} />
//     </PageSection>
//   );
// };

const buildVerticalConfigMap = (verticals: VerticalConfig[]) => {
  const map: Record<string, any> = {};

  verticals.forEach((v) => {
    const Section = (props: SectionProps<DefaultRawDataType>) => (
      <SearchLayout layout={v.layout} data={props} />
    );

    map[v.verticalKey] = {
      label: v.label,
      viewAllButton: true,
      SectionComponent: Section,
      CardComponent: StandardCard,
      universalLimit: v.universalLimit,
      verticalLimit: v.verticalLimit,
    };
  });

  return map;
};

const SearchLayout = ({
  layout,
  data: { results, CardComponent },
}: {
  layout: VerticalLayout;
  data: SectionProps<DefaultRawDataType>;
}) => {
  if (!CardComponent) return null;

  const className =
    layout === "Grid"
      ? "grid grid-cols-3 gap-4 w-full"
      : layout === "Flex"
        ? "flex flex-col gap-4 w-full"
        : "flex flex-col w-full";

  return (
    <div className={className}>
      {results.map((r, i) => (
        <CardComponent key={i} result={r} />
      ))}
    </div>
  );
};

export const SearchComponent: ComponentConfig<{
  props: SearchComponentProps;
}> = {
  label: msg("components.searchWithSlots", "Search with Slots"),
  fields: locatorFields,

  defaultProps: {
    verticals: [
      {
        label: "FAQs",
        verticalKey: "faq",
        layout: "Flex",
        universalLimit: 3,
        verticalLimit: 5,
      },
      {
        label: "Products",
        verticalKey: "product",
        layout: "Grid",
        universalLimit: 3,
        verticalLimit: 5,
      },
      {
        label: "Locations",
        verticalKey: "locations",
        layout: "Map",
        universalLimit: 3,
        verticalLimit: 5,
      },
    ],
    slots: {
      SearchBarSlot: [
        {
          type: "SearchBarSlot",
          props: {
            styles: {
              showIcon: false,
            },
          } satisfies SearchBarSlotProps,
        },
      ],
      SearchResultsSlot: [
        {
          type: "SearchBarSlot",
          props: {
            styles: {
              showIcon: false,
            },
          } satisfies SearchBarSlotProps,
        },
      ],
    },
  },
  render: (props) => <SearchWrapper {...props} />,
};
