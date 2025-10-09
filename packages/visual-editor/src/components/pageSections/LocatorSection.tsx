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
  WithId,
  Slot,
  ComponentDataOptionalId,
  Render,
  Config,
  useGetPuck,
} from "@measured/puck";
import { CardProps, Coordinate } from "@yext/search-ui-react";
import { AddressType, HoursType } from "@yext/pages-components";
import {
  AdvancedCoreInfoCategoryProps,
  AdvancedCoreInfoCategoryComponents,
} from "../categories/AdvancedCoreInfoCategory";

export type Components = AdvancedCoreInfoCategoryProps;

const contentBlocks = {
  ...AdvancedCoreInfoCategoryComponents,
};

// Create a Puck config for rendering slot content in read-only mode
const slotContentConfig: Config<Components> = {
  components: contentBlocks,
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

export interface LocatorSectionStyles {
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

    /**
     * Column layout for the card content.
     * @defaultValue "1-column"
     */
    columnLayout: "1-column" | "2-column";

    /**
     * Spacing between slots in column 1.
     * @defaultValue "4"
     */
    column1Spacing: "0" | "1" | "2" | "3" | "4" | "6" | "8" | "12";

    /**
     * Spacing between slots in column 2.
     * @defaultValue "4"
     */
    column2Spacing: "0" | "1" | "2" | "3" | "4" | "6" | "8" | "12";
  };
}

export interface LocatorSectionProps {
  /**
   * Array of slots for content blocks in column 1 of the card
   * @propCategory Content Slots
   */
  column1Slots: { Slot: Slot }[];

