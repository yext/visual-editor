import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import { AddressType, AnalyticsScopeProvider } from "@yext/pages-components";
import {
  YextEntityField,
  BackgroundStyle,
  PageSection,
  backgroundColors,
  YextField,
  VisibilityWrapper,
  msg,
  getAnalyticsScopeHash,
  resolveComponentData,
  TranslatableString,
} from "@yext/visual-editor";
import { resolvePhoneNumbers } from "../contentBlocks/PhoneList";

export interface CoreInfoStyles {
  /**
   * The background color of the section.
   * @defaultValue `Background Color 1`
   */
  backgroundColor?: BackgroundStyle;
}

export interface CoreInfoSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: CoreInfoStyles;

  slots: {
    CoreInfoHeadingSlot: Slot;
    CoreInfoAddressSlot: Slot;
    CoreInfoPhoneNumbersSlot: Slot;
    CoreInfoEmailsSlot: Slot;
    HoursHeadingSlot: Slot;
    HoursTableSlot: Slot;
    ServicesHeadingSlot: Slot;
    ServicesListSlot: Slot;
  };

  /** @internal */
  conditionalRender?: {
    coreInfoCol?: boolean;
    hoursCol?: boolean;
    servicesCol?: boolean;
  };

  /** @internal */
  analytics: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const coreInfoSectionFields: Fields<CoreInfoSectionProps> = {
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
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      CoreInfoHeadingSlot: { type: "slot" },
      CoreInfoAddressSlot: { type: "slot" },
      CoreInfoPhoneNumbersSlot: { type: "slot" },
      CoreInfoEmailsSlot: { type: "slot" },
      HoursHeadingSlot: { type: "slot" },
      HoursTableSlot: { type: "slot" },
      ServicesHeadingSlot: { type: "slot" },
      ServicesListSlot: { type: "slot" },
    },
    visible: false,
  },
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
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

/**
 * The Core Info Section is a comprehensive component designed to display essential business information in a clear, multi-column layout. It typically includes contact details (address, phone, email), hours of operation, and a list of services, with extensive options for customization.
 * Available on Location templates.
 */
const CoreInfoSectionWrapper: PuckComponent<CoreInfoSectionProps> = (props) => {
  const { styles, slots, conditionalRender, puck } = props;
  const { t } = useTranslation();

  // Determine which columns to show. All 3 should be shown in editing mode.
  const showCoreInfoCol = puck.isEditing || conditionalRender?.coreInfoCol;
  const showHoursCol = conditionalRender?.hoursCol || puck.isEditing;
  const showServicesCol = conditionalRender?.servicesCol || puck.isEditing;

  const sectionCount = [showCoreInfoCol, showHoursCol, showServicesCol].filter(
    Boolean
  ).length;

  const gridColsClass = [
    "grid-cols-1",
    `md:grid-cols-${Math.min(sectionCount, 2)}`,
    `lg:grid-cols-${Math.min(sectionCount, 3)}`,
  ].join(" ");

  return (
    <PageSection
      className={`grid w-full gap-8 ${gridColsClass}`}
      background={styles?.backgroundColor}
      aria-label={t("coreInfoSection", "Core Info Section")}
    >
      {showCoreInfoCol && (
        <section
          aria-label={t("informationSection", "Information Section")}
          className="flex flex-col gap-4"
        >
          <slots.CoreInfoHeadingSlot style={{ maxHeight: "fit-content" }} />
          <slots.CoreInfoAddressSlot />
          <slots.CoreInfoPhoneNumbersSlot />
          <slots.CoreInfoEmailsSlot />
        </section>
      )}
      {showHoursCol && (
        <section
          aria-label={t("hoursSection", "Hours Section")}
          className="flex flex-col gap-4"
        >
          <slots.HoursHeadingSlot style={{ maxHeight: "fit-content" }} />
          <slots.HoursTableSlot />
        </section>
      )}
      {showServicesCol && (
        <section
          aria-label={t("servicesSection", "Services Section")}
          className="flex flex-col gap-4"
        >
          <slots.ServicesHeadingSlot style={{ maxHeight: "fit-content" }} />
          <slots.ServicesListSlot />
        </section>
      )}
    </PageSection>
  );
};

/**
 * The Core Info Section is a comprehensive component designed to display essential business information in a clear, multi-column layout. It typically includes contact details (address, phone, email), hours of operation, and a list of services, with extensive options for customization.
 * Available on Location templates.
 */
