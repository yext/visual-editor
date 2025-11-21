import React from "react";
import { useTranslation } from "react-i18next";
import { Field, PuckContext } from "@measured/puck";
import {
  CardProps,
  Coordinate,
  useCardAnalyticsCallback,
} from "@yext/search-ui-react";
import {
  Background,
  backgroundColors,
  Body,
  BodyProps,
  CTA,
  CTAVariant,
  Heading,
  HeadingLevel,
  Image,
  msg,
  PhoneAtom,
  useTemplateProps,
  resolveComponentData,
  resolveUrlTemplateOfChild,
  mergeMeta,
  HoursStatusAtom,
  HoursTableAtom,
  YextField,
  DynamicOption,
  DynamicOptionsSingleSelectorType,
  TranslatableString,
} from "@yext/visual-editor";
import {
  Address,
  AddressType,
  getDirections,
  HoursType,
  ListingType,
} from "@yext/pages-components";
import {
  HoursTableProps,
  HoursTableStyleFields,
} from "./contentBlocks/HoursTable.tsx";
import { TranslatableStringField } from "../editor/TranslatableStringField.tsx";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./atoms/accordion.js";
import {
  FaAngleRight,
  FaMapMarkerAlt,
  FaRegClock,
  FaRegEnvelope,
} from "react-icons/fa";
import { useTemplateMetadata } from "../internal/hooks/useMessageReceivers";
import { FieldTypeData } from "../internal/types/templateMetadata";

export interface LocatorResultCardProps {
  /** Settings for the main heading of the card */
  primaryHeading: {
    /**
     * The field from the data to use for the primary heading
     * @defaultValue "name"
     */
    field: DynamicOptionsSingleSelectorType<string>;
    /** The heading level for the primary heading */
    headingLevel: HeadingLevel;
  };

  /** Settings for the secondary heading of the card */
  secondaryHeading: {
    /** The field from the data to use for the secondary heading */
    field: DynamicOptionsSingleSelectorType<string>;
    /** The variant for the secondary heading */
    variant: BodyProps["variant"];
    /** Whether the secondary heading is visible in live mode */
    liveVisibility: boolean;
  };

  /** Settings for the tertiary heading of the card */
  tertiaryHeading: {
    /** The field from the data to use for the tertiary heading */
    field: DynamicOptionsSingleSelectorType<string>;
    /** The variant for the tertiary heading */
    variant: BodyProps["variant"];
    /** Whether the tertiary heading is visible in live mode */
    liveVisibility: boolean;
  };

  /** Whether to show icons for certain fields */
  icons: boolean;

  /** Settings for the hours block */
  hours: {
    /** The field from the data to use for the hours */
    field: DynamicOptionsSingleSelectorType<string>;
    /** Styles for the hours table */
    table: Omit<HoursTableProps["styles"], "alignment">;
    /** Whether the hours block is visible in live mode */
    liveVisibility: boolean;
  };

  /** Settings for the address block */
  address: {
    /** Whether to show the "Get Directions" link */
    showGetDirectionsLink: boolean;
    /** Whether the address block is visible in live mode */
    liveVisibility: boolean;
  };

  /** Settings for the phone block */
  phone: {
    /**
     * The field from the data to use for the phone number
     * @defaultValue "mainPhone"
     */
    field: DynamicOptionsSingleSelectorType<string>;
    /**
     * The format to use for the phone number
     * @defaultValue "domestic"
     */
    phoneFormat: "domestic" | "international";
    /** Whether to include a hyperlink for the phone number */
    includePhoneHyperlink: boolean;
    /** Whether the phone block is visible in live mode */
    liveVisibility: boolean;
  };

  /** Settings for the email block */
  email: {
    /**
     * The field from the data to use for the email address
     * @defaultValue "emails"
     */
    field: DynamicOptionsSingleSelectorType<string>;
    /** Whether the email block is visible in live mode */
    liveVisibility: boolean;
  };

  /** Settings for the services block */
  services: {
    /**The field from the data to use for the services
     * @defaultValue "services"
     */
    field: DynamicOptionsSingleSelectorType<string>;
    /** Whether the services block is visible in live mode */
    liveVisibility: boolean;
  };

  /** Settings for the primary CTA */
  primaryCTA: {
    /** The variant for the primary CTA */
    variant: CTAVariant;
    /** Whether the primary CTA is visible in live mode */
    liveVisibility: boolean;
  };

