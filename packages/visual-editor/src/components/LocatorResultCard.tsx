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
  Button,
  CTA,
  CTAVariant,
  Heading,
  HeadingLevel,
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
  };

  /** Settings for the tertiary heading of the card */
  tertiaryHeading: {
    /** The field from the data to use for the tertiary heading */
    field: DynamicOptionsSingleSelectorType<string>;
    /** The variant for the tertiary heading */
    variant: BodyProps["variant"];
  };

  /** Whether to show icons for certain fields */
  icons: boolean;

  /** Settings for the hours block */
  hours: {
    /** Styles for the hours table */
    table: Omit<
      HoursTableProps["styles"],
      "alignment" | "showAdditionalHoursText"
    >;
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
    field: string;
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
    field: string;
    /** Whether the email block is visible in live mode */
    liveVisibility: boolean;
  };

  /** Settings for the services block */
  services: {
    /**The field from the data to use for the services
     * @defaultValue "services"
     */
    field: string;
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
    label: string;
    /** Template for the secondary CTA link, which can contain entity field references */
    link: string;
    /** The variant for the secondary CTA */
    variant: CTAVariant;
    /** Whether the secondary CTA is visible in live mode */
    liveVisibility: boolean;
  };

  /** Settings for the image */
  image: {
    /** The field from the data to use for the image */
    field: string;
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
  },
  tertiaryHeading: {
    field: { selection: { value: "name" } },
    variant: "base",
  },
  icons: true,
  hours: {
    table: {
      startOfWeek: "today",
      collapseDays: false,
    },
    liveVisibility: true,
  },
  address: {
    showGetDirectionsLink: true,
    liveVisibility: true,
  },
  phone: {
    field: "mainPhone",
    phoneFormat: "domestic",
    includePhoneHyperlink: true,
    liveVisibility: true,
  },
  email: {
    field: "emails",
    liveVisibility: false,
  },
  services: {
    field: "services",
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
    field: "headshot",
    liveVisibility: false,
  },
};

