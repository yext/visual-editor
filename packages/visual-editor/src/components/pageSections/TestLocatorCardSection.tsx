import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  YextField,
  msg,
  VisibilityWrapper,
  backgroundColors,
  Background,
  Heading,
  useDocument,
} from "@yext/visual-editor";
import {
  ComponentConfig,
  Fields,
  WithPuckProps,
  Slot,
  ComponentDataOptionalId,
} from "@measured/puck";
import { CardProps, Coordinate } from "@yext/search-ui-react";
import { AddressType, HoursType } from "@yext/pages-components";
import {
  LockedCategoryProps,
  LockedCategoryComponents,
} from "../categories/LockedCategory";

export type Components = LockedCategoryProps;

const contentBlocks = {
  ...LockedCategoryComponents,
};

async function createComponent<T extends keyof Components>(
  component: T,
  props?: Partial<Components[T]>
): Promise<ComponentDataOptionalId<Components[T]>> {
  return {
    type: component,
    props: {
      ...contentBlocks[component].defaultProps,
      ...props,
    },
  } as ComponentDataOptionalId<Components[T]>;
}

export interface ResultsCardStyles {
  /**
   * Whether to show the result index number.
   * @defaultValue true
   */
  showResultIndex: boolean;

  /**
   * Whether to show the distance.
   * @defaultValue true
   */
  showDistance: boolean;
}

export interface TestLocatorCardSectionStyles {}