  /** Settings for the secondary CTA */
  secondaryCTA: {
    /** Label for the secondary CTA */
    label: TranslatableString;
    /** Template for the secondary CTA link, which can contain entity field references */
    link: TranslatableString;
    /** The variant for the secondary CTA */
    variant: CTAVariant;
    /** Whether the secondary CTA is visible in live mode */
    liveVisibility: boolean;
  };

  /** Settings for the image */
  image: {
    /** The field from the data to use for the image */
    field: DynamicOptionsSingleSelectorType<string>;
    /** Whether the image block is visible in live mode */
    liveVisibility: boolean;
  };
}

export const DEFAULT_LOCATOR_RESULT_CARD_PROPS: LocatorResultCardProps = {
  primaryHeading: {
    field: { selection: { value: "name" } },
    headingLevel: 3,
  },
  secondaryHeading: {
    field: { selection: { value: "name" } },
    variant: "base",
    liveVisibility: false,
  },
  tertiaryHeading: {
    field: { selection: { value: "name" } },
    variant: "base",
    liveVisibility: false,
  },
  icons: true,
  hours: {
    field: { selection: { value: "hours" } },
    table: {
      startOfWeek: "today",
      collapseDays: false,
      showAdditionalHoursText: false,
    },
    liveVisibility: true,
  },
  address: {
    showGetDirectionsLink: true,
    liveVisibility: true,
  },
  phone: {
    field: { selection: { value: "mainPhone" } },
    phoneFormat: "domestic",
    includePhoneHyperlink: true,
    liveVisibility: true,
  },
  email: {
    field: { selection: { value: "emails" } },
    liveVisibility: false,
  },
  services: {
    field: { selection: { value: "services" } },
    liveVisibility: false,
  },
  primaryCTA: {
    variant: "primary",
    liveVisibility: true,
  },
  secondaryCTA: {
    label: "Call to Action",
    link: "#",
    variant: "secondary",
    liveVisibility: false,
  },
  image: {
    field: { selection: { value: "headshot" } },
    liveVisibility: false,
  },
};

const getDisplayFieldOptions = (
  fieldTypeId: string | string[]
): DynamicOption<string>[] => {
  const templateMetadata = useTemplateMetadata();
  if (!templateMetadata?.locatorDisplayFields) {
    return [];
  }
  const displayFields = templateMetadata.locatorDisplayFields;
  const fieldTypeIds = Array.isArray(fieldTypeId) ? fieldTypeId : [fieldTypeId];
  return Object.keys(templateMetadata.locatorDisplayFields)
    .filter((key) => fieldTypeIds.includes(displayFields[key].field_type_id))
    .map((key) => {
      const fieldData: FieldTypeData = displayFields[key];
      return {
        label: fieldData.field_name,
        value: key,
      };
    });
};

