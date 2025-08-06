import {
  ComponentConfig,
  Fields,
  PuckContext,
  WithPuckProps,
} from "@measured/puck";
import {
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
  HoursStatusAtom,
  TranslatableString,
  msg,
  ThemeOptions,
  MaybeLink,
  resolveComponentData,
  Body,
  resolveUrlTemplate,
  useTemplateProps,
} from "@yext/visual-editor";
import { useQuery } from "@tanstack/react-query";
import {
  Address,
  Coordinate,
  AnalyticsScopeProvider,
  HoursType,
  AddressType,
} from "@yext/pages-components";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { StreamDocument } from "../../utils/applyTheme";

export interface NearbyLocationsData {
  /**
   * The main heading for the entire section.
   * @defaultValue "Nearby Locations" (constant)
   */
  heading: YextEntityField<TranslatableString>;

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
}

export interface NearbyLocationsStyles {
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };

  /** Styling for the individual location cards. */
  cards: {
    headingLevel: HeadingLevel;
    backgroundColor?: BackgroundStyle;
  };

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

  /** Styling for the hours display on each card. */
  hours: {
    showCurrentStatus: boolean;
    timeFormat?: "12h" | "24h";
    dayOfWeekFormat?: "short" | "long";
    showDayNames?: boolean;
  };
}

export interface NearbyLocationsSectionProps {
  /**
   * This object defines the search parameters for finding nearby locations.
   * @propCategory Data Props
   */
  data: NearbyLocationsData;

  /**
   * This object contains extensive properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: NearbyLocationsStyles;

  /** @internal */
  analytics?: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;

  /**  @internal */
  contentEndpointIdEnvVar?: string;
}

const nearbyLocationsSectionFields: Fields<NearbyLocationsSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>(
        msg("fields.heading", "Heading"),
        {
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        }
      ),
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
        min: 0,
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
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.level", "Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          align: YextField(msg("fields.headingAlign", "Heading Align"), {
            type: "radio",
            options: ThemeOptions.ALIGNMENT,
          }),
        },
      }),
      cards: YextField(msg("fields.cards", "Cards"), {
        type: "object",
        objectFields: {
          headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          backgroundColor: YextField(
            msg("fields.backgroundColor", "Background Color"),
            {
              type: "select",
              options: "BACKGROUND_COLOR",
            }
          ),
        },
      }),
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
              { label: msg("fields.options.hour12", "12-hour"), value: "12h" },
              { label: msg("fields.options.hour24", "24-hour"), value: "24h" },
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
                { label: msg("fields.options.short", "Short"), value: "short" },
                { label: msg("fields.options.long", "Long"), value: "long" },
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

