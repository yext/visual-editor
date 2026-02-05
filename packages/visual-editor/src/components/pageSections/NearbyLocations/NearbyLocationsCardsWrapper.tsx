import * as React from "react";
import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { useQuery } from "@tanstack/react-query";
import {
  backgroundColors,
  BackgroundStyle,
  HeadingLevel,
} from "../../../utils/themeConfigOptions.ts";
import { Body } from "../../atoms/body.tsx";
import {
  msg,
  pt,
  usePlatformTranslation,
} from "../../../utils/i18n/platform.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import {
  getPreferredDistanceUnit,
  toKilometers,
} from "../../../utils/i18n/distance.ts";
import { parseDocument, fetchNearbyLocations } from "./utils.ts";
import { NearbyLocationCard } from "./NearbyLocationCard.tsx";
import { useTemplateMetadata } from "../../../internal/hooks/useMessageReceivers.ts";
import { MapPinOff } from "lucide-react";
import { updateFields } from "../HeroSection.tsx";

export type NearbyLocationCardsWrapperProps = {
  /** The search parameters for finding nearby locations. */
  data: {
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

    /** Styling for the phone display on each card. */
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

    /**
     * Whether to show the location's hours on the card.
     * @defaultValue true
     */
    showHours: boolean;

    /**
     * Whether to show the location's phone on the card.
     * @defaultValue true
     */
    showPhone: boolean;

    /**
     * Whether to show the location's address on the card.
     * @defaultValue true
     */
    showAddress: boolean;
  };

  /** @internal */
  sectionHeadingLevel?: HeadingLevel;
};

const nearbyLocationCardsWrapperFields: Fields<NearbyLocationCardsWrapperProps> =
  {
    data: YextField(msg("fields.data", "Data"), {
      type: "object",
      objectFields: {
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
    styles: YextField(msg("fields.styles", "Styles"), {
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
        showHours: YextField(msg("fields.showHours", "Show Hours"), {
          type: "radio",
          options: "SHOW_HIDE",
        }),
        showPhone: YextField(msg("fields.showPhone", "Show Phone"), {
          type: "radio",
          options: "SHOW_HIDE",
        }),
        showAddress: YextField(msg("fields.showAddress", "Show Address"), {
          type: "radio",
          options: "SHOW_HIDE",
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
    {
      field: "yextDisplayCoordinate",
      constantValue: {
        latitude: 0,
        longitude: 0,
      },
      constantValueEnabled: false,
    },
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

  // Show loading state only when query is enabled and pending
  if (enableNearbyLocations && nearbyLocationsStatus === "pending") {
    return (
      <Body data-loading="true">
        {t("loadingNearbyLocations", "Loading nearby locations...")}
      </Body>
    );
  }

  // Render an empty state if no nearby locations are found
  // The parent component will hide the entire section if it is the live page
  if (!enableNearbyLocations || !nearbyLocationsData?.response?.docs?.length) {
    if (puck.isEditing) {
      return <NearbyLocationsEmptyState radius={data.radius} />;
    } else {
      return <div data-empty-state="true" />;
    }
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
      showHours: true,
      showPhone: true,
      showAddress: true,
    },
  };

export const NearbyLocationCardsWrapper: ComponentConfig<{
  props: NearbyLocationCardsWrapperProps;
}> = {
  label: msg("slots.nearbyLocationCards", "Nearby Location Cards"),
  fields: nearbyLocationCardsWrapperFields,
  defaultProps: defaultNearbyLocationsCardsProps,
  resolveFields: (data) => {
    let fields = nearbyLocationCardsWrapperFields;

    if (!data.props.styles.showHours) {
      fields = updateFields(fields, ["styles.hours.visible"], false);
    }

    if (!data.props.styles.showPhone) {
      fields = updateFields(fields, ["styles.phone.visible"], false);
    }
    return fields;
  },
  render: (props) => <NearbyLocationCardsWrapperComponent {...props} />,
};

/** @internal */
const NearbyLocationsEmptyState: React.FC<{
  radius?: number;
}> = ({ radius }) => {
  const templateMetadata = useTemplateMetadata();
  const entityTypeDisplayName =
    templateMetadata?.entityTypeDisplayName?.toLowerCase();

  const { i18n } = usePlatformTranslation();

  const unit = getPreferredDistanceUnit(i18n.language);
  const distance =
    unit === "mile" ? (radius ?? 10) : toKilometers(radius ?? 10);

  return (
    <div
      data-empty-state="true"
      className="relative h-[300px] w-full bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center py-8 gap-2.5"
    >
      <MapPinOff className="w-12 h-12 text-gray-400" />
      <div className="flex flex-col items-center gap-0">
        <Body variant="base" className="text-gray-500 font-medium">
          {pt(
            "nearbyLocationsEmptyStateSectionHidden",
            "Section hidden for this {{entityType}}",
            {
              entityType: entityTypeDisplayName
                ? entityTypeDisplayName
                : "page",
            }
          )}
        </Body>
        <Body variant="base" className="text-gray-500 font-normal">
          {pt("nearbyLocationsEmptyState", {
            entityType: entityTypeDisplayName
              ? entityTypeDisplayName
              : "entity",
            radius: distance,
            unit: pt(unit, { count: distance }),
          })}
        </Body>
      </div>
    </div>
  );
};
