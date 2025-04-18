import { ComponentConfig, Fields } from "@measured/puck";
import {
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  Heading,
  BackgroundStyle,
  backgroundColors,
  HeadingLevel,
  PageSection,
  PhoneAtom,
  fetchNearbyLocations,
  Background,
  YextField,
  VisibilityWrapper,
} from "@yext/visual-editor";
import { useQuery } from "@tanstack/react-query";
import { Address, Coordinate, HoursStatus } from "@yext/pages-components";
import * as React from "react";

export interface NearbyLocationsSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
  };
  heading: {
    level: HeadingLevel;
    text: YextEntityField<string>;
  };
  cards: {
    headingLevel: HeadingLevel;
    phoneNumberFormat: "domestic" | "international";
    phoneNumberLink: boolean;
    hours: {
      showCurrentStatus: boolean;
      timeFormat?: "12h" | "24h";
      dayOfWeekFormat?: "short" | "long";
      showDayNames?: boolean;
    };
  };
  coordinate: YextEntityField<Coordinate>;
  radius: number;
  limit: number;
  liveVisibility: boolean;
}

const nearbyLocationsSectionFields: Fields<NearbyLocationsSectionProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      cardBackgroundColor: YextField("Card Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
    },
  }),
  heading: YextField("Section Heading", {
    type: "object",
    objectFields: {
      text: YextField<any, string>("Text", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      level: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  cards: YextField("Cards", {
    type: "object",
    objectFields: {
      headingLevel: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      hours: YextField("Hours", {
        type: "object",
        objectFields: {
          showCurrentStatus: YextField("Show Current Status", {
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          }),
          timeFormat: YextField("Time Format", {
            type: "radio",
            options: [
              { label: "12-hour", value: "12h" },
              { label: "24-hour", value: "24h" },
            ],
          }),
          showDayNames: YextField("Show Day Names", {
            type: "radio",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          }),
          dayOfWeekFormat: YextField("Day of Week Format", {
            type: "radio",
            options: [
              { label: "Short", value: "short" },
              { label: "Long", value: "long" },
            ],
          }),
        },
      }),
      phoneNumberFormat: YextField("Phone Number Format", {
        type: "radio",
        options: "PHONE_OPTIONS",
      }),
      phoneNumberLink: YextField("Include Phone Hyperlink", {
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      }),
    },
  }),
  coordinate: YextField<any, Coordinate>("Coordinates", {
    type: "entityField",
    filter: { types: ["type.coordinate"] },
  }),
  radius: YextField("Radius (Miles)", {
    type: "number",
    min: 0,
  }),
  limit: YextField("Limit", {
    type: "number",
    min: 0,
    max: 50,
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const LocationCard = ({
  cards,
  name,
  address,
  hours,
  timezone,
  mainPhone,
  backgroundColor,
}: {
  cards: NearbyLocationsSectionProps["cards"];
  name: string;
  address: any;
  hours: any;
  timezone: string;
  mainPhone: string;
  backgroundColor?: BackgroundStyle;
}) => {
  return (
    <Background
      background={backgroundColor}
      className="flex flex-col flew-grow h-full rounded-lg overflow-hidden border p-6 sm:p-8"
      as="section"
    >
      <Heading level={cards.headingLevel}>{name}</Heading>
      {hours && (
        <div className="mb-2 font-semibold font-body-fontFamily text-body-fontSize">
          <HoursStatus
            hours={hours}
            timezone={timezone}
            currentTemplate={
              cards.hours.showCurrentStatus ? undefined : () => <></>
            }
            separatorTemplate={
              cards.hours.showCurrentStatus ? undefined : () => <></>
            }
            timeOptions={{
              hour12: cards.hours.timeFormat === "12h",
            }}
            dayOptions={{
              weekday: cards.hours.dayOfWeekFormat,
            }}
            dayOfWeekTemplate={
              cards.hours.showDayNames ? undefined : () => <></>
            }
            className="h-full"
          />
        </div>
      )}
      {mainPhone && (
        <PhoneAtom
          phoneNumber={mainPhone}
          format={cards.phoneNumberFormat}
          includeHyperlink={cards.phoneNumberLink}
        />
      )}
      {address && (
        <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize-sm">
          <Address
            address={address}
            lines={[
              ["line1"],
              ["line2"],
              ["city", ",", "region", "postalCode"],
            ]}
          />
        </div>
      )}
    </Background>
  );
};

const NearbyLocationsComponent: React.FC<NearbyLocationsSectionProps> = (
  props
) => {
  const {
    heading,
    cards,
    coordinate: coordinateField,
    radius,
    limit,
    styles,
  } = props;
  const document = useDocument<any>();

  const coordinate = resolveYextEntityField<Coordinate>(
    document,
    coordinateField
  );
  const headingText = resolveYextEntityField<string>(document, heading.text);

  const contentEndpoint: string = document?._env?.YEXT_CONTENT_ENDPOINT;
  if (!contentEndpoint) {
    console.warn(
      "Missing YEXT_CONTENT_ENDPOINT! Unable to fetch nearby locations."
    );
    return <></>;
  }

  const entityType: string = document?.meta?.entityType?.id || "location";
  const { data: nearbyLocationsData, status: nearbyLocationsStatus } = useQuery(
    {
      queryKey: [
        "NearbyLocations",
        coordinate?.latitude,
        coordinate?.longitude,
        radius,
        entityType,
        limit,
      ],
      queryFn: async () => {
        return await fetchNearbyLocations({
          contentEndpoint: contentEndpoint,
          latitude: coordinate?.latitude || 0,
          longitude: coordinate?.longitude || 0,
          radiusMi: radius,
          limit: limit,
          entityType: entityType,
        });
      },
      enabled:
        !!coordinate?.latitude &&
        !!coordinate.longitude &&
        !!radius &&
        !!contentEndpoint &&
        !!entityType,
    }
  );

  return (
    <PageSection background={styles.backgroundColor}>
      <div className="space-y-6">
        {headingText && (
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
            <Heading level={heading.level} className="text-center md:text-left">
              {headingText}
            </Heading>
          </div>
        )}

        {nearbyLocationsStatus === "success" &&
          !!nearbyLocationsData?.response?.docs && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {nearbyLocationsData.response.docs.map(
                (location: any, index: number) => (
                  <LocationCard
                    key={index}
                    cards={cards}
                    name={location.name}
                    address={location.address}
                    hours={location.hours}
                    timezone={location.timezone}
                    mainPhone={location.mainPhone}
                    backgroundColor={styles.cardBackgroundColor}
                  />
                )
              )}
            </div>
          )}
      </div>
    </PageSection>
  );
};

export const NearbyLocationsSection: ComponentConfig<NearbyLocationsSectionProps> =
  {
    label: "Nearby Locations Section",
    fields: nearbyLocationsSectionFields,
    defaultProps: {
      styles: {
        backgroundColor: backgroundColors.background1.value,
        cardBackgroundColor: backgroundColors.background1.value,
      },
      heading: {
        text: {
          field: "",
          constantValue: "Nearby Locations",
          constantValueEnabled: true,
        },
        level: 3,
      },
      cards: {
        headingLevel: 4,
        hours: {
          showCurrentStatus: true,
          timeFormat: "12h",
          showDayNames: true,
          dayOfWeekFormat: "long",
        },
        phoneNumberFormat: "domestic",
        phoneNumberLink: false,
      },
      radius: 10,
      limit: 3,
      coordinate: {
        field: "yextDisplayCoordinate",
        constantValue: {
          latitude: 0,
          longitude: 0,
        },
      },
      liveVisibility: true,
    },
    render: (props) => (
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <NearbyLocationsComponent {...props} />
      </VisibilityWrapper>
    ),
  };
