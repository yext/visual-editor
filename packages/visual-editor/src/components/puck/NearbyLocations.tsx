import { ComponentConfig, Fields } from "@measured/puck";
import {
  resolveYextEntityField,
  useDocument,
  YextEntityField,
  YextEntityFieldSelector,
  Heading,
  BackgroundStyle,
  BasicSelector,
  backgroundColors,
  ThemeOptions,
  HeadingLevel,
  Section,
  Phone,
  fetchNearbyLocations,
} from "../../index.js";
import { useQuery } from "@tanstack/react-query";
import { Address, Coordinate, HoursStatus } from "@yext/pages-components";
import * as React from "react";

export interface NearbyLocationsProps {
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
}

const nearbyLocationsFields: Fields<NearbyLocationsProps> = {
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      backgroundColor: BasicSelector(
        "Background Color",
        ThemeOptions.BACKGROUND_COLOR
      ),
      cardBackgroundColor: BasicSelector(
        "Card Background Color",
        ThemeOptions.BACKGROUND_COLOR
      ),
    },
  },
  heading: {
    label: "Section Heading",
    type: "object",
    objectFields: {
      text: YextEntityFieldSelector({
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      }),
      level: BasicSelector("Heading Level", ThemeOptions.HEADING_LEVEL),
    },
  },
  cards: {
    label: "Cards",
    type: "object",
    objectFields: {
      headingLevel: BasicSelector("Heading Level", ThemeOptions.HEADING_LEVEL),
      hours: {
        label: "Hours",
        type: "object",
        objectFields: {
          showCurrentStatus: {
            type: "radio",
            label: "Show Current Status",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          timeFormat: {
            type: "radio",
            label: "Time Format",
            options: [
              { label: "12-hour", value: "12h" },
              { label: "24-hour", value: "24h" },
            ],
          },
          showDayNames: {
            type: "radio",
            label: "Show Day Names",
            options: [
              { label: "Yes", value: true },
              { label: "No", value: false },
            ],
          },
          dayOfWeekFormat: BasicSelector("Day of Week Format", [
            { label: "Short", value: "short" },
            { label: "Long", value: "long" },
          ]),
        },
      },
      phoneNumberFormat: {
        label: "Phone Number Format",
        type: "radio",
        options: [
          { label: "Domestic", value: "domestic" },
          { label: "International", value: "international" },
        ],
      },
      phoneNumberLink: {
        label: "Include Phone Number Hyperlink",
        type: "radio",
        options: [
          { label: "Yes", value: true },
          { label: "No", value: false },
        ],
      },
    },
  },
  coordinate: YextEntityFieldSelector<any, Coordinate>({
    label: "Coordinates",
    filter: { types: ["type.coordinate"] },
  }),
  radius: {
    label: "Radius (Miles)",
    type: "number",
    min: 0,
  },
  limit: {
    label: "Limit",
    type: "number",
    min: 0,
    max: 50,
  },
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
  cards: NearbyLocationsProps["cards"];
  name: string;
  address: any;
  hours: any;
  timezone: string;
  mainPhone: string;
  backgroundColor?: BackgroundStyle;
}) => {
  return (
    <div className="flex flex-col flew-grow h-full rounded-lg overflow-hidden border">
      <Section background={backgroundColor} className={`components`}>
        <Heading level={4}>{name}</Heading>
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
          <Phone
            phoneNumber={mainPhone}
            format={cards.phoneNumberFormat}
            includeHyperlink={cards.phoneNumberLink}
          />
        )}
        {address && (
          <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize-sm">
            <Address address={address} lines={[["line1"]]} />
          </div>
        )}
      </Section>
    </div>
  );
};

const NearbyLocationsComponent: React.FC<NearbyLocationsProps> = (props) => {
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

  const contentEndpoint: string = document?._env?.YEXT_CONTENT_API_KEY;
  if (!contentEndpoint) {
    console.warn(
      "Missing YEXT_CONTENT_ENDPOINT! Unable to fetch nearby locations."
    );
  }

  const entityType: string = document?.meta?.entityType?.id || "location";
  const { data: nearbyLocationsData, status: nearbyLocationsStatus } = useQuery(
    {
      queryKey: [
        "NearbyLocations",
        coordinate?.latitude,
        coordinate?.longitude,
        radius,
        coordinateField.field,
        entityType,
        limit,
      ],
      queryFn: async () => {
        return await fetchNearbyLocations({
          contentEndpoint: contentEndpoint,
          latitude: coordinate?.latitude || 0,
          longitude: coordinate?.longitude || 0,
          radiusMi: radius,
          coordinateField: coordinateField.field,
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
    <Section background={styles.backgroundColor} className={`components`}>
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
    </Section>
  );
};

export const NearbyLocations: ComponentConfig<NearbyLocationsProps> = {
  label: "Nearby Locations",
  fields: nearbyLocationsFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background2.value,
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
  },
  render: (props) => <NearbyLocationsComponent {...props} />,
};