const LocationCard = ({
  cardNumber,
  styles,
  name,
  hours,
  address,
  timezone,
  mainPhone,
  locationData,
  puck,
}: {
  cardNumber: number;
  styles: NearbyLocationsSectionProps["styles"];
  name: string;
  hours: HoursType;
  address: AddressType;
  timezone: string;
  mainPhone: string;
  locationData: any;
  puck: PuckContext;
}) => {
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();
  const { i18n } = useTranslation();
  const locale = i18n.language;

  const resolvedUrl = resolveUrlTemplate(
    streamDocument,
    locale,
    relativePrefixToRoot ?? "",
    locationData,
    puck.metadata?.resolveUrlTemplate
  );

  return (
    <Background
      background={styles?.cards.backgroundColor}
      className="flex flex-col flew-grow h-full rounded-lg overflow-hidden border p-6 sm:p-8"
      as="section"
    >
      <MaybeLink
        eventName={`link${cardNumber}`}
        alwaysHideCaret={true}
        className="mb-2"
        href={resolvedUrl}
      >
        <Heading
          level={styles?.cards.headingLevel}
          semanticLevelOverride={
            styles.heading.level < 6
              ? ((styles.heading.level + 1) as HeadingLevel)
              : "span"
          }
        >
          {name}
        </Heading>
      </MaybeLink>
      {hours && (
        <div className="mb-2 font-semibold font-body-fontFamily text-body-fontSize">
          <HoursStatusAtom
            hours={hours}
            className="h-full"
            timezone={timezone}
            showCurrentStatus={styles?.hours?.showCurrentStatus}
            dayOfWeekFormat={styles?.hours?.dayOfWeekFormat}
            showDayNames={styles?.hours?.showDayNames}
            timeFormat={styles?.hours?.timeFormat}
          />
        </div>
      )}
      {mainPhone && (
        <PhoneAtom
          eventName={`phone${cardNumber}`}
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

const NearbyLocationsComponent: React.FC<
  WithPuckProps<NearbyLocationsSectionProps>
> = ({
  styles,
  data,
  contentEndpointIdEnvVar,
  puck,
}: WithPuckProps<NearbyLocationsSectionProps>) => {
  const streamDocument = useDocument();
  const { t, i18n } = useTranslation();
  const locale = i18n.language;

  const coordinate = resolveComponentData(
    data?.coordinate,
    locale,
    streamDocument
  );
  const headingText = resolveComponentData(
    data?.heading,
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
    () => parseDocument(streamDocument, contentEndpointIdEnvVar),
    [streamDocument, contentEndpointIdEnvVar]
  );

  const enableNearbyLocations =
    !!businessId &&
    !!entityId &&
    !!apiKey &&
    !!contentEndpointId &&
    !!contentDeliveryAPIDomain &&
    !!coordinate?.latitude &&
    !!coordinate.longitude &&
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

  const justifyClass = styles?.heading?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.heading.align]
    : "justify-start";

  // do not render the component if there's no data or it's not enabled
  if (
    !enableNearbyLocations ||
    (!nearbyLocationsData?.response?.docs?.length &&
      nearbyLocationsStatus != "pending")
  ) {
    return <></>;
  }

  return (
    <PageSection background={styles?.backgroundColor}>
      <div className="space-y-6">
        {headingText && (
          <div className={`flex ${justifyClass}`}>
            <Heading level={styles?.heading?.level ?? 2}>{headingText}</Heading>
          </div>
        )}
        {nearbyLocationsStatus === "pending" && (
          <Body>
            {t("loadingNearbyLocations", "Loading nearby locations...")}
          </Body>
        )}

        {nearbyLocationsStatus === "success" &&
          !!nearbyLocationsData?.response?.docs && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
              {nearbyLocationsData.response.docs.map(
                (location: any, index: number) => (
                  <LocationCard
                    key={index}
                    cardNumber={index}
                    styles={styles}
                    name={location.name}
                    address={location.address}
                    hours={location.hours}
                    timezone={location.timezone}
                    mainPhone={location.mainPhone}
                    locationData={location}
                    puck={puck}
                  />
                )
              )}
            </div>
          )}
      </div>
    </PageSection>
  );
};

// parseDocument parses the streamDocument to get the businessId, apiKey, contentEndpointId, and contentDeliveryAPIDomain
function parseDocument(
  streamDocument: StreamDocument,
  contentEndpointIdEnvVar?: string
): {
  businessId: string;
  entityId: string;
  apiKey: string;
  contentEndpointId: string;
  contentDeliveryAPIDomain: string;
} {
  // read businessId
  const businessId: string = streamDocument?.businessId;
  if (!businessId) {
    console.warn("Missing businessId! Unable to fetch nearby locations.");
  }

  // read entityId
  const entityId: string = streamDocument?.id;
  if (!entityId) {
    console.warn("Missing entityId! Unable to fetch nearby locations.");
  }

  // read API key
  const apiKey: string =
    streamDocument?._env?.YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY;
  if (!apiKey) {
    console.warn(
      "Missing YEXT_PUBLIC_VISUAL_EDITOR_APP_API_KEY! Unable to fetch nearby locations."
    );
  }

  // parse contentEndpointId
  let contentEndpointId: string = "";
  if (streamDocument?._pageset) {
    try {
      const pagesetJson = JSON.parse(streamDocument?._pageset);
      contentEndpointId = pagesetJson?.config?.contentEndpointId;
    } catch (e) {
      console.error("Failed to parse pageset from stream document. err=", e);
    }
  } else if (contentEndpointIdEnvVar) {
    contentEndpointId = streamDocument?._env?.[contentEndpointIdEnvVar];
  }
  if (!contentEndpointId) {
    console.warn(
      "Missing contentEndpointId! Unable to fetch nearby locations."
    );
  }

  // read contentDeliveryAPIDomain
  const contentDeliveryAPIDomain =
    streamDocument?._yext?.contentDeliveryAPIDomain;
  if (!contentDeliveryAPIDomain) {
    console.warn(
      "Missing contentDeliveryAPIDomain! Unable to fetch nearby locations."
    );
  }

  return {
    businessId: businessId,
    entityId: entityId,
    apiKey: apiKey,
    contentEndpointId: contentEndpointId,
    contentDeliveryAPIDomain: contentDeliveryAPIDomain,
  };
}

/**
 * The Nearby Locations Section dynamically finds and displays a list of business locations within a specified radius of a central point. It's a powerful tool for helping users discover other relevant locations, rendering each result as a detailed card with contact information and business hours.
 * Available on Location templates.
 */
export const NearbyLocationsSection: ComponentConfig<NearbyLocationsSectionProps> =
  {
    label: msg("components.nearbyLocationsSection", "Nearby Locations Section"),
    fields: nearbyLocationsSectionFields,
    defaultProps: {
      data: {
        heading: {
          field: "",
          constantValue: { en: "Nearby Locations", hasLocalizedValue: "true" },
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
        heading: {
          level: 2,
          align: "left",
        },
        cards: {
          backgroundColor: backgroundColors.background1.value,
          headingLevel: 3,
        },
        hours: {
          showCurrentStatus: true,
          timeFormat: "12h",
          showDayNames: true,
          dayOfWeekFormat: "long",
        },
        phoneNumberFormat: "domestic",
        phoneNumberLink: false,
      },
      analytics: {
        scope: "nearbyLocationsSection",
      },
      liveVisibility: true,
    },
    render: (props) => (
      <AnalyticsScopeProvider
        name={props.analytics?.scope ?? "nearbyLocationsSection"}
      >
        <VisibilityWrapper
          liveVisibility={props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          <NearbyLocationsComponent {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    ),
  };