export const CoreInfoSection: ComponentConfig<{ props: CoreInfoSectionProps }> =
  {
    label: msg("components.coreInfoSection", "Core Info Section"),
    fields: coreInfoSectionFields,
    defaultProps: {
      styles: {
        backgroundColor: backgroundColors.background1.value,
      },
      slots: {
        CoreInfoHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  constantValue: {
                    en: "Information",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "left" },
            },
          },
        ],
        CoreInfoAddressSlot: [
          {
            type: "AddressSlot",
            props: {
              data: {
                address: {
                  constantValue: {
                    line1: "",
                    city: "",
                    postalCode: "",
                    countryCode: "",
                  },
                  field: "address",
                },
              },
              styles: {
                showGetDirectionsLink: true,
                ctaVariant: "link",
              },
            },
          },
        ],
        CoreInfoPhoneNumbersSlot: [
          {
            type: "PhoneNumbersSlot",
            props: {
              data: {
                phoneNumbers: [
                  {
                    number: {
                      field: "mainPhone",
                      constantValue: "",
                    },
                    label: {
                      en: "Phone",
                      hasLocalizedValue: "true",
                    },
                  },
                ],
              },
              styles: {
                phoneFormat: "domestic",
                includePhoneHyperlink: true,
              },
            },
          },
        ],
        CoreInfoEmailsSlot: [
          {
            type: "EmailsSlot",
            props: {
              data: {
                list: {
                  field: "emails",
                  constantValue: [],
                },
              },
              styles: {
                listLength: 1,
              },
            },
          },
        ],
        HoursHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  constantValue: {
                    en: "Hours",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "left" },
            },
          },
        ],
        HoursTableSlot: [
          {
            type: "HoursTableSlot",
            props: {
              data: {
                hours: {
                  field: "hours",
                  constantValue: {},
                },
              },
              styles: {
                startOfWeek: "today",
                collapseDays: false,
                showAdditionalHoursText: true,
              },
            },
          },
        ],
        ServicesHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  constantValue: {
                    en: "Services",
                    hasLocalizedValue: "true",
                  },
                  constantValueEnabled: true,
                  field: "",
                },
              },
              styles: { level: 3, align: "left" },
            },
          },
        ],
        ServicesListSlot: [
          {
            type: "ServicesListSlot",
            props: {
              list: {
                field: "services",
                constantValue: [],
              },
            },
          },
        ],
      },
      analytics: {
        scope: "coreInfoSection",
      },
      liveVisibility: true,
    },
    resolveData: async (data, params) => {
      // Determine which columns should be shown on a live page
      const streamDocument = params.metadata?.streamDocument;
      const locale = streamDocument?.locale;
      if (!locale || !streamDocument) {
        return data;
      }

      // Check if the HeadingSlot has content to display
      const resolvedInfoHeading = resolveComponentData(
        data?.props?.slots?.CoreInfoHeadingSlot.map(
          (slot) => slot.props.data.text
        )[0],
        locale,
        streamDocument
      );

      // Check if the AddressSlot has an address to display
      const resolvedInfoAddress = resolveComponentData(
        data.props.slots.CoreInfoAddressSlot.map(
          (slot) => slot.props.data.address
        )[0],
        locale,
        streamDocument
      ) as unknown as AddressType;

      const resolvedPhoneNumbers = resolvePhoneNumbers(
        data.props.slots.CoreInfoPhoneNumbersSlot?.[0].props?.data
          ?.phoneNumbers,
        locale,
        streamDocument
      );

      const resolvedEmails = resolveComponentData(
        data.props.slots.CoreInfoEmailsSlot.map(
          (slot) => slot.props.data.list
        )[0],
        locale,
        streamDocument
      );

      const showCoreInfoCol =
        !!resolvedInfoHeading ||
        !!resolvedInfoAddress?.line1 ||
        (resolvedPhoneNumbers?.length ?? 0) > 0 ||
        (resolvedEmails?.length ?? 0) > 0;

      const resolvedHours = resolveComponentData(
        data.props?.slots?.HoursTableSlot.map(
          (slot) => slot.props.data.hours
        )[0],
        locale,
        streamDocument
      );

      let resolvedServicesList = resolveComponentData(
        data.props?.slots?.ServicesListSlot?.map(
          (slot) => slot.props.list as YextEntityField<TranslatableString[]>
        )[0],
        locale,
        streamDocument
      );

      if (resolvedServicesList && !Array.isArray(resolvedServicesList)) {
        resolvedServicesList = [resolvedServicesList];
      }

      return {
        ...data,
        props: {
          ...data.props,
          conditionalRender: {
            coreInfoCol: showCoreInfoCol,
            hoursCol: !!resolvedHours,
            servicesCol: !!resolvedServicesList?.length,
          },
        },
      };
    },
    render: (props) => (
      <AnalyticsScopeProvider
        name={`${props.analytics?.scope ?? "coreInfoSection"}${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          <CoreInfoSectionWrapper {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    ),
  };