  /**
   * Array of slots for content blocks in column 2 of the card (only visible in 2-column layout)
   * @propCategory Content Slots
   */
  column2Slots: { Slot: Slot }[];

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: LocatorSectionStyles;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const locatorSectionFields: Fields<LocatorSectionProps> = {
  column1Slots: {
    type: "array",
    arrayFields: {
      Slot: { type: "slot" },
    },
  },
  column2Slots: {
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
          columnLayout: YextField(msg("fields.columnLayout", "Column Layout"), {
            type: "radio",
            options: [
              {
                label: msg("fields.options.1column", "1 Column"),
                value: "1-column",
              },
              {
                label: msg("fields.options.2column", "2 Columns"),
                value: "2-column",
              },
            ],
          }),
          column1Spacing: YextField(
            msg("fields.column1Spacing", "Column 1 Spacing"),
            {
              type: "select",
              options: [
                { label: msg("fields.options.0px", "0px"), value: "0" },
                { label: msg("fields.options.4px", "4px"), value: "1" },
                { label: msg("fields.options.8px", "8px"), value: "2" },
                { label: msg("fields.options.12px", "12px"), value: "3" },
                { label: msg("fields.options.16px", "16px"), value: "4" },
                { label: msg("fields.options.24px", "24px"), value: "6" },
                { label: msg("fields.options.32px", "32px"), value: "8" },
                { label: msg("fields.options.48px", "48px"), value: "12" },
              ],
            }
          ),
          column2Spacing: YextField(
            msg("fields.column2Spacing", "Column 2 Spacing"),
            {
              type: "select",
              options: [
                { label: msg("fields.options.0px", "0px"), value: "0" },
                { label: msg("fields.options.4px", "4px"), value: "1" },
                { label: msg("fields.options.8px", "8px"), value: "2" },
                { label: msg("fields.options.12px", "12px"), value: "3" },
                { label: msg("fields.options.16px", "16px"), value: "4" },
                { label: msg("fields.options.24px", "24px"), value: "6" },
                { label: msg("fields.options.32px", "32px"), value: "8" },
                { label: msg("fields.options.48px", "48px"), value: "12" },
              ],
            }
          ),
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
  column1Slots,
  column2Slots,
  rawColumn1Data,
  rawColumn2Data,
  cardStyles,
  isEditable = false,
}: {
  result: CardProps<Location>["result"];
  column1Slots: { Slot: any }[];
  column2Slots: { Slot: any }[];
  rawColumn1Data?: any[];
  rawColumn2Data?: any[];
  cardStyles: LocatorSectionStyles["card"];
  isEditable?: boolean;
}): React.JSX.Element => {
  const distance = result.distance;
  const isTwoColumn = cardStyles.columnLayout === "2-column";

  // Allow all AdvancedCoreInfoCategory components except Grid
  const allowList = [
    "Address",
    "BodyText",
    "CTAGroup",
    "CTAWrapper",
    "Emails",
    "GetDirections",
    "HeadingText",
    "HoursTable",
    "HoursStatus",
    "ImageWrapper",
    "Phone",
    "TextList",
    "SlotFlex",
  ];

  const renderSlot = (idx: number, Slot: any, rawData?: any[]) => {
    const slotContent = rawData?.[idx]?.Slot;
    return isEditable ? (
      <Slot allow={allowList} />
    ) : Array.isArray(slotContent) && slotContent.length > 0 ? (
      <Render
        config={slotContentConfig}
        data={{ content: slotContent, root: { props: {} } }}
      />
    ) : null;
  };

  if (isTwoColumn) {
    // Two-column layout: separate column arrays

    // Map spacing values to pixels
    const spacingMap: Record<string, string> = {
      "0": "0px",
      "1": "0.25rem",
      "2": "0.5rem",
      "3": "0.75rem",
      "4": "1rem",
      "6": "1.5rem",
      "8": "2rem",
      "12": "3rem",
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
        <div className="flex flex-col w-full">
          {/* First row: First slot and distance span full width */}
          <div
            className="flex flex-row justify-between items-start"
            style={{ marginBottom: spacingMap[cardStyles.column1Spacing] }}
          >
            <div>{renderSlot(0, column1Slots[0]?.Slot, rawColumn1Data)}</div>
            {cardStyles.showDistance && <Distance distance={distance} />}
          </div>

          {/* Columns below */}
          <div className="flex gap-6 w-full">
            {/* Column 1 - remaining slots from column 1 */}
            <div
              className="flex-1 flex flex-col"
              style={{ gap: spacingMap[cardStyles.column1Spacing] }}
            >
              {column1Slots.slice(1).map(({ Slot }, idx) => (
                <div key={idx + 1}>
                  {renderSlot(idx + 1, Slot, rawColumn1Data)}
                </div>
              ))}
            </div>

            {/* Column 2 - all slots from column 2 */}
            {column2Slots.length > 0 && (
              <div
                className="flex-1 flex flex-col"
                style={{ gap: spacingMap[cardStyles.column2Spacing] }}
              >
                {column2Slots.map(({ Slot }, idx) => (
                  <div key={idx}>{renderSlot(idx, Slot, rawColumn2Data)}</div>
                ))}
              </div>
            )}
          </div>
        </div>
      </Background>
    );
  }

  // One-column layout - only show column 1
  // Map spacing values to pixels
  const spacingMap: Record<string, string> = {
    "0": "0px",
    "1": "0.25rem",
    "2": "0.5rem",
    "3": "0.75rem",
    "4": "1rem",
    "6": "1.5rem",
    "8": "2rem",
    "12": "3rem",
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
      <div
        className="flex flex-col w-full"
        style={{ gap: spacingMap[cardStyles.column1Spacing] }}
      >
        {column1Slots.map(({ Slot }, idx) => (
          <React.Fragment key={idx}>
            {idx === 0 && (
              <div className="flex flex-row justify-between items-start">
                {renderSlot(idx, Slot, rawColumn1Data)}
                {cardStyles.showDistance && <Distance distance={distance} />}
              </div>
            )}
            {idx > 0 && renderSlot(idx, Slot, rawColumn1Data)}
          </React.Fragment>
        ))}
      </div>
    </Background>
  );
};

const LocatorSectionComponent = ({
  column1Slots,
  column2Slots,
  styles,
  id,
}: WithId<WithPuckProps<LocatorSectionProps>>) => {
  const { t } = useTranslation();
  const streamDocument = useDocument<Location>();
  const getPuck = useGetPuck();

  // Extract raw slot data from puck state
  const { rawColumn1Data, rawColumn2Data } = React.useMemo(() => {
    const { appState } = getPuck();
    if (!appState?.data?.content)
      return { rawColumn1Data: [], rawColumn2Data: [] };
    const componentData = appState.data.content.find(
      (c: any) => c.props?.id === id
    );
    return {
      rawColumn1Data: componentData?.props?.column1Slots || [],
      rawColumn2Data: componentData?.props?.column2Slots || [],
    };
  }, [getPuck, id]);

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

  const isTwoColumn = styles.card.columnLayout === "2-column";

  return (
    <div className="components flex h-screen w-screen mx-auto">
      {/* Left Section: Mock Search + Results. Adjust width based on column layout */}
      <div
        className={`h-screen w-full flex flex-col ${isTwoColumn ? "md:w-3/5 lg:w-1/2" : "md:w-2/5 lg:w-1/3"}`}
      >
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
              column1Slots={column1Slots}
              column2Slots={column2Slots}
              rawColumn1Data={rawColumn1Data}
              rawColumn2Data={rawColumn2Data}
              cardStyles={styles.card}
              isEditable={index === 0}
            />
          ))}
        </div>
      </div>

      {/* Right Section: Mock Map. Hidden for small screens. Adjust width based on column layout */}
      <div
        className={`md:flex hidden relative bg-gray-200 ${isTwoColumn ? "md:w-2/5 lg:w-1/2" : "md:w-3/5 lg:w-2/3"}`}
      >
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
 * Component for experimenting with LocationCard implementations.
 * This component mimics the Locator layout with mock search and map functionality,
 * focusing on the LocationCard display for prototyping purposes.
 * The component repeats the current location document multiple times to test the card layout.
 */
