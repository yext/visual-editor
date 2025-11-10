import React from "react";
import { useTranslation } from "react-i18next";
import { PuckContext } from "@measured/puck";
import {
  CardProps,
  Coordinate,
  useCardAnalyticsCallback,
} from "@yext/search-ui-react";
import {
  Background,
  backgroundColors,
  Button,
  Heading,
  useTemplateProps,
  resolveUrlTemplateOfChild,
  mergeMeta,
  HoursStatusAtom,
} from "@yext/visual-editor";
import {
  Address,
  AddressType,
  getDirections,
  HoursType,
  ListingType,
} from "@yext/pages-components";
import { FaAngleRight } from "react-icons/fa";
import { formatPhoneNumber } from "./atoms/phone.js";

// Keep only digits and at most one leading plus for tel: links.
// If the input already starts with "tel:", return it as-is.
function sanitizePhoneForTelHref(rawPhone?: string): string | undefined {
  if (!rawPhone) {
    return undefined;
  }
  if (rawPhone.startsWith("tel:")) {
    return rawPhone;
  }

  // Remove any '+' that is not the leading character and strip non-digits.
  const cleaned = rawPhone.replace(/(?!^\+)\+|[^\d+]/g, "");
  return `tel:${cleaned}`;
}

export interface Location {
  address: AddressType;
  hours?: HoursType;
  id: string;
  mainPhone?: string;
  name: string;
  neighborhood?: string;
  slug?: string;
  timezone: string;
  yextDisplayCoordinate?: Coordinate;
  ref_listings?: ListingType[];
}

export const LocatorResultCard = React.memo(
  ({
    result,
    puck,
  }: {
    result: CardProps<Location>["result"];
    puck: PuckContext;
  }): React.JSX.Element => {
    const { document: streamDocument, relativePrefixToRoot } =
      useTemplateProps();
    const { t } = useTranslation();

    const location = result.rawData;
    const distance = result.distance;

    const distanceInMiles = distance
      ? (distance / 1609.344).toFixed(1)
      : undefined;
    const distanceInKilometers = distance
      ? (distance / 1000).toFixed(1)
      : undefined;

    const handleGetDirectionsClick = useCardAnalyticsCallback(
      result,
      "DRIVING_DIRECTIONS"
    );
    const handleVisitPageClick = useCardAnalyticsCallback(
      result,
      "VIEW_WEBSITE"
    );
    const handlePhoneNumberClick = useCardAnalyticsCallback(
      result,
      "TAP_TO_CALL"
    );

    const resolvedUrl = resolveUrlTemplateOfChild(
      mergeMeta(location, streamDocument),
      relativePrefixToRoot,
      puck.metadata?.resolveUrlTemplate
    );

    const formattedPhoneNumber = location.mainPhone
      ? formatPhoneNumber(
          location.mainPhone,
          location.mainPhone.slice(0, 2) === "+1" ? "domestic" : "international"
        )
      : null;

    const telHref = sanitizePhoneForTelHref(location.mainPhone);

    const getDirectionsLink: string | undefined = (() => {
      const listings = location.ref_listings ?? [];
      const listingsLink = getDirections(
        undefined,
        listings,
        undefined,
        { provider: "google" },
        undefined
      );
      const coordinateLink = getDirections(
        undefined,
        undefined,
        undefined,
        { provider: "google" },
        location.yextDisplayCoordinate
      );

      return listingsLink || coordinateLink;
    })();

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
              <Heading
                className="font-bold text-palette-primary-dark"
                level={4}
              >
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
                <HoursStatusAtom
                  hours={location.hours}
                  timezone={location.timezone}
                  className="text-body-fontSize"
                  boldCurrentStatus={false}
                />
              </div>
            )}
            {location.mainPhone && (
              <a
                href={telHref}
                onClick={handlePhoneNumberClick}
                className="components h-fit w-fit underline decoration-0 hover:no-underline font-link-fontFamily text-link-fontSize tracking-link-letterSpacing text-palette-primary-dark"
              >
                {formattedPhoneNumber}
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
              {getDirectionsLink && (
                <a
                  href={getDirectionsLink}
                  onClick={handleGetDirectionsClick}
                  className="components h-fit items-center w-fit underline gap-2 decoration-0 hover:no-underline font-link-fontFamily text-link-fontSize tracking-link-letterSpacing flex font-bold text-palette-primary-dark"
                >
                  {t("getDirections", "Get Directions")}
                  <FaAngleRight size={"12px"} />
                </a>
              )}
            </div>
          </div>
          <Button asChild className="basis-full" variant="primary">
            <a href={resolvedUrl} onClick={handleVisitPageClick}>
              {t("visitPage", "Visit Page")}
            </a>
          </Button>
        </div>
      </Background>
    );
  }
);