export interface TestLocatorCardSectionProps {
  /**
   * This object contains the content to be displayed by the results card.
   * @propCategory Results Card Props
   */
  resultsCard: {
    /**
     * Slots for content blocks in the card
     */
    slots: {
      Slot1: Slot;
      Slot2: Slot;
      Slot3: Slot;
      Slot4: Slot;
      Slot5: Slot;
    };
    styles: ResultsCardStyles;
  };

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: TestLocatorCardSectionStyles;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const testLocatorCardSectionFields: Fields<TestLocatorCardSectionProps> = {
  resultsCard: YextField(msg("fields.resultsCard", "Results Card"), {
    type: "object",
    objectFields: {
      slots: {
        type: "object",
        objectFields: {
          Slot1: { type: "slot" },
          Slot2: { type: "slot" },
          Slot3: { type: "slot" },
          Slot4: { type: "slot" },
          Slot5: { type: "slot" },
        },
      },
      styles: YextField(msg("fields.styles", "Styles"), {
        type: "object",
        objectFields: {
          showResultIndex: YextField(
            msg("fields.showResultIndex", "Show Result Index"),
            {
              type: "radio",
              options: [
                { label: msg("fields.options.show", "Show"), value: true },
                { label: msg("fields.options.hide", "Hide"), value: false },
              ],
            }
          ),
          showDistance: YextField(msg("fields.showDistance", "Show Distance"), {
            type: "radio",
            options: [
              { label: msg("fields.options.show", "Show"), value: true },
              { label: msg("fields.options.hide", "Hide"), value: false },
            ],
          }),
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {},
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

interface Location {
  address: AddressType;
  hours?: HoursType;
  id: string;
  mainPhone?: string;
  name: string;
  neighborhood?: string;
  slug?: string;
  timezone: string;
  yextDisplayCoordinate?: Coordinate;
}

// Create result from actual location data
const createLocationResult = (
  location: Location,
  index: number
): CardProps<Location>["result"] =>
  ({
    rawData: location,
    index: index,
    distance: 1609.344 * 2.5, // 2.5 miles in meters
    id: `${location.id}-${index}`,
  }) as CardProps<Location>["result"];

// Component for displaying the distance
const Distance = ({ distance }: { distance: number | undefined }) => {
  const { t } = useTranslation();
  if (!distance) return null;

  const distanceInMiles = (distance / 1609.344).toFixed(1);
  const distanceInKilometers = (distance / 1000).toFixed(1);

  return (
    <div className="font-body-fontFamily font-body-sm-fontWeight text-body-sm-fontSize">
      {t("distanceInUnit", `${distanceInMiles} mi`, {
        distanceInMiles,
        distanceInKilometers,
      })}
    </div>
  );
};

const LocationCard = ({
  result,
  Slot1,
  Slot2,
  Slot3,
  Slot4,
  Slot5,
  cardStyles,
}: {
  result: CardProps<Location>["result"];
  Slot1: any;
  Slot2: any;
  Slot3: any;
  Slot4: any;
  Slot5: any;
  cardStyles: ResultsCardStyles;
}): React.JSX.Element => {
  const distance = result.distance;

  return (
    <Background
      background={backgroundColors.background1.value}
      className="container flex flex-row border-b border-gray-300 p-8 gap-4"
    >
      {cardStyles.showResultIndex && (
        <Background
          background={backgroundColors.background6.value}
          className="flex-shrink-0 w-6 h-6 rounded-full font-bold flex items-center justify-center text-body-sm-fontSize"
        >
          {result.index}
        </Background>
      )}
      <div className="flex flex-wrap gap-6 w-full">
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <Slot1
              allow={["HeadingTextLocked", "BodyTextLocked", "TextListLocked"]}
            />
            {cardStyles.showDistance && <Distance distance={distance} />}
          </div>
          <Slot2
            allow={[
              "HoursStatusLocked",
              "HoursTableLocked",
              "BodyTextLocked",
              "TextListLocked",
            ]}
          />
          <Slot3
            allow={[
              "PhoneLocked",
              "EmailsLocked",
              "BodyTextLocked",
              "TextListLocked",
            ]}
          />
          <Slot4
            allow={[
              "AddressLocked",
              "GetDirectionsLocked",
              "BodyTextLocked",
              "TextListLocked",
            ]}
          />
        </div>
        <Slot5
          allow={["CTAWrapperLocked", "CTAGroupLocked"]}
          className="basis-full"
        />
      </div>
    </Background>
  );
};

const TestLocatorCardSectionComponent = ({
  resultsCard,
}: WithPuckProps<TestLocatorCardSectionProps>) => {
  const { t } = useTranslation();
  const streamDocument = useDocument<Location>();

  // Create 3 results using the actual location from the document
  const results = [
    createLocationResult(streamDocument, 1),
    createLocationResult(streamDocument, 2),
    createLocationResult(streamDocument, 3),
  ];

  const resultCount = results.length;
  const searchQuery = streamDocument.address?.city
    ? `${streamDocument.address.city}, ${streamDocument.address.region}`
    : "Your Location";

  return (
    <div className="components flex h-screen w-screen mx-auto">
      {/* Left Section: Mock Search + Results. Full width for small screens */}
      <div className="h-screen w-full md:w-2/5 lg:w-1/3 flex flex-col">
        <div className="px-8 py-6 gap-4 flex flex-col">
          <Heading level={3}>{t("findALocation", "Find a Location")}</Heading>
          {/* Mock Search Input */}
          <div className="rounded-md p-4 h-11 border border-gray-300 bg-white text-gray-500">
            {t("searchHere", "Search here...")}
          </div>
        </div>
        {/* Results Count */}
        <div className="px-8 py-4 text-body-fontSize border-y border-gray-300">
          {t(
            "locationsNear",
            `${resultCount} locations near "${searchQuery}"`,
            {
              count: resultCount,
              filterDisplayName: searchQuery,
            }
          )}
        </div>
        {/* Results Container */}
        <div className="overflow-y-auto">
          {results.map((result, index) => (
            <LocationCard
              key={index}
              result={result}
              Slot1={resultsCard.slots.Slot1}
              Slot2={resultsCard.slots.Slot2}
              Slot3={resultsCard.slots.Slot3}
              Slot4={resultsCard.slots.Slot4}
              Slot5={resultsCard.slots.Slot5}
              cardStyles={resultsCard.styles}
            />
          ))}
        </div>
      </div>

      {/* Right Section: Mock Map. Hidden for small screens */}
      <div className="md:w-3/5 lg:w-2/3 md:flex hidden relative bg-gray-200">
        <div className="flex items-center justify-center w-full h-full">
          <div className="border border-gray-300 rounded-lg p-6 bg-white shadow-md">
            <span className="text-gray-700 text-lg font-medium font-body-fontFamily">
              {t("mockMap", "Mock Map Placeholder")}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Test component for experimenting with LocationCard implementations.
 * This component mimics the Locator layout with mock search and map functionality,
 * focusing on the LocationCard display for prototyping purposes.
 * The component repeats the current location document multiple times to test the card layout.
 */
export const TestLocatorCardSection: ComponentConfig<{
  props: TestLocatorCardSectionProps;
}> = {
  label: msg("components.testLocatorCardSection", "Test Locator Card Section"),
  fields: testLocatorCardSectionFields,
  defaultProps: {
    resultsCard: {
      slots: {
        Slot1: [],
        Slot2: [],
        Slot3: [],
        Slot4: [],
        Slot5: [],
      },
      styles: {
        showResultIndex: true,
        showDistance: true,
      },
    },
    styles: {},
    liveVisibility: true,
  },
  resolveData: async (data, { changed, trigger }) => {
    // Initialize slots with default content when component is first created
    const slotsAreEmpty =
      data.props.resultsCard.slots.Slot1.length === 0 &&
      data.props.resultsCard.slots.Slot2.length === 0 &&
      data.props.resultsCard.slots.Slot3.length === 0 &&
      data.props.resultsCard.slots.Slot4.length === 0 &&
      data.props.resultsCard.slots.Slot5.length === 0;

    // Only create default content if slots are empty or on first load
    if (!slotsAreEmpty && trigger === "load") return data;
    if (!slotsAreEmpty && changed && !changed.resultsCard) return data;

    // Slot 1: Location Name (H4)
    const locationName = await createComponent("HeadingTextLocked", {
      text: {
        field: "name",
        constantValue: {
          en: "",
          hasLocalizedValue: "true",
        },
      },
      level: 4,
    });

    // Slot 2: Hours Status
    const hoursStatus = await createComponent("HoursStatusLocked", {
      hours: {
        field: "hours",
        constantValue: {},
      },
    });

    // Slot 3: Phone
    const phone = await createComponent("PhoneLocked", {
      data: {
        number: {
          field: "mainPhone",
          constantValue: "",
        },
        label: {
          en: "",
          hasLocalizedValue: "true",
        },
      },
      styles: {
        phoneFormat: "domestic",
        includePhoneHyperlink: true,
      },
    });

    // Slot 4: Address
    const address = await createComponent("AddressLocked", {
      data: {
        address: {
          field: "address",
          constantValue: {
            line1: "",
            city: "",
            region: "",
            postalCode: "",
            countryCode: "",
          },
        },
      },
      styles: {
        showGetDirectionsLink: true,
        ctaVariant: "link",
      },
    });

    // Slot 5: Visit Page Button
    const visitPageButton = await createComponent("CTAWrapperLocked", {
      entityField: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          ctaType: "textAndLink",
          label: "Visit Page",
          link: "#",
        },
      },
      variant: "primary",
    });

    return {
      ...data,
      props: {
        ...data.props,
        resultsCard: {
          ...data.props.resultsCard,
          slots: {
            Slot1: [locationName],
            Slot2: [hoursStatus],
            Slot3: [phone],
            Slot4: [address],
            Slot5: [visitPageButton],
          },
        },
      },
    };
  },
  render: (props: any) => {
    return (
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
        iconSize="md"
      >
        <TestLocatorCardSectionComponent {...props} />
      </VisibilityWrapper>
    );
  },
};
