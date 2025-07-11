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
  HoursStatusAtom,
  TranslatableString,
  resolveTranslatableString,
  msg,
  ThemeOptions,
  MaybeLink,
  getLocationPath,
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

export interface NearbyLocationsSectionProps {
  data: {
    heading: YextEntityField<TranslatableString>;
    coordinate: YextEntityField<Coordinate>;
    radius: number;
    limit: number;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    heading: {
      level: HeadingLevel;
      align: "left" | "center" | "right";
    };
    cards: {
      headingLevel: HeadingLevel;
      backgroundColor?: BackgroundStyle;
    };
    phoneNumberFormat: "domestic" | "international";
    phoneNumberLink: boolean;
    hours: {
      showCurrentStatus: boolean;
      timeFormat?: "12h" | "24h";
      dayOfWeekFormat?: "short" | "long";
      showDayNames?: boolean;
    };
  };
  analytics?: {
    scope?: string;
  };
  liveVisibility: boolean;
  contentEndpointIdEnvVar?: string; // to be set via withPropOverrides
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
        { label: msg("fields.options.hide", "Hide"), value: true },
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
  id,
  slug,
}: {
  cardNumber: number;
  styles: NearbyLocationsSectionProps["styles"];
  name: string;
  hours: HoursType;
  address: AddressType;
  timezone: string;
  mainPhone: string;
  id: string;
  slug?: string;
}) => {
  const { relativePrefixToRoot } = useTemplateProps();
  const { i18n } = useTranslation();

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
        href={getLocationPath(
          { address, slug, id },
          i18n.language,
          relativePrefixToRoot
        )}
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

const NearbyLocationsComponent: React.FC<NearbyLocationsSectionProps> = ({
  styles,
  data,
  contentEndpointIdEnvVar,
}: NearbyLocationsSectionProps) => {
  const document = useDocument<any>();
  const { i18n } = useTranslation();
  const coordinate = resolveYextEntityField<Coordinate>(
    document,
    data?.coordinate
  );
  const headingText = resolveTranslatableString(
    resolveYextEntityField<TranslatableString>(document, data?.heading),
    i18n.language
  );

  // parse variables from document
  const {
    businessId,
    apiKey,
    contentEndpointId,
    contentDeliveryAPIDomain,
  }: {
    businessId: string;
    apiKey: string;
    contentEndpointId: string;
    contentDeliveryAPIDomain: string;
  } = React.useMemo(
    () => parseDocument(document, contentEndpointIdEnvVar),
    [document, contentEndpointIdEnvVar]
  );

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
          locale: i18n.language,
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

  const justifyClass = styles?.heading?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.heading.align]
    : "justify-start";

  return (
    <PageSection background={styles?.backgroundColor}>
      <div className="space-y-6">
        {headingText && (
          <div className={`flex ${justifyClass}`}>
            <Heading level={styles?.heading?.level ?? 2}>{headingText}</Heading>
          </div>
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
                    id={location.id}
                    name={location.name}
                    address={location.address}
                    hours={location.hours}
                    timezone={location.timezone}
                    mainPhone={location.mainPhone}
                    slug={location.slug}
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
  contentEndpointIdEnvVar?: string
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
  } else if (contentEndpointIdEnvVar) {
    contentEndpointId = document?._env?.[contentEndpointIdEnvVar];
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