export const LocatorSection: ComponentConfig<{
  props: LocatorSectionProps;
}> = {
  label: msg("components.locatorSection", "Locator"),
  fields: locatorSectionFields,
  defaultProps: {
    column1Slots: [{ Slot: [] }, { Slot: [] }, { Slot: [] }, { Slot: [] }],
    column2Slots: [{ Slot: [] }],
    styles: {
      card: {
        showResultIndex: true,
        showDistance: true,
        columnLayout: "1-column",
        column1Spacing: "4",
        column2Spacing: "4",
      },
    },
    liveVisibility: true,
  },
  resolveData: async (data, { changed, trigger, lastData }) => {
    // Don't populate slots on load if they already have content
    if (trigger === "load") return data;

    // Check if columnLayout was changed to "2-column"
    const columnLayoutChanged =
      changed?.styles &&
      lastData?.props?.styles?.card?.columnLayout !== "2-column" &&
      data.props.styles.card.columnLayout === "2-column";

    // If switching to 2-column and column2Slots is empty, add one empty slot
    if (columnLayoutChanged && data.props.column2Slots.length === 0) {
      return {
        ...data,
        props: {
          ...data.props,
          column2Slots: [{ Slot: [] }],
        },
      };
    }

    // Only process if column slots were changed or if it's the first render
    if (changed && !changed.column1Slots && !changed.column2Slots) return data;

    // Helper function to get default component for column 1 slots
    const getDefaultColumn1Component = async (index: number) => {
      switch (index) {
        case 0:
          // Slot 0: Location Name (H4)
          return await createComponent("HeadingText", {
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
          return await createComponent("HoursStatus", {
            hours: {
              field: "hours",
              constantValue: {},
            },
          });
        case 2:
          // Slot 2: Phone
          return await createComponent("Phone", {
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
          return await createComponent("Address", {
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
        default:
          return null;
      }
    };

    // Helper function to get default component for column 2 slots
    const getDefaultColumn2Component = async (index: number) => {
      switch (index) {
        case 0:
          // Column 2, Slot 0: Visit Page Button
          return await createComponent("CTAWrapper", {
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
          return null;
      }
    };

    // Populate empty column 1 slots with default content
    const populatedColumn1Slots = await Promise.all(
      data.props.column1Slots.map(async (slot, index) => {
        // If the slot already has content, keep it
        if (slot.Slot.length > 0) {
          return slot;
        }

        // If the slot is empty, populate it with default content (if available)
        const defaultComponent = await getDefaultColumn1Component(index);
        return {
          Slot: defaultComponent ? [defaultComponent] : [],
        };
      })
    );

    // Populate empty column 2 slots with default content
    const populatedColumn2Slots = await Promise.all(
      data.props.column2Slots.map(async (slot, index) => {
        // If the slot already has content, keep it
        if (slot.Slot.length > 0) {
          return slot;
        }

        // If the slot is empty, populate it with default content (if available)
        const defaultComponent = await getDefaultColumn2Component(index);
        return {
          Slot: defaultComponent ? [defaultComponent] : [],
        };
      })
    );

    return {
      ...data,
      props: {
        ...data.props,
        column1Slots: populatedColumn1Slots,
        column2Slots: populatedColumn2Slots,
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
        <LocatorSectionComponent {...props} />
      </VisibilityWrapper>
    );
  },
};