const getDisplayFieldOptions = (
  fieldTypeId: string
): DynamicOption<string>[] => {
  const templateMetadata = useTemplateMetadata();
  if (!templateMetadata?.locatorDisplayFields) {
    return [];
  }
  const displayFields = templateMetadata.locatorDisplayFields;
  console.log("Locator display fields from template metadata:", displayFields);
  const ret = Object.keys(templateMetadata.locatorDisplayFields)
    .filter((key) => displayFields![key].field_type_id === fieldTypeId)
    .map((key) => {
      const fieldData: FieldTypeData = displayFields![key];
      return {
        label: fieldData.field_name,
        value: key,
      };
    });
  console.log("Generated display field options:", ret);
  return ret as DynamicOption<string>[];
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
            // singleSelect: true,
            dropdownLabel: msg("fields.field", "Field"),
            getOptions: () => {
              return getDisplayFieldOptions("type.string");
            },
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
            // singleSelect: true,
            dropdownLabel: msg("fields.field", "Field"),
            getOptions: () => {
              return getDisplayFieldOptions("type.string");
            },
          }
        ),
        variant: YextField(msg("fields.variant", "Variant"), {
          type: "radio",
          options: "BODY_VARIANT",
        }),
      },
    },
    tertiaryHeading: {
      label: msg("fields.tertiaryHeading", "Tertiary Heading"),
      type: "object",
      objectFields: {
        field: YextField(msg("fields.field", "Field"), {
          type: "select",
          hasSearch: true,
          options: [
            {
              label: msg("fields.name", "Name"),
              value: "name",
            },
          ],
        }),
        variant: YextField(msg("fields.variant", "Variant"), {
          type: "radio",
          options: "BODY_VARIANT",
        }),
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
        field: YextField(msg("fields.field", "Field"), {
          type: "select",
          hasSearch: true,
          options: [
            {
              label: msg("fields.mainPhone", "Main Phone"),
              value: "mainPhone",
            },
          ],
        }),
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
        field: YextField(msg("fields.field", "Field"), {
          type: "select",
          hasSearch: true,
          options: [
            {
              label: msg("fields.email", "Email"),
              value: "emails",
            },
          ],
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
    services: {
      label: msg("fields.services", "Services"),
      type: "object",
      objectFields: {
        field: YextField(msg("fields.field", "Field"), {
          type: "select",
          hasSearch: true,
          options: [
            {
              label: msg("fields.services", "Services"),
              value: "services",
            },
          ],
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
        label: TranslatableStringField<any>(msg("fields.label", "Label"), {
          types: ["type.string"],
        }),
        link: {
          label: msg("fields.link", "Link"),
          type: "text",
        },
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
        field: YextField(msg("fields.field", "Field"), {
          type: "select",
          hasSearch: true,
          options: [
            {
              label: msg("fields.headshot", "Headshot"),
              value: "headshot",
            },
          ],
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
  },
};

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
    console.log("Rendering LocatorResultCard for location:", location);
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

    const fieldExists = (field: string, type?: string) => {
      return (
        location.hasOwnProperty(field) &&
        (type ? typeof location[field] === type : true)
      );
    };

    const leafFieldExists = (field: string, type?: string) => {
      let currentValue = location;
      for (const subfield of field.split(".")) {
        if (!currentValue || !currentValue.hasOwnProperty(subfield)) {
          return false;
        }
        currentValue = currentValue[subfield];
      }

      return currentValue && (type ? typeof currentValue === type : true);
    };

    const parseFromLocation = (
      fieldId: string | undefined
    ): string | undefined => {
      if (!fieldId) {
        return undefined;
      }
      // We can get away with this simple implementation for now since we know exactly what fields we
      // can be in the locator response
      let current = location;
      for (const field of fieldId.split(".")) {
        if (current[field] === undefined) {
          return undefined;
        }
        current = current[field];
      }

      try {
        return String(current);
      } catch {
        return undefined;
      }
    };

    console.log("primaryHeading field:", props.primaryHeading.field);
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
                {props.image.field &&
                  fieldExists(props.image.field, "object") &&
                  location[props.image.field]?.url &&
                  props.image.liveVisibility && (
                    <img
                      src={location[props.image.field].url}
                      alt={
                        location[props.image.field].alternateText ||
                        location.name
                      }
                      className="w-12 h-12 md:w-16 md:h-16 lg:w-20 lg:h-20 object-cover rounded-md"
                    />
                  )}
                <div className="flex flex-col gap-2">
                  <Heading
                    className="font-bold text-palette-primary-dark"
                    level={props.primaryHeading.headingLevel}
                  >
                    {parseFromLocation(
                      props.primaryHeading.field.selection.value
                    ) ?? location.name}
                  </Heading>
                  {props.secondaryHeading.field.selection.value &&
                    leafFieldExists(
                      props.secondaryHeading.field.selection.value,
                      "string"
                    ) && (
                      <Body
                        variant={props.secondaryHeading.variant}
                        className="font-bold"
                      >
                        {parseFromLocation(
                          props.secondaryHeading.field.selection.value
                        )}
                      </Body>
                    )}
                  {props.tertiaryHeading.field.selection.value &&
                    leafFieldExists(
                      props.tertiaryHeading.field.selection.value,
                      "string"
                    ) && (
                      <Body
                        variant={props.tertiaryHeading.variant}
                        className=""
                      >
                        {parseFromLocation(
                          props.tertiaryHeading.field.selection.value
                        )}
                      </Body>
                    )}
                </div>
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
            {/** Hours section */}
            {location.hours && props.hours.liveVisibility && (
              <div className="font-body-fontFamily text-body-fontSize gap-8">
                <Accordion>
                  <AccordionItem
                    key={`result-${result.index}-hours`}
                    className="py-0"
                  >
                    <AccordionTrigger className="justify-start">
                      <div className="flex flex-row items-center gap-2">
                        {props.icons && (
                          <CardIcon>
                            <FaRegClock className="w-4 h-4" />
                          </CardIcon>
                        )}
                        <HoursStatusAtom
                          hours={location.hours}
                          timezone={location.timezone}
                          className="text-body-fontSize mb-0"
                          showDayNames={false}
                          boldCurrentStatus={true}
                        />
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <HoursTableAtom
                        hours={location.hours}
                        startOfWeek={props.hours.table.startOfWeek}
                        collapseDays={props.hours.table.collapseDays}
                        className="[&_.HoursTable-row]:w-fit"
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>
            )}

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
                {props.phone.field &&
                  fieldExists(props.phone.field, "string") &&
                  props.phone.liveVisibility && (
                    <PhoneAtom
                      backgroundColor={backgroundColors.background2.value}
                      eventName={`phone`}
                      label={t("phone", "Phone")}
                      format={props.phone.phoneFormat}
                      phoneNumber={location[props.phone.field]}
                      includeHyperlink={props.phone.includePhoneHyperlink}
                      includeIcon={props.icons}
                      customClickHandler={handlePhoneNumberClick}
                    />
                  )}
                {props.email.field &&
                  fieldExists(props.email.field) &&
                  Array.isArray(location[props.email.field]) &&
                  location[props.email.field].length > 0 &&
                  props.email.liveVisibility && (
                    <div className="flex flex-row items-center gap-2">
                      {props.icons && (
                        <CardIcon>
                          <FaRegEnvelope className="w-4 h-4" />
                        </CardIcon>
                      )}
                      <CTA
                        eventName={`email${result.index}`}
                        link={location[props.email.field][0]}
                        label={location[props.email.field][0]}
                        linkType="EMAIL"
                        variant="link"
                      />
                    </div>
                  )}
              </div>
              {/** Secondary Info Section */}
              <div className="flex flex-col gap-4 lg:w-[240px]">
                {props.services.field &&
                  fieldExists(props.services.field) &&
                  Array.isArray(location[props.services.field]) &&
                  location[props.services.field].length > 0 &&
                  props.services.liveVisibility && (
                    <div className="flex flex-col gap-2">
                      <Body variant="base" className="font-bold">
                        {t("services", "Services")}
                      </Body>
                      <Body variant="base">
                        {location[props.services.field].join(", ")}
                      </Body>
                    </div>
                  )}
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
          <div className="flex flex-col lg:flex-row gap-2 lg:gap-4 w-full">
            {props.primaryCTA.liveVisibility && (
              <Button
                asChild
                className="basis-full sm:w-auto"
                variant={props.primaryCTA.variant}
              >
                <a href={resolvedUrl} onClick={handleVisitPageClick}>
                  {t("visitPage", "Visit Page")}
                </a>
              </Button>
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
                customClickHandler={handleSecondaryCTAClick}
                className="basis-full sm:w-auto"
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