export const LocatorResultCardFields: Field<LocatorResultCardProps, {}> = {
  label: msg("fields.resultCard", "Result Card"),
  type: "object",
  objectFields: {
    primaryHeading: {
      label: msg("fields.primaryHeading", "Primary Heading"),
      type: "object",
      objectFields: {
        field: YextField<DynamicOptionsSingleSelectorType<string>, string>(
          msg("fields.field", "Field"),
          {
            type: "dynamicSingleSelect",
            dropdownLabel: msg("fields.field", "Field"),
            getOptions: () => getDisplayFieldOptions("type.string"),
          }
        ),
        headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
          type: "select",
          hasSearch: true,
          options: "HEADING_LEVEL",
        }),
      },
    },
    secondaryHeading: {
      label: msg("fields.secondaryHeading", "Secondary Heading"),
      type: "object",
      objectFields: {
        field: YextField<DynamicOptionsSingleSelectorType<string>, string>(
          msg("fields.field", "Field"),
          {
            type: "dynamicSingleSelect",
            dropdownLabel: msg("fields.field", "Field"),
            getOptions: () => getDisplayFieldOptions("type.string"),
          }
        ),
        variant: YextField(msg("fields.variant", "Variant"), {
          type: "radio",
          options: "BODY_VARIANT",
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
      },
    },
    tertiaryHeading: {
      label: msg("fields.tertiaryHeading", "Tertiary Heading"),
      type: "object",
      objectFields: {
        field: YextField<DynamicOptionsSingleSelectorType<string>, string>(
          msg("fields.field", "Field"),
          {
            type: "dynamicSingleSelect",
            dropdownLabel: msg("fields.field", "Field"),
            getOptions: () => getDisplayFieldOptions("type.string"),
          }
        ),
        variant: YextField(msg("fields.variant", "Variant"), {
          type: "radio",
          options: "BODY_VARIANT",
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
      },
    },
    icons: YextField(msg("fields.icons", "Icons"), {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }),
    hours: {
      label: msg("fields.hours", "Hours"),
      type: "object",
      objectFields: {
        field: YextField<DynamicOptionsSingleSelectorType<string>, string>(
          msg("fields.field", "Field"),
          {
            type: "dynamicSingleSelect",
            dropdownLabel: msg("fields.field", "Field"),
            getOptions: () => getDisplayFieldOptions("type.hours"),
          }
        ),
        table: YextField(msg("fields.hoursColumn", "Hours Column"), {
          type: "object",
          objectFields: HoursTableStyleFields,
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
      },
    },
    address: {
      label: msg("fields.address", "Address"),
      type: "object",
      objectFields: {
        showGetDirectionsLink: YextField(
          msg("fields.showGetDirectionsLink", "Show Get Directions Link"),
          {
            type: "radio",
            options: [
              { label: msg("fields.options.yes", "Yes"), value: true },
              { label: msg("fields.options.no", "No"), value: false },
            ],
          }
        ),
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
      },
    },
    phone: {
      label: msg("fields.phone", "Phone"),
      type: "object",
      objectFields: {
        field: YextField<DynamicOptionsSingleSelectorType<string>, string>(
          msg("fields.field", "Field"),
          {
            type: "dynamicSingleSelect",
            dropdownLabel: msg("fields.field", "Field"),
            getOptions: () => getDisplayFieldOptions("type.phone"),
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
        includePhoneHyperlink: YextField(
          msg("fields.includePhoneHyperlink", "Include Phone Hyperlink"),
          {
            type: "radio",
            options: [
              { label: msg("fields.options.yes", "Yes"), value: true },
              { label: msg("fields.options.no", "No"), value: false },
            ],
          }
        ),
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
      },
    },
    email: {
      label: msg("fields.email", "Email"),
      type: "object",
      objectFields: {
        field: YextField<DynamicOptionsSingleSelectorType<string>, string>(
          msg("fields.field", "Field"),
          {
            type: "dynamicSingleSelect",
            dropdownLabel: msg("fields.field", "Field"),
            getOptions: () => getDisplayFieldOptions("type.string"),
          }
        ),
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
      },
    },
    services: {
      label: msg("fields.services", "Services"),
      type: "object",
      objectFields: {
        field: YextField<DynamicOptionsSingleSelectorType<string>, string>(
          msg("fields.field", "Field"),
          {
            type: "dynamicSingleSelect",
            dropdownLabel: msg("fields.field", "Field"),
            getOptions: () => getDisplayFieldOptions("type.string"),
          }
        ),
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
      },
    },
    primaryCTA: {
      label: msg("fields.primaryCTA", "Primary CTA"),
      type: "object",
      objectFields: {
        variant: YextField(msg("fields.CTAVariant", "CTA Variant"), {
          type: "radio",
          options: "CTA_VARIANT",
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
      },
    },
    secondaryCTA: {
      label: msg("fields.secondaryCTA", "Secondary CTA"),
      type: "object",
      objectFields: {
        label: TranslatableStringField<TranslatableString>(
          msg("fields.label", "Label"),
          undefined,
          false,
          true,
          () => getDisplayFieldOptions("type.string")
        ),
        link: TranslatableStringField<TranslatableString>(
          msg("fields.link", "Link"),
          undefined,
          false,
          true,
          () => getDisplayFieldOptions("type.string")
        ),
        variant: YextField(msg("fields.CTAVariant", "CTA Variant"), {
          type: "radio",
          options: "CTA_VARIANT",
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
      },
    },
    image: {
      label: msg("fields.image", "Image"),
      type: "object",
      objectFields: {
        field: YextField<DynamicOptionsSingleSelectorType<string>, string>(
          msg("fields.field", "Field"),
          {
            type: "dynamicSingleSelect",
            dropdownLabel: msg("fields.field", "Field"),
            getOptions: () => getDisplayFieldOptions("type.image"),
          }
        ),
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
      },
    },
  },
};

export interface Location {
  address: AddressType;
  hours?: HoursType;
  additionalHoursText?: string;
  id: string;
  mainPhone?: string;
  name: string;
  neighborhood?: string;
  slug?: string;
  timezone: string;
  yextDisplayCoordinate?: Coordinate;
  ref_listings?: ListingType[];
  [key: string]: any; // Allow any other fields
}

export const LocatorResultCard = React.memo(
  ({
    result,
    resultCardProps: props,
    puck,
  }: {
    result: CardProps<Location>["result"];
    resultCardProps: LocatorResultCardProps;
    puck: PuckContext;
  }): React.JSX.Element => {
    const { document: streamDocument, relativePrefixToRoot } =
      useTemplateProps();
    const { t, i18n } = useTranslation();

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
    const handleSecondaryCTAClick = useCardAnalyticsCallback(
      result,
      "CTA_CLICK"
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
        className="container flex flex-row border-b border-gray-300 p-4 md:p-6 lg:p-8 gap-4"
      >
        <Background
          background={backgroundColors.background6.value}
          className="flex-shrink-0 w-6 h-6 rounded-full font-bold hidden md:flex items-center justify-center text-body-sm-fontSize"
        >
          {result.index}
        </Background>
        <div className="flex flex-wrap gap-4 w-full">
          <div className="w-full flex flex-col gap-4">
            {/** Heading section */}
            <div className="flex flex-row justify-between items-start gap-6">
              <div className="flex flex-row items-start gap-6">
                <ImageSection image={props.image} location={location} />
                <HeadingTextSection
                  primaryHeading={props.primaryHeading}
                  secondaryHeading={props.secondaryHeading}
                  tertiaryHeading={props.tertiaryHeading}
                  location={location}
                />
              </div>
              {distance && (
                <div
                  className={
                    "font-body-fontFamily font-body-sm-fontWeight text-body-sm-fontSize rounded-full hidden lg:flex"
                  }
                >
                  {t("distanceInUnit", `${distanceInMiles} mi`, {
                    distanceInMiles,
                    distanceInKilometers,
                  })}
                </div>
              )}
            </div>
            <HoursSection
              location={location}
              result={result}
              hoursProps={props.hours}
              showIcons={props.icons}
            />

            {/** Core Info section */}
            <div className="flex flex-col lg:flex-row gap-4">
              {/** Contact Section */}
              <div className="flex flex-col gap-4 lg:w-[280px]">
                {location.address && props.address.liveVisibility && (
                  <div className="flex flex-row items-start gap-2">
                    {props.icons && (
                      <CardIcon>
                        <FaMapMarkerAlt className="w-4 h-4" />
                      </CardIcon>
                    )}
                    <div className="flex flex-col gap-1 w-full">
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
                      {getDirectionsLink &&
                        props.address.showGetDirectionsLink && (
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
                )}
                <PhoneSection
                  phone={props.phone}
                  handlePhoneNumberClick={handlePhoneNumberClick}
                  location={location}
                  icons={props.icons}
                />
                <EmailSection
                  email={props.email}
                  location={location}
                  icons={props.icons}
                  index={result.index}
                />
              </div>
              {/** Secondary Info Section */}
              <div className="flex flex-col gap-4 lg:w-[240px]">
                <ServicesSection
                  services={props.services}
                  location={location}
                />
              </div>
            </div>
          </div>
          {distance && (
            <div
              className={`
              font-body-fontFamily font-body-sm-fontWeight text-body-sm-fontSize rounded-full flex lg:hidden px-2 py-1 w-fit
              ${backgroundColors.background2.value.bgColor} ${backgroundColors.background2.value.textColor}
              `}
            >
              {t("distanceInUnit", `${distanceInMiles} mi`, {
                distanceInMiles,
                distanceInKilometers,
              })}
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 w-full items-center md:items-stretch lg:items-center">
            {props.primaryCTA.liveVisibility && (
              <CTA
                link={resolvedUrl}
                label={t("visitPage", "Visit Page")}
                variant={props.primaryCTA.variant}
                onClick={handleVisitPageClick}
                className="basis-full sm:w-auto justify-center"
              />
            )}
            {props.secondaryCTA.liveVisibility && (
              <CTA
                link={resolveComponentData(
                  props.secondaryCTA.link,
                  i18n.language,
                  location
                )}
                label={
                  resolveComponentData(
                    props.secondaryCTA.label,
                    i18n.language,
                    location
                  ) || t("callToAction", "Call to Action")
                }
                variant={props.secondaryCTA.variant}
                onClick={handleSecondaryCTAClick}
                className="basis-full sm:w-auto justify-center"
              />
            )}
          </div>
        </div>
      </Background>
    );
  }
);

const CardIcon: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const colorClasses = `${backgroundColors.background2.value.bgColor} ${backgroundColors.background2.value.textColor}`;
  return (
    <div
      className={`h-10 w-10 flex justify-center rounded-full items-center ${colorClasses}`}
    >
      {children}
    </div>
  );
};

const ImageSection = (props: {
  image: LocatorResultCardProps["image"];
  location: Location;
}) => {
  const { image, location } = props;

  const fieldId = image.field?.selection?.value;
  const imageRecord = parseRecordFromLocation(location, fieldId);
  const imageData = {
    url: imageRecord?.url,
    alternateText: imageRecord?.alternateText || location.name,
    // these will probably get overridden by CSS but providing defaults for safety
    height: imageRecord?.height ?? 80,
    width: imageRecord?.width ?? 80,
  };
  const showImageSection = imageRecord && image.liveVisibility;

  return (
    showImageSection && (
      <Image
        image={imageData}
        className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-cover rounded-md"
      />
    )
  );
};

const HeadingTextSection = (props: {
  primaryHeading: LocatorResultCardProps["primaryHeading"];
  secondaryHeading: LocatorResultCardProps["secondaryHeading"];
  tertiaryHeading: LocatorResultCardProps["tertiaryHeading"];
  location: Location;
}) => {
  const { primaryHeading, secondaryHeading, tertiaryHeading, location } = props;

  const primaryHeadingText =
    parseStringFromLocation(location, primaryHeading.field?.selection?.value) ??
    location.name;

  const secondaryHeadingText = parseStringFromLocation(
    location,
    secondaryHeading.field?.selection?.value
  );
  const tertiaryHeadingText = parseStringFromLocation(
    location,
    tertiaryHeading.field?.selection?.value
  );

  return (
    <div className="flex flex-col gap-2">
      <Heading
        className="font-bold text-palette-primary-dark"
        level={primaryHeading.headingLevel}
      >
        {primaryHeadingText}
      </Heading>
      {secondaryHeadingText && secondaryHeading.liveVisibility && (
        <Body variant={secondaryHeading.variant} className="font-bold">
          {secondaryHeadingText}
        </Body>
      )}
      {tertiaryHeadingText && tertiaryHeading.liveVisibility && (
        <Body variant={tertiaryHeading.variant}>{tertiaryHeadingText}</Body>
      )}
    </div>
  );
};

const HoursSection = (props: {
  location: Location;
  result: CardProps<Location>["result"];
  hoursProps: LocatorResultCardProps["hours"];
  showIcons: boolean;
}) => {
  const { location, result, hoursProps, showIcons } = props;

  const hoursField = hoursProps.field?.selection?.value;
  const hoursData = parseHoursFromLocation(location, hoursField);
  const showHoursSection = hoursData && hoursProps.liveVisibility;
  return (
    showHoursSection && (
      <div className="font-body-fontFamily text-body-fontSize gap-8">
        <Accordion>
          <AccordionItem key={`result-${result.index}-hours`} className="py-0">
            <AccordionTrigger className="justify-start">
              <div className="flex flex-row items-center gap-2">
                {showIcons && (
                  <CardIcon>
                    <FaRegClock className="w-4 h-4" />
                  </CardIcon>
                )}
                <HoursStatusAtom
                  hours={hoursData}
                  timezone={location.timezone}
                  className="text-body-fontSize mb-0"
                  showDayNames={false}
                  boldCurrentStatus={true}
                />
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col gap-2">
                <HoursTableAtom
                  hours={hoursData}
                  startOfWeek={hoursProps.table.startOfWeek}
                  collapseDays={hoursProps.table.collapseDays}
                  className="[&_.HoursTable-row]:w-fit"
                />
                {location.additionalHoursText &&
                  hoursProps.table.showAdditionalHoursText && (
                    <div className="text-body-sm-fontSize">
                      {location.additionalHoursText}
                    </div>
                  )}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    )
  );
};

const PhoneSection = (props: {
  phone: LocatorResultCardProps["phone"];
  handlePhoneNumberClick: () => void;
  location: Location;
  icons: boolean;
  index?: number;
}) => {
  const { phone, handlePhoneNumberClick, location, icons, index } = props;
  const { t } = useTranslation();

  const phoneFieldId = phone.field?.selection?.value;
  const phoneNumber = parseStringFromLocation(location, phoneFieldId);
  const showPhoneNumber = phoneFieldId && phone.liveVisibility && phoneNumber;
  return (
    showPhoneNumber && (
      <PhoneAtom
        backgroundColor={backgroundColors.background2.value}
        eventName={`phone${index}`}
        label={t("phone", "Phone")}
        format={phone.phoneFormat}
        phoneNumber={phoneNumber}
        includeHyperlink={phone.includePhoneHyperlink}
        includeIcon={icons}
        onClick={handlePhoneNumberClick}
      />
    )
  );
};

const EmailSection = (props: {
  email: LocatorResultCardProps["email"];
  location: Location;
  icons: boolean;
  index?: number;
}) => {
  const { email, location, index, icons } = props;

  const emailFieldId = email.field?.selection?.value;
  const emailAddresses = parseArrayFromLocation(location, emailFieldId);
  const showEmailSection =
    email.liveVisibility &&
    emailAddresses &&
    emailAddresses.length > 0 &&
    typeof emailAddresses[0] === "string";
  return (
    showEmailSection && (
      <div className="flex flex-row items-center gap-2">
        {icons && (
          <CardIcon>
            <FaRegEnvelope className="w-4 h-4" />
          </CardIcon>
        )}
        <CTA
          eventName={`email${index}`}
          link={emailAddresses[0]}
          label={emailAddresses[0]}
          linkType="EMAIL"
          variant="link"
        />
      </div>
    )
  );
};

const ServicesSection = (props: {
  services: LocatorResultCardProps["services"];
  location: Location;
}) => {
  const { services, location } = props;
  const { t } = useTranslation();

  const fieldId = services.field?.selection?.value;
  const servicesList = parseArrayFromLocation(location, fieldId);
  const showServicesSection =
    services.liveVisibility &&
    servicesList &&
    servicesList.length > 0 &&
    servicesList.every((service) => typeof service === "string");
  return (
    showServicesSection && (
      <div className="flex flex-col gap-2">
        <Body variant="base" className="font-bold">
          {t("services", "Services")}
        </Body>
        <Body variant="base">{servicesList.join(", ")}</Body>
      </div>
    )
  );
};

/** Parses a string from the given location using the provided field ID. */
const parseStringFromLocation = (
  location: Location,
  fieldId: string | undefined
): string | undefined => {
  const value = resolveProjectedField(location, fieldId);
  if (value === undefined || value === null) {
    return undefined;
  }
  return String(value);
};

/** Parses an array from the given location using the provided field ID. */
const parseArrayFromLocation = (
  location: Location,
  fieldId: string | undefined
): Array<any> | undefined => {
  const fieldValue = resolveProjectedField(location, fieldId);
  if (Array.isArray(fieldValue)) {
    return fieldValue;
  }
  return undefined;
};

/** Parses a record with string keys from the given location using the provided field ID. */
const parseRecordFromLocation = (
  location: Location,
  fieldId: string | undefined
): Record<string, any> | undefined => {
  return resolveProjectedField(location, fieldId);
};

/** Parses an hours object from the given location using the provided hours field ID. */
const parseHoursFromLocation = (
  location: Location,
  hoursFieldId: string | undefined
): HoursType | undefined => {
  return resolveProjectedField(location, hoursFieldId) as HoursType;
};

/**
 * Dereferences a projected field ID that uses "." as its separator. Returns the value of the
 * root field.
 */
const resolveProjectedField = (
  object: Record<string, any>,
  projectFieldId: string | undefined
): any => {
  if (!projectFieldId) {
    return undefined;
  }
  // We can get away with this simple implementation for now since we know exactly what fields
  // can be in the locator response
  let current = object;
  for (const fieldId of projectFieldId.split(".")) {
    if (!current?.hasOwnProperty(fieldId)) {
      return undefined;
    }
    current = current[fieldId];
  }

  return current;
};
