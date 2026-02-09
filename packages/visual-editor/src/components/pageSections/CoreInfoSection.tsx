import { useTranslation } from "react-i18next";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import { AddressType, AnalyticsScopeProvider } from "@yext/pages-components";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import {
  BackgroundStyle,
  backgroundColors,
} from "../../utils/themeConfigOptions.ts";
import { PageSection } from "../atoms/pageSection.tsx";
import { YextField } from "../../editor/YextField.tsx";
import { VisibilityWrapper } from "../atoms/visibilityWrapper.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../utils/applyAnalytics.ts";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { TranslatableString } from "../../types/types.ts";
import { HeadingTextProps } from "../contentBlocks/HeadingText.tsx";
import { HoursTableProps } from "../contentBlocks/HoursTable.tsx";
import { TextListProps } from "../contentBlocks/TextList.tsx";
import { EmailsProps } from "../contentBlocks/Emails.tsx";
import { AddressProps } from "../contentBlocks/Address.tsx";
import {
  PhoneListProps,
  resolvePhoneNumbers,
} from "../contentBlocks/PhoneList.tsx";
import { ComponentErrorBoundary } from "../../internal/components/ComponentErrorBoundary.tsx";

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
    TextListSlot: Slot;
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
      CoreInfoHeadingSlot: {
        type: "slot",
        ai: {
          instructions: "Provide a heading for the left (core info) column",
        },
      },
      CoreInfoAddressSlot: {
        type: "slot",
        ai: { instructions: "Use an address component" },
      },
      CoreInfoPhoneNumbersSlot: {
        type: "slot",
        ai: {
          instructions: "Use a phone component with the mainPhone entity field",
        },
      },
      CoreInfoEmailsSlot: {
        type: "slot",
        ai: {
          instructions: "Use an emails component with the emails entity field",
        },
      },
      HoursHeadingSlot: {
        type: "slot",
        ai: { instructions: "Provide a heading for the center (hours) column" },
      },
      HoursTableSlot: {
        type: "slot",
        ai: { instructions: "Use an hours field" },
      },
      ServicesHeadingSlot: {
        type: "slot",
        ai: {
          instructions: "Provide a heading for the right (core info) column",
        },
      },
      TextListSlot: {
        type: "slot",
        ai: {
          instructions:
            "Provide a list of services offered base on the services entity field",
        },
      },
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
      ai: {
        exclude: true,
      },
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
  const showCoreInfoCol = conditionalRender?.coreInfoCol || puck.isEditing;
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
          <slots.CoreInfoHeadingSlot style={{ height: "auto" }} allow={[]} />
          <slots.CoreInfoAddressSlot style={{ height: "auto" }} allow={[]} />
          <slots.CoreInfoPhoneNumbersSlot
            style={{ height: "auto" }}
            allow={[]}
          />
          <slots.CoreInfoEmailsSlot style={{ height: "auto" }} allow={[]} />
        </section>
      )}
      {showHoursCol && (
        <section
          aria-label={t("hoursSection", "Hours Section")}
          className="flex flex-col gap-4"
        >
          <slots.HoursHeadingSlot style={{ height: "auto" }} allow={[]} />
          <slots.HoursTableSlot style={{ height: "auto" }} allow={[]} />
        </section>
      )}
      {showServicesCol && (
        <section
          aria-label={t("servicesSection", "Services Section")}
          className="flex flex-col gap-4"
        >
          <slots.ServicesHeadingSlot style={{ height: "auto" }} allow={[]} />
          <slots.TextListSlot style={{ height: "auto" }} allow={[]} />
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
    ai: {
      instructions: `Make sure every slot field is always filled out with one component.`,
    },
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
            } satisfies HeadingTextProps,
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
            } satisfies AddressProps,
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
            } satisfies PhoneListProps,
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
            } satisfies EmailsProps,
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
            } satisfies HeadingTextProps,
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
                alignment: "items-start",
              },
            } satisfies HoursTableProps,
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
            } satisfies HeadingTextProps,
          },
        ],
        TextListSlot: [
          {
            type: "TextListSlot",
            props: {
              list: {
                field: "services",
                constantValue: [],
              },
              commaSeparated: false,
            } satisfies TextListProps,
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
        data.props?.slots?.TextListSlot?.map(
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
      <ComponentErrorBoundary
        isEditing={props.puck.isEditing}
        resetKeys={[props]}
      >
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
      </ComponentErrorBoundary>
    ),
  };
