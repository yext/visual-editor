import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  YextField,
  msg,
  VisibilityWrapper,
  useTemplateProps,
  useDocument,
  resolveUrlTemplate,
  mergeMeta,
  backgroundColors,
  Background,
  Heading,
  Button,
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
  Address,
  AddressType,
  HoursStatus,
  HoursType,
} from "@yext/pages-components";
import { formatPhoneNumber } from "../atoms/phone.js";
import { FaAngleRight } from "react-icons/fa";

export interface TestLocatorCardSectionStyles {}

export interface TestLocatorCardSectionProps {
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

// Create result from location data
const createResult = (
  location: Location,
  index: number
): CardProps<Location>["result"] =>
  ({
    rawData: location,
    index: index,
    distance: 1609.344 * 2.5, // 2.5 miles in meters
    id: location.id || `location-${index}`,
  }) as CardProps<Location>["result"];

const LocationCard = ({
  result,
  puck,
}: {
  result: CardProps<Location>["result"];
  puck: PuckContext;
}): React.JSX.Element => {
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();
  const { t } = useTranslation();

  const location = result.rawData;
  const distance = result.distance;

  // function that takes coordinates and returns a google maps link for directions
  const getGoogleMapsLink = (coordinate: Coordinate): string => {
    return `https://www.google.com/maps/dir/?api=1&destination=${coordinate.latitude},${coordinate.longitude}`;
  };

  const distanceInMiles = distance
    ? (distance / 1609.344).toFixed(1)
    : undefined;

  const distanceInKilometers = distance
    ? (distance / 1000).toFixed(1)
    : undefined;

  // const handleGetDirectionsClick = useCardAnalyticsCallback(
  //   result,
  //   "DRIVING_DIRECTIONS"
  // );
  // const handleVisitPageClick = useCardAnalyticsCallback(result, "VIEW_WEBSITE");
  // const handlePhoneNumberClick = useCardAnalyticsCallback(
  //   result,
  //   "TAP_TO_CALL"
  // );

  const resolvedUrl = resolveUrlTemplate(
    mergeMeta(location, streamDocument),
    relativePrefixToRoot,
    puck.metadata?.resolveUrlTemplate
  );

  return (
    <Background
      background={backgroundColors.background1.value}
      className="container flex flex-row border-b border-gray-300 p-8 gap-4"
    >
      <Background
        background={backgroundColors.background6.value}
        className="flex-shrink-0 w-6 h-6 rounded-full font-bold flex items-center justify-center text-body-sm-fontSize"
      >
        {result.index}
      </Background>
      <div className="flex flex-wrap gap-6 w-full">
        <div className="w-full flex flex-col gap-4">
          <div className="flex flex-row justify-between items-center">
            <Heading className="font-bold text-palette-primary-dark" level={4}>
              {location.name}
            </Heading>
            {distance && (
              <div className="font-body-fontFamily font-body-sm-fontWeight text-body-sm-fontSize">
                {t("distanceInUnit", `${distanceInMiles} mi`, {
                  distanceInMiles,
                  distanceInKilometers,
                })}
              </div>
            )}
          </div>
          {location.hours && (
            <div className="font-body-fontFamily text-body-fontSize gap-8">
              <HoursStatus
                hours={location.hours}
                timezone={location.timezone}
              />
            </div>
          )}
          {location.mainPhone && (
            <a
              href={location.mainPhone}
              // onClick={handlePhoneNumberClick}
              className="components h-fit w-fit underline decoration-0 hover:no-underline font-link-fontFamily text-link-fontSize tracking-link-letterSpacing text-palette-primary-dark"
            >
              {formatPhoneNumber(
                location.mainPhone,
                location.mainPhone.slice(0, 2) === "+1"
                  ? "domestic"
                  : "international"
              )}
            </a>
          )}
          <div className="flex flex-col gap-1 w-full">
            {location.address && (
              <div className="font-body-fontFamily font-body-fontWeight text-body-md-fontSize gap-4">
                <Address
                  address={location.address}
                  lines={[
                    ["line1"],
                    ["line2"],
                    ["city", "region", "postalCode"],
                  ]}
                />
              </div>
            )}
            {location.yextDisplayCoordinate && (
              <a
                href={getGoogleMapsLink(
                  location.yextDisplayCoordinate || {
                    latitude: 0,
                    longitude: 0,
                  }
                )}
                // onClick={handleGetDirectionsClick}
                className="components h-fit items-center w-fit underline gap-2 decoration-0 hover:no-underline font-link-fontFamily text-link-fontSize tracking-link-letterSpacing flex font-bold text-palette-primary-dark"
              >
                {t("getDirections", "Get Directions")}
                <FaAngleRight size={"12px"} />
              </a>
            )}
          </div>
        </div>
        <Button asChild className="basis-full" variant="primary">
          <a
            href={resolvedUrl} // onClick={handleVisitPageClick}
          >
            {t("visitPage", "Visit Page")}
          </a>
        </Button>
      </div>
    </Background>
  );
};

const TestLocatorCardSectionComponent = ({
  puck,
}: WithPuckProps<TestLocatorCardSectionProps>) => {
  const { t } = useTranslation();
  const streamDocument = useDocument<Location>();

  // Create 3 results using the same actual location from the document
  const results = [
    createResult(streamDocument, 1),
    createResult(streamDocument, 2),
    createResult(streamDocument, 3),
  ];

  const resultCount = results.length;
  const searchQuery = streamDocument.address?.city || "Location";

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
            <LocationCard key={index} result={result} puck={puck} />
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
 */
export const TestLocatorCardSection: ComponentConfig<{
  props: TestLocatorCardSectionProps;
}> = {
  label: msg("components.testLocatorCardSection", "Test Locator Card Section"),
  fields: testLocatorCardSectionFields,
  defaultProps: {
    styles: {},
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
      iconSize="md"
    >
      <TestLocatorCardSectionComponent {...props} />
    </VisibilityWrapper>
  ),
};
