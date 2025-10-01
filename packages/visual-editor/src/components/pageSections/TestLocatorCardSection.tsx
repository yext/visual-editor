import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  YextField,
  msg,
  VisibilityWrapper,
  useTemplateProps,
  resolveUrlTemplate,
  mergeMeta,
  backgroundColors,
  Background,
  Heading,
  Button,
  useDocument,
  EntityField,
  pt,
  resolveComponentData,
  YextEntityField,
  TranslatableString,
  CTAVariant,
  CTA,
  HeadingLevel,
} from "@yext/visual-editor";
import {
  ComponentConfig,
  Fields,
  PuckContext,
  WithPuckProps,
} from "@measured/puck";
import {
  CardProps,
  Coordinate,
  // useCardAnalyticsCallback,
} from "@yext/search-ui-react";
import {
  Address as RenderAddress,
  AddressType,
  HoursStatus as HoursStatusAtom,
  HoursType,
} from "@yext/pages-components";
import { formatPhoneNumber } from "../atoms/phone.js";

export interface ResultsCardData {
  /**
   * The location name field to display on the card.
   * @defaultValue "name" field
   */
  name: YextEntityField<TranslatableString>;

  /**
   * The hours field to display on the card.
   * @defaultValue "hours" field
   */
  hours: YextEntityField<HoursType>;

  /**
   * The phone number field to display on the card.
   * @defaultValue "mainPhone" field
   */
  phone: YextEntityField<string>;

  /**
   * The address field to display on the card.
   * @defaultValue "address" field
   */
  address: YextEntityField<AddressType>;

  /**
   * The coordinates field used for directions.
   * @defaultValue "yextDisplayCoordinate" field
   */
  coordinate: YextEntityField<Coordinate>;
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

  /**
   * Whether to show hours status.
   * @defaultValue true
   */
  showHours: boolean;

  /**
   * Whether to show the phone number.
   * @defaultValue true
   */
  showPhone: boolean;

  /**
   * Whether to show the address.
   * @defaultValue true
   */
  showAddress: boolean;

  /**
   * Whether to show the get directions link.
   * @defaultValue true
   */
  showGetDirections: boolean;

  /**
   * Whether to show the visit page button.
   * @defaultValue true
   */
  showVisitPageButton: boolean;

  /**
   * The heading level for the location name.
   * @defaultValue 4
   */
  nameHeadingLevel: HeadingLevel;

  /**
   * The phone number format.
   * @defaultValue "domestic"
   */
  phoneFormat: "domestic" | "international";

  /**
   * The CTA variant for the get directions link.
   * @defaultValue "link"
   */
  getDirectionsVariant: CTAVariant;

  /**
   * The CTA variant for the visit page button.
   * @defaultValue "primary"
   */
  visitPageVariant: CTAVariant;
}

export interface TestLocatorCardSectionStyles {}

