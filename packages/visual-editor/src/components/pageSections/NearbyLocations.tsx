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
  data: {
    heading: YextEntityField<string>;
    coordinate: YextEntityField<Coordinate>;
    radius: number;
    limit: number;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    headingLevel: HeadingLevel;
    cardHeadingLevel: HeadingLevel;
    phoneNumberFormat: "domestic" | "international";
    phoneNumberLink: boolean;
    hours: {
      showCurrentStatus: boolean;
      timeFormat?: "12h" | "24h";
      dayOfWeekFormat?: "short" | "long";
      showDayNames?: boolean;
    };
  };
  liveVisibility: boolean;
  contentEndpointEnvVar?: string; // to be set via withPropOverrides
}

const nearbyLocationsSectionFields: Fields<NearbyLocationsSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<any, string>("Heading", {
        type: "entityField",
        filter: {
          types: ["type.string"],
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
    },
  }),
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
      headingLevel: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      cardHeadingLevel: YextField("Card Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
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
    },
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
  styles,
  name,
  hours,
  address,
  timezone,
  mainPhone,
}: {
  styles: NearbyLocationsSectionProps["styles"];
  name: string;
  hours: any;
  address: any;
  timezone: string;
  mainPhone: string;
}) => {
  return (
    <Background
      background={styles?.cardBackgroundColor}
      className="flex flex-col flew-grow h-full rounded-lg overflow-hidden border p-6 sm:p-8"
      as="section"
    >
      <Heading level={styles?.cardHeadingLevel}>{name}</Heading>
      {hours && (
        <div className="mb-2 font-semibold font-body-fontFamily text-body-fontSize">
          <HoursStatus
            hours={hours}
            timezone={timezone}
            currentTemplate={
              styles?.hours?.showCurrentStatus ? undefined : () => <></>
            }
            separatorTemplate={
              styles?.hours?.showCurrentStatus ? undefined : () => <></>
            }
            timeOptions={{
              hour12: styles?.hours?.timeFormat === "12h",
            }}
            dayOptions={{
              weekday: styles?.hours?.dayOfWeekFormat,
            }}
            dayOfWeekTemplate={
              styles?.hours?.showDayNames ? undefined : () => <></>
            }
            className="h-full"
          />
        </div>
      )}
      {mainPhone && (
        <PhoneAtom
          phoneNumber={mainPhone}
          format={styles?.phoneNumberFormat}
          includeHyperlink={styles?.phoneNumberLink}
          includeIcon={false}
        />
      )}
      {address && (
        <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
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

const NearbyLocationsComponent: React.FC<NearbyLocationsSectionProps> = ({
  styles,
  data,
  contentEndpointEnvVar,
}: NearbyLocationsSectionProps) => {
  const document = useDocument<any>();
  const coordinate = resolveYextEntityField<Coordinate>(
    document,
    data?.coordinate
  );
  const headingText = resolveYextEntityField<string>(document, data?.heading);

  // parse variables from document
  const { businessId, apiKey, contentEndpointId, contentDeliveryAPIDomain } =
    parseDocument(document, contentEndpointEnvVar);

  const { data: nearbyLocationsData, status: nearbyLocationsStatus } = useQuery(
    {
      queryKey: [
        "NearbyLocations",
        businessId,
        apiKey,
        contentEndpointId,
        contentDeliveryAPIDomain,
        coordinate?.latitude,
        coordinate?.longitude,
        data?.radius,
        data?.limit,
      ],
      queryFn: async () => {
        return await fetchNearbyLocations({
          businessId: businessId,
          apiKey: apiKey,
          contentEndpointId: contentEndpointId,
          contentDeliveryAPIDomain: contentDeliveryAPIDomain,
          latitude: coordinate?.latitude || 0,
          longitude: coordinate?.longitude || 0,
          radiusMi: data?.radius,
          limit: data?.limit,
        });
      },
      enabled:
        !!businessId &&
        !!apiKey &&
        !!contentEndpointId &&
        !!contentDeliveryAPIDomain &&
        !!coordinate?.latitude &&
        !!coordinate.longitude &&
        !!data?.radius &&
        !!data?.limit,
    }
  );

  return (
    <PageSection background={styles?.backgroundColor}>
      <div className="space-y-6">
        {headingText && (
          <div className="flex flex-col md:flex-row justify-between items-center md:items-start">
            <Heading
              level={styles?.headingLevel}
              className="text-center md:text-left"
            >
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
                    styles={styles}
                    name={location.name}
                    address={location.address}
                    hours={location.hours}
                    timezone={location.timezone}
                    mainPhone={location.mainPhone}
                  />
                )
              )}
            </div>
          )}
      </div>
    </PageSection>
  );
};

// parseDocument parses the document to get the businessId, apiKey, contentEndpointId, and contentDeliveryAPIDomain
function parseDocument(
  document: any,
  contentEndpointEnvVar?: string
): {
  businessId: string;
  apiKey: string;
  contentEndpointId: string;
  contentDeliveryAPIDomain: string;
} {
  // read businessId
  const businessId: string = document?.businessId;
  if (!businessId) {
    console.warn("Missing businessId! Unable to fetch nearby locations.");
  }

  // read API key
  const apiKey: string = document?._env?.YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY;
  if (!apiKey) {
    console.warn(
      "Missing YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY! Unable to fetch nearby locations."
    );
  }

  // parse contentEndpointId
  let contentEndpointId: string = "";
  if (document?._pageset) {
    try {
      const pagesetJson = JSON.parse(document?._pageset);
      contentEndpointId =
        pagesetJson?.typeConfig?.entityConfig?.contentEndpointId;
    } catch (e) {
      console.error("Failed to parse pageset from document. err=", e);
    }
  } else if (contentEndpointEnvVar) {
    contentEndpointId = document?._env?.[contentEndpointEnvVar];
  }
  if (!contentEndpointId) {
    console.warn(
      "Missing contentEndpointId! Unable to fetch nearby locations."
    );
  }

  // read contentDeliveryAPIDomain
  const contentDeliveryAPIDomain = document?._yext?.contentDeliveryAPIDomain;
  if (!contentDeliveryAPIDomain) {
    console.warn(
      "Missing contentDeliveryAPIDomain! Unable to fetch nearby locations."
    );
  }

  return {
    businessId: businessId,
    apiKey: apiKey,
    contentEndpointId: contentEndpointId,
    contentDeliveryAPIDomain: contentDeliveryAPIDomain,
  };
}

export const NearbyLocationsSection: ComponentConfig<NearbyLocationsSectionProps> =
  {
    label: "Nearby Locations Section",
    fields: nearbyLocationsSectionFields,
    defaultProps: {
      data: {
        heading: {
          field: "",
          constantValue: "Nearby Locations",
          constantValueEnabled: true,
        },
        coordinate: {
          field: "yextDisplayCoordinate",
          constantValue: {
            latitude: 0,
            longitude: 0,
          },
        },
        radius: 10,
        limit: 3,
      },
      styles: {
        backgroundColor: backgroundColors.background1.value,
        cardBackgroundColor: backgroundColors.background1.value,
        headingLevel: 3,
        cardHeadingLevel: 4,
        hours: {
          showCurrentStatus: true,
          timeFormat: "12h",
          showDayNames: true,
          dayOfWeekFormat: "long",
        },
        phoneNumberFormat: "domestic",
        phoneNumberLink: false,
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
