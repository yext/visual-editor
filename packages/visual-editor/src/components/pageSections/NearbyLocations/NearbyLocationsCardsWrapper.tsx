import * as React from "react";
import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import { useQuery } from "@tanstack/react-query";
import { Coordinate } from "@yext/pages-components";
import {
  backgroundColors,
  BackgroundStyle,
  Body,
  HeadingLevel,
  msg,
  resolveComponentData,
  useDocument,
  YextEntityField,
  YextField,
} from "@yext/visual-editor";
import { parseDocument, fetchNearbyLocations } from "./utils";
import { NearbyLocationCard } from "./NearbyLocationCard";

export type NearbyLocationCardsWrapperProps = {
  /** The search parameters for finding nearby locations. */
  data: {
    /**
     * The central coordinate (`latitude`, `longitude`) to search from.
     * @defaultValue 'yextDisplayCoordinate' field
     */
    coordinate: YextEntityField<Coordinate>;

    /**
     * The search radius in miles.
     * @defaultValue 10
     */
    radius: number;

    /**
     * The maximum number of locations to find and display.
     * @defaultValue 3
     */
    limit: number;
  };

  /** Styling for the individual location cards. */
  styles: {
    /** The card background color. */
    backgroundColor?: BackgroundStyle;

    /** The heading level for the card title. */
    headingLevel?: HeadingLevel;

    phone: {
      /**
       * The display format for phone numbers on the cards.
       * @defaultValue 'domestic'
       */
      phoneNumberFormat: "domestic" | "international";

      /**
       * If `true`, wraps phone numbers in a clickable `tel:` hyperlink.
       * @defaultValue false
       */
      phoneNumberLink: boolean;
    };

    /** Styling for the hours display on each card. */
    hours: {
      /** Whether to display the current status ("Open Now" or "Closed") */
      showCurrentStatus: boolean;
      timeFormat?: "12h" | "24h";
      /** How to format the days of the week (short:Mon, long:Monday) */
      dayOfWeekFormat?: "short" | "long";
      /** Whether to include the day of the week */
      showDayNames?: boolean;
    };
  };

  /** @internal */
  sectionHeadingLevel?: HeadingLevel;
};

const nearbyLocationCardsWrapperFields: Fields<NearbyLocationCardsWrapperProps> =
  {
    data: YextField(msg("fields.data", "Data"), {
      type: "object",
      objectFields: {
        coordinate: YextField<any, Coordinate>(
          msg("fields.coordinates", "Coordinates"),
          {
            type: "entityField",
            filter: { types: ["type.coordinate"] },
          }
        ),
        radius: YextField(msg("fields.radiusMiles", "Radius (Miles)"), {
          type: "number",
          min: 0,
        }),
        limit: YextField(msg("fields.limit", "Limit"), {
          type: "number",
          min: 1,
          max: 50,
        }),
      },
    }),
    styles: YextField(msg("fields.styles", "styles"), {
      type: "object",
      objectFields: {
        backgroundColor: YextField(
          msg("fields.backgroundColor", "Background Color"),
          {
            type: "select",
            options: "BACKGROUND_COLOR",
          }
        ),
        headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
          type: "select",
          hasSearch: true,
          options: "HEADING_LEVEL",
        }),
        phone: YextField(msg("fields.phone", "Phone"), {
          type: "object",
          objectFields: {
            phoneNumberFormat: YextField(
              msg("fields.phoneNumberFormat", "Phone Number Format"),
              {
                type: "radio",
                options: "PHONE_OPTIONS",
              }
            ),
            phoneNumberLink: YextField(
              msg("fields.includePhoneHyperlink", "Include Phone Hyperlink"),
              {
                type: "radio",
                options: [
                  { label: msg("fields.options.yes", "Yes"), value: true },
                  { label: msg("fields.options.no", "No"), value: false },
                ],
              }
            ),
          },
        }),
        hours: YextField(msg("fields.hours", "Hours"), {
          type: "object",
          objectFields: {
            showCurrentStatus: YextField(
              msg("fields.showCurrentStatus", "Show Current Status"),
              {
                type: "radio",
                options: [
                  { label: msg("fields.options.yes", "Yes"), value: true },
                  { label: msg("fields.options.no", "No"), value: false },
                ],
              }
            ),
            timeFormat: YextField(msg("fields.timeFormat", "Time Format"), {
              type: "radio",
              options: [
                {
                  label: msg("fields.options.hour12", "12-hour"),
                  value: "12h",
                },
                {
                  label: msg("fields.options.hour24", "24-hour"),
                  value: "24h",
                },
              ],
            }),
            showDayNames: YextField(
              msg("fields.showDayNames", "Show Day Names"),
              {
                type: "radio",
                options: [
                  { label: msg("fields.options.yes", "Yes"), value: true },
                  { label: msg("fields.options.no", "No"), value: false },
                ],
              }
            ),
            dayOfWeekFormat: YextField(
              msg("fields.dayOfWeekFormat", "Day of Week Format"),
              {
                type: "radio",
                options: [
                  {
                    label: msg("fields.options.short", "Short"),
                    value: "short",
                  },
                  {
                    label: msg("fields.options.long", "Long"),
                    value: "long",
                  },
                ],
              }
            ),
          },
        }),
      },
    }),
  };