export interface TestLocatorCardSectionProps {
  /**
   * This object contains the content to be displayed by the results card.
   * @propCategory Results Card Props
   */
  resultsCard: {
    data: ResultsCardData;
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
      data: YextField(msg("fields.data", "Data"), {
        type: "object",
        objectFields: {
          name: YextField<any, TranslatableString>(
            msg("fields.locationName", "Location Name"),
            {
              type: "entityField",
              filter: {
                types: ["type.string"],
              },
            }
          ),
          hours: YextField(msg("fields.hours", "Hours"), {
            type: "entityField",
            filter: {
              types: ["type.hours"],
            },
          }),
          phone: YextField(msg("fields.phoneNumber", "Phone Number"), {
            type: "entityField",
            filter: {
              types: ["type.phone"],
            },
          }),
          address: YextField(msg("fields.address", "Address"), {
            type: "entityField",
            filter: {
              types: ["type.address"],
            },
          }),
          coordinate: YextField(msg("fields.coordinate", "Coordinate"), {
            type: "entityField",
            filter: {
              types: ["type.coordinate"],
            },
          }),
        },
      }),
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
          showHours: YextField(msg("fields.showHours", "Show Hours"), {
            type: "radio",
            options: [
              { label: msg("fields.options.show", "Show"), value: true },
              { label: msg("fields.options.hide", "Hide"), value: false },
            ],
          }),
          showPhone: YextField(msg("fields.showPhone", "Show Phone"), {
            type: "radio",
            options: [
              { label: msg("fields.options.show", "Show"), value: true },
              { label: msg("fields.options.hide", "Hide"), value: false },
            ],
          }),
          showAddress: YextField(msg("fields.showAddress", "Show Address"), {
            type: "radio",
            options: [
              { label: msg("fields.options.show", "Show"), value: true },
              { label: msg("fields.options.hide", "Hide"), value: false },
            ],
          }),
          showGetDirections: YextField(
            msg("fields.showGetDirections", "Show Get Directions"),
            {
              type: "radio",
              options: [
                { label: msg("fields.options.show", "Show"), value: true },
                { label: msg("fields.options.hide", "Hide"), value: false },
              ],
            }
          ),
          showVisitPageButton: YextField(
            msg("fields.showVisitPageButton", "Show Visit Page Button"),
            {
              type: "radio",
              options: [
                { label: msg("fields.options.show", "Show"), value: true },
                { label: msg("fields.options.hide", "Hide"), value: false },
              ],
            }
          ),
          nameHeadingLevel: YextField(
            msg("fields.nameHeadingLevel", "Name Heading Level"),
            {
              type: "select",
              hasSearch: true,
              options: "HEADING_LEVEL",
            }
          ),
          phoneFormat: YextField(msg("fields.phoneFormat", "Phone Format"), {
            type: "radio",
            options: [
              {
                label: msg("fields.options.domestic", "Domestic"),
                value: "domestic",
              },
              {
                label: msg("fields.options.international", "International"),
                value: "international",
              },
            ],
          }),
          getDirectionsVariant: YextField(
            msg("fields.getDirectionsVariant", "Get Directions Variant"),
            {
              type: "radio",
              options: "CTA_VARIANT",
            }
          ),
          visitPageVariant: YextField(
            msg("fields.visitPageButtonVariant", "Visit Page Button Variant"),
            {
              type: "radio",
              options: "CTA_VARIANT",
            }
          ),
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

// Component for displaying the location name
const LocationName = ({
  data,
  styles,
  location,
}: {
  data: ResultsCardData;
  styles: ResultsCardStyles;
  location: Location;
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  console.log("[LocationName] Data:", { data, styles, location });

  if (!data || !data.name) {
    console.error("[LocationName] data or data.name is undefined!", { data });
    return <span>{location.name}</span>;
  }

  const resolvedName = resolveComponentData(
    data.name,
    i18n.language,
    streamDocument
  );

  return (
    <EntityField
      displayName={pt("fields.locationName", "Location Name")}
      fieldId={data.name.field}
      constantValueEnabled={data.name.constantValueEnabled}
    >
      <Heading
        className="font-bold text-palette-primary-dark"
        level={styles.nameHeadingLevel}
      >
        {resolvedName || location.name}
      </Heading>
    </EntityField>
  );
};

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

// Component for displaying hours status
const Hours = ({
  data,
  location,
}: {
  data: ResultsCardData;
  location: Location;
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  console.log("[Hours] Data:", { data, location });

  if (!data || !data.hours) {
    console.error("[Hours] data or data.hours is undefined!", { data });
    return null;
  }

  const resolvedHours = resolveComponentData(
    data.hours,
    i18n.language,
    streamDocument
  );

  const hours = resolvedHours || location.hours;
  if (!hours) return null;

  return (
    <EntityField
      displayName={pt("fields.hours", "Hours")}
      fieldId={data.hours.field}
      constantValueEnabled={data.hours.constantValueEnabled}
    >
      <div className="font-body-fontFamily text-body-fontSize gap-8">
        <HoursStatusAtom hours={hours} timezone={location.timezone} />
      </div>
    </EntityField>
  );
};

// Component for displaying phone number
const Phone = ({
  data,
  styles,
  location,
}: {
  data: ResultsCardData;
  styles: ResultsCardStyles;
  location: Location;
}) => {
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  console.log("[Phone] Data:", { data, styles, location });

  if (!data || !data.phone) {
    console.error("[Phone] data or data.phone is undefined!", { data });
    return null;
  }

  const resolvedPhone = resolveComponentData(
    data.phone,
    i18n.language,
    streamDocument
  );

  const phone = resolvedPhone || location.mainPhone;
  if (!phone) return null;

  return (
    <EntityField
      displayName={pt("fields.phoneNumber", "Phone Number")}
      fieldId={data.phone.field}
      constantValueEnabled={data.phone.constantValueEnabled}
    >
      <a
        href={`tel:${phone}`}
        className="components h-fit w-fit underline decoration-0 hover:no-underline font-link-fontFamily text-link-fontSize tracking-link-letterSpacing text-palette-primary-dark"
      >
        {formatPhoneNumber(
          phone,
          styles.phoneFormat === "domestic" ? "domestic" : "international"
        )}
      </a>
    </EntityField>
  );
};

// Component for displaying address and get directions
const AddressWithDirections = ({
  data,
  styles,
  location,
}: {
  data: ResultsCardData;
  styles: ResultsCardStyles;
  location: Location;
}) => {
  const { t, i18n } = useTranslation();
  const streamDocument = useDocument();

  console.log("[AddressWithDirections] Data:", { data, styles, location });

  if (!data || !data.address || !data.coordinate) {
    console.error(
      "[AddressWithDirections] data, data.address, or data.coordinate is undefined!",
      { data }
    );
    return null;
  }

  const resolvedAddress = resolveComponentData(
    data.address,
    i18n.language,
    streamDocument
  );
  const resolvedCoordinate = resolveComponentData(
    data.coordinate,
    i18n.language,
    streamDocument
  );

  const address = resolvedAddress || location.address;
  const coordinate = resolvedCoordinate || location.yextDisplayCoordinate;

  if (!address && !coordinate) return null;

  const getGoogleMapsLink = (coord: Coordinate): string => {
    return `https://www.google.com/maps/dir/?api=1&destination=${coord.latitude},${coord.longitude}`;
  };

  return (
    <div className="flex flex-col gap-1 w-full">
      {styles.showAddress && address && (
        <EntityField
          displayName={pt("fields.address", "Address")}
          fieldId={data.address.field}
          constantValueEnabled={data.address.constantValueEnabled}
        >
          <div className="font-body-fontFamily font-body-fontWeight text-body-md-fontSize gap-4">
            <RenderAddress
              address={address}
              lines={[["line1"], ["line2"], ["city", "region", "postalCode"]]}
            />
          </div>
        </EntityField>
      )}
      {styles.showGetDirections && coordinate && (
        <EntityField
          displayName={pt("fields.coordinate", "Coordinate")}
          fieldId={data.coordinate.field}
          constantValueEnabled={data.coordinate.constantValueEnabled}
        >
          <CTA
            eventName="getDirections"
            link={getGoogleMapsLink(coordinate)}
            label={t("getDirections", "Get Directions")}
            linkType="DRIVING_DIRECTIONS"
            target="_blank"
            variant={styles.getDirectionsVariant}
            className="font-bold"
          />
        </EntityField>
      )}
    </div>
  );
};

// Component for displaying the visit page button
const VisitPageButton = ({
  styles,
  location,
  puck,
}: {
  styles: ResultsCardStyles;
  location: Location;
  puck: PuckContext;
}) => {
  const { t } = useTranslation();
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();

  const resolvedUrl = resolveUrlTemplate(
    mergeMeta(location, streamDocument),
    relativePrefixToRoot,
    puck.metadata?.resolveUrlTemplate
  );

  return (
    <Button asChild className="basis-full" variant={styles.visitPageVariant}>
      <a href={resolvedUrl}>{t("visitPage", "Visit Page")}</a>
    </Button>
  );
};

const LocationCard = ({
  result,
  puck,
  cardData,
  cardStyles,
}: {
  result: CardProps<Location>["result"];
  puck: PuckContext;
  cardData: ResultsCardData;
  cardStyles: ResultsCardStyles;
}): React.JSX.Element => {
  console.log("[LocationCard] Props:", { result, puck, cardData, cardStyles });

  if (!cardData) {
    console.error("[LocationCard] cardData is undefined!");
    return <div>Error: Card data is missing</div>;
  }

  if (!cardStyles) {
    console.error("[LocationCard] cardStyles is undefined!");
    return <div>Error: Card styles are missing</div>;
  }

  const location = result.rawData;
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
            <LocationName
              data={cardData}
              styles={cardStyles}
              location={location}
            />
            {cardStyles.showDistance && <Distance distance={distance} />}
          </div>
          {cardStyles.showHours && (
            <Hours data={cardData} location={location} />
          )}
          {cardStyles.showPhone && (
            <Phone data={cardData} styles={cardStyles} location={location} />
          )}
          <AddressWithDirections
            data={cardData}
            styles={cardStyles}
            location={location}
          />
        </div>
        {cardStyles.showVisitPageButton && (
          <VisitPageButton
            styles={cardStyles}
            location={location}
            puck={puck}
          />
        )}
      </div>
    </Background>
  );
};

const TestLocatorCardSectionComponent = ({
  puck,
  resultsCard,
}: WithPuckProps<TestLocatorCardSectionProps>) => {
  const { t } = useTranslation();
  const streamDocument = useDocument<Location>();

  // Debug logging
  console.log("[TestLocatorCardSection] Props:", { resultsCard, puck });

  if (!resultsCard) {
    console.error("[TestLocatorCardSection] resultsCard is undefined!");
    return null;
  }

  if (!resultsCard.data) {
    console.error(
      "[TestLocatorCardSection] resultsCard.data is undefined!",
      resultsCard
    );
    return null;
  }

  if (!resultsCard.styles) {
    console.error(
      "[TestLocatorCardSection] resultsCard.styles is undefined!",
      resultsCard
    );
    return null;
  }

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
              puck={puck}
              cardData={resultsCard.data}
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
      data: {
        name: {
          field: "name",
          constantValue: {
            en: "",
            hasLocalizedValue: "true",
          },
        },
        hours: {
          field: "hours",
          constantValue: {},
        },
        phone: {
          field: "mainPhone",
          constantValue: "",
        },
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
        coordinate: {
          field: "yextDisplayCoordinate",
          constantValue: {
            latitude: 0,
            longitude: 0,
          },
        },
      },
      styles: {
        showResultIndex: true,
        showDistance: true,
        showHours: true,
        showPhone: true,
        showAddress: true,
        showGetDirections: true,
        showVisitPageButton: true,
        nameHeadingLevel: 4,
        phoneFormat: "domestic",
        getDirectionsVariant: "link",
        visitPageVariant: "primary",
      },
    },
    styles: {},
    liveVisibility: true,
  },
  render: (props) => {
    console.log("[TestLocatorCardSection.render] Props received:", props);

    // Safety check - ensure resultsCard exists with proper structure
    if (!props.resultsCard) {
      console.error(
        "[TestLocatorCardSection.render] resultsCard is missing from props!",
        props
      );
      return (
        <div
          style={{
            padding: "20px",
            backgroundColor: "#fee",
            border: "1px solid red",
          }}
        >
          Error: resultsCard configuration is missing. Please check the
          component setup.
        </div>
      );
    }

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
