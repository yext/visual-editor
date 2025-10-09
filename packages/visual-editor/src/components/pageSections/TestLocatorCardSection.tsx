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

export interface TestLocatorCardSectionStyles {
  /**
   * Styling options for the result cards.
   */
  card: {
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
  };
}

export interface TestLocatorCardSectionProps {
  /**
   * Array of slots for content blocks in the card
   * @propCategory Content Slots
   */
  slots: { Slot: Slot }[];

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
  slots: {
    type: "array",
    arrayFields: {
      Slot: { type: "slot" },
    },
  },
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      card: YextField(msg("fields.card", "Card"), {
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
  slots,
  cardStyles,
}: {
  result: CardProps<Location>["result"];
  slots: { Slot: any }[];
  cardStyles: TestLocatorCardSectionStyles["card"];
}): React.JSX.Element => {
  const distance = result.distance;

  // Define allow lists for each slot index
  const getAllowList = (index: number): string[] => {
    switch (index) {
      case 0:
        return ["HeadingTextLocked", "BodyTextLocked", "TextListLocked"];
      case 1:
        return [
          "HoursStatusLocked",
          "HoursTableLocked",
          "BodyTextLocked",
          "TextListLocked",
        ];
      case 2:
        return [
          "PhoneLocked",
          "EmailsLocked",
          "BodyTextLocked",
          "TextListLocked",
        ];
      case 3:
        return [
          "AddressLocked",
          "GetDirectionsLocked",
          "BodyTextLocked",
          "TextListLocked",
        ];
      case 4:
        return ["CTAWrapperLocked", "CTAGroupLocked"];
      default:
        return [];
    }
  };

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
          {slots.slice(0, 4).map(({ Slot }, idx) => (
            <React.Fragment key={idx}>
              {idx === 0 && (
                <div className="flex flex-row justify-between items-center">
                  <Slot allow={getAllowList(idx)} />
                  {cardStyles.showDistance && <Distance distance={distance} />}
                </div>
              )}
              {idx > 0 && <Slot allow={getAllowList(idx)} />}
            </React.Fragment>
          ))}
        </div>
        {slots.length > 4 &&
          slots
            .slice(4)
            .map(({ Slot }, idx) => (
              <Slot
                key={idx + 4}
                allow={getAllowList(idx + 4)}
                className="basis-full"
              />
            ))}
      </div>
    </Background>
  );
};

const TestLocatorCardSectionComponent = ({
  slots,
  styles,
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
              slots={slots}
              cardStyles={styles.card}
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
    slots: [
      { Slot: [] },
      { Slot: [] },
      { Slot: [] },
      { Slot: [] },
      { Slot: [] },
    ],
    styles: {
      card: {
        showResultIndex: true,
        showDistance: true,
      },
    },
    liveVisibility: true,
  },
  resolveData: async (data, { changed, trigger }) => {
    // Don't populate slots on load if they already have content
    if (trigger === "load") return data;

    // Only process if slots were changed or if it's the first render
    if (changed && !changed.slots) return data;

    // Helper function to get default component for a slot index
    const getDefaultComponentForSlot = async (index: number) => {
      switch (index) {
        case 0:
          // Slot 0: Location Name (H4)
          return await createComponent("HeadingTextLocked", {
            text: {
              field: "name",
              constantValue: {
                en: "",
                hasLocalizedValue: "true",
              },
            },
            level: 4,
          });
        case 1:
          // Slot 1: Hours Status
          return await createComponent("HoursStatusLocked", {
            hours: {
              field: "hours",
              constantValue: {},
            },
          });
        case 2:
          // Slot 2: Phone
          return await createComponent("PhoneLocked", {
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
        case 3:
          // Slot 3: Address
          return await createComponent("AddressLocked", {
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
        case 4:
          // Slot 4: Visit Page Button
          return await createComponent("CTAWrapperLocked", {
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
        default:
          // For slots beyond the defaults, return null (user will populate)
          return null;
      }
    };

    // Populate empty slots with default content
    const populatedSlots = await Promise.all(
      data.props.slots.map(async (slot, index) => {
        // If the slot already has content, keep it
        if (slot.Slot.length > 0) {
          return slot;
        }

        // If the slot is empty, populate it with default content (if available)
        const defaultComponent = await getDefaultComponentForSlot(index);
        return {
          Slot: defaultComponent ? [defaultComponent] : [],
        };
      })
    );

    return {
      ...data,
      props: {
        ...data.props,
        slots: populatedSlots,
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