const NearbyLocationCardsWrapperComponent: PuckComponent<
  NearbyLocationCardsWrapperProps
> = (props) => {
  const { data, puck, styles, sectionHeadingLevel, id } = props;
  const streamDocument = useDocument();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const coordinate = resolveComponentData(
    data?.coordinate,
    locale,
    streamDocument
  );

  // parse variables from streamDocument
  const {
    businessId,
    entityId,
    apiKey,
    contentEndpointId,
    contentDeliveryAPIDomain,
  }: {
    businessId: string;
    entityId: string;
    apiKey: string;
    contentEndpointId: string;
    contentDeliveryAPIDomain: string;
  } = React.useMemo(
    () => parseDocument(streamDocument, puck.metadata?.contentEndpointIdEnvVar),
    [streamDocument, puck.metadata?.contentEndpointIdEnvVar]
  );

  const enableNearbyLocations =
    !!businessId &&
    !!entityId &&
    !!apiKey &&
    !!contentEndpointId &&
    !!contentDeliveryAPIDomain &&
    coordinate?.latitude !== undefined &&
    coordinate?.longitude !== undefined &&
    !!data?.radius &&
    !!data?.limit;

  const { data: nearbyLocationsData, status: nearbyLocationsStatus } = useQuery(
    {
      queryKey: [
        "NearbyLocations",
        businessId,
        entityId,
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
          entityId: entityId,
          apiKey: apiKey,
          contentEndpointId: contentEndpointId,
          contentDeliveryAPIDomain: contentDeliveryAPIDomain,
          latitude: coordinate?.latitude || 0,
          longitude: coordinate?.longitude || 0,
          radiusMi: data?.radius,
          limit: data?.limit,
          locale: i18n.language,
        });
      },
      enabled: enableNearbyLocations,
    }
  );

  // Show loading state when query is pending
  if (nearbyLocationsStatus === "pending") {
    return (
      <Body data-loading="true">
        {t("loadingNearbyLocations", "Loading nearby locations...")}
      </Body>
    );
  }

  // do not render the component if there's no data or it's not enabled
  if (!enableNearbyLocations || !nearbyLocationsData?.response?.docs?.length) {
    // Return a marker element so parent can detect empty state
    if (puck.isEditing) {
      return <div data-empty-state="true" style={{ display: "none" }} />;
    }
    return <></>;
  }

  return (
    <>
      {nearbyLocationsStatus === "success" &&
        !!nearbyLocationsData?.response?.docs && (
          <div
            className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch"
            id={id + "-wrapper"}
          >
            {nearbyLocationsData.response.docs.map(
              (location: any, index: number) => (
                <NearbyLocationCard
                  key={index}
                  cardNumber={index}
                  styles={styles}
                  locationData={location}
                  puck={puck}
                  sectionHeadingLevel={sectionHeadingLevel}
                />
              )
            )}
          </div>
        )}
    </>
  );
};

export const defaultNearbyLocationsCardsProps: NearbyLocationCardsWrapperProps =
  {
    data: {
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
      headingLevel: 3,
      hours: {
        showCurrentStatus: true,
        timeFormat: "12h",
        showDayNames: true,
        dayOfWeekFormat: "long",
      },
      phone: {
        phoneNumberFormat: "domestic",
        phoneNumberLink: true,
      },
    },
  };

export const NearbyLocationCardsWrapper: ComponentConfig<{
  props: NearbyLocationCardsWrapperProps;
}> = {
  label: msg("slots.nearbyLocationCards", "Nearby Location Cards"),
  fields: nearbyLocationCardsWrapperFields,
  defaultProps: defaultNearbyLocationsCardsProps,
  render: (props) => <NearbyLocationCardsWrapperComponent {...props} />,
};
