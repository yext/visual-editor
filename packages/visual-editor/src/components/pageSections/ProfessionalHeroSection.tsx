import React from "react";
import { ComponentConfig, Fields, Slot, PuckComponent } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  YextField,
  VisibilityWrapper,
  msg,
  getAnalyticsScopeHash,
  themeManagerCn,
  HeadingTextProps,
  ImageWrapperProps,
  CTAWrapperProps,
  AddressProps,
  PhoneListProps,
  EmailsProps,
  ReviewStars,
  useDocument,
  getAggregateRating,
  PageSection,
  ThemeOptions,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { getRandomPlaceholderImageObject } from "../../utils/imagePlaceholders";

export interface ProfessionalHeroStyles {
  /**
   * The background color for the section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /**
   * If 'true', displays the entity's average review rating.
   * @defaultValue true
   */
  showAverageReview: boolean;

  /**
   * Whether to show the hero image.
   * @defaultValue true
   */
  showImage: boolean;

  /**
   * Positions the image to the left or right of the hero content on desktop.
   * @defaultValue left
   */
  desktopImagePosition: "left" | "right";

  /**
   * Positions the image to the top or bottom of the hero content on mobile.
   * @defaultValue top
   */
  mobileImagePosition: "bottom" | "top";
}

export interface ProfessionalHeroSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: ProfessionalHeroStyles;

  /** @internal */
  slots: {
    ImageSlot: Slot;
    BusinessNameSlot: Slot;
    ProfessionalNameSlot: Slot;
    ProfessionalTitleSlot: Slot;
    AddressSlot: Slot;
    PrimaryCTASlot: Slot;
    SecondaryCTASlot: Slot;
    PhoneSlot: Slot;
    EmailSlot: Slot;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility?: boolean;

  /** @internal */
  analytics: {
    scope?: string;
  };
}

const ProfessionalHero: PuckComponent<ProfessionalHeroSectionProps> = (
  props
) => {
  const { styles, slots } = props;
  const { t } = useTranslation();
  const streamDocument = useDocument();
  const { averageRating, reviewCount } = getAggregateRating(streamDocument);

  const showImage = styles.showImage ?? true;
  const desktopImageRight = styles.desktopImagePosition === "right";
  const mobileImageTop = styles.mobileImagePosition === "top";

  const containerClasses = themeManagerCn(
    "flex gap-8 lg:gap-16",
    mobileImageTop ? "flex-col" : "flex-col-reverse",
    desktopImageRight ? "lg:flex-row-reverse" : "lg:flex-row"
  );

  return (
    <PageSection
      background={styles.backgroundColor}
      aria-label={t("professionalHero", "Professional Hero")}
      className={containerClasses}
    >
      {/* Image Column */}
      {showImage && (
        <div className="w-full lg:w-1/3 flex-shrink-0">
          <slots.ImageSlot allow={[]} />
        </div>
      )}

      {/* Content Column */}
      <div
        className={themeManagerCn(
          "w-full flex flex-col gap-6",
          showImage ? "lg:w-2/3" : "w-full"
        )}
      >
        {/* Top: Names and Title */}
        <section className="flex flex-col gap-2">
          <slots.BusinessNameSlot style={{ height: "auto" }} allow={[]} />
          <slots.ProfessionalNameSlot style={{ height: "auto" }} allow={[]} />
          <slots.ProfessionalTitleSlot style={{ height: "auto" }} allow={[]} />
        </section>

        {/* Two Columns Under */}
        <div className="flex flex-col md:flex-row gap-8 w-full">
          {/* Left Inner Column */}
          <div className="flex flex-col gap-4 flex-1">
            {reviewCount > 0 && styles.showAverageReview && (
              <ReviewStars
                averageRating={averageRating}
                reviewCount={reviewCount}
                className="justify-start"
              />
            )}
            <slots.AddressSlot style={{ height: "auto" }} allow={[]} />
            <slots.PrimaryCTASlot style={{ height: "auto" }} allow={[]} />
            <slots.SecondaryCTASlot style={{ height: "auto" }} allow={[]} />
          </div>

          {/* Right Inner Column */}
          <div className="flex flex-col gap-4 flex-1">
            <slots.PhoneSlot style={{ height: "auto" }} allow={[]} />
            <slots.EmailSlot style={{ height: "auto" }} allow={[]} />
          </div>
        </div>
      </div>
    </PageSection>
  );
};

const professionalHeroSectionFields: Fields<ProfessionalHeroSectionProps> = {
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
      showAverageReview: YextField(
        msg("fields.showAverageReview", "Show Average Review"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.show", "Show"), value: true },
            { label: msg("fields.options.hide", "Hide"), value: false },
          ],
        }
      ),
      showImage: YextField(msg("fields.showImage", "Show Image"), {
        type: "radio",
        options: [
          {
            label: msg("fields.options.true", "True"),
            value: true,
          },
          {
            label: msg("fields.options.false", "False"),
            value: false,
          },
        ],
      }),
      desktopImagePosition: YextField(
        msg("fields.desktopImagePosition", "Desktop Image Position"),
        {
          type: "radio",
          options: [
            {
              label: msg("fields.options.left", "Left", {
                context: "direction",
              }),
              value: "left",
            },
            {
              label: msg("fields.options.right", "Right", {
                context: "direction",
              }),
              value: "right",
            },
          ],
        }
      ),
      mobileImagePosition: YextField(
        msg("fields.mobileImagePosition", "Mobile Image Position"),
        {
          type: "radio",
          options: ThemeOptions.VERTICAL_POSITION,
        }
      ),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      ImageSlot: { type: "slot" },
      ProfessionalNameSlot: { type: "slot" },
      ProfessionalTitleSlot: { type: "slot" },
      AddressSlot: { type: "slot" },
      PrimaryCTASlot: { type: "slot" },
      SecondaryCTASlot: { type: "slot" },
      PhoneSlot: { type: "slot" },
      EmailSlot: { type: "slot" },
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

export const ProfessionalHeroSection: ComponentConfig<{
  props: ProfessionalHeroSectionProps;
}> = {
  label: msg("components.professionalHeroSection", "Professional Hero Section"),
  fields: professionalHeroSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
      showAverageReview: true,
      showImage: true,
      desktopImagePosition: "left",
      mobileImagePosition: "top",
    },
    slots: {
      ImageSlot: [
        {
          type: "HeroImageSlot",
          props: {
            data: {
              image: {
                field: "",
                constantValue: {
                  ...getRandomPlaceholderImageObject({
                    width: 500,
                    height: 500,
                  }),
                  width: 500,
                  height: 500,
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              aspectRatio: 1,
              width: 500,
            },
          } satisfies ImageWrapperProps,
        },
      ],
      BusinessNameSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "Business Name",
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
      ProfessionalNameSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "Professional Name",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "name",
              },
            },
            styles: { level: 1, align: "left" },
          } satisfies HeadingTextProps,
        },
      ],
      ProfessionalTitleSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "Professional Title",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 2, align: "left" },
          } satisfies HeadingTextProps,
        },
      ],
      AddressSlot: [
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
      PrimaryCTASlot: [
        {
          type: "CTASlot",
          props: {
            data: {
              entityField: {
                field: "",
                constantValue: {
                  label: {
                    en: "Contact Me",
                    hasLocalizedValue: "true",
                  },
                  link: {
                    en: "#",
                    hasLocalizedValue: "true",
                  },
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
              },
            },
            eventName: "primaryCta",
            styles: {
              variant: "primary",
            },
          } satisfies CTAWrapperProps,
        },
      ],
      SecondaryCTASlot: [
        {
          type: "CTASlot",
          props: {
            data: {
              entityField: {
                field: "",
                constantValue: {
                  label: {
                    en: "Learn More",
                    hasLocalizedValue: "true",
                  },
                  link: {
                    en: "#",
                    hasLocalizedValue: "true",
                  },
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
              },
            },
            eventName: "secondaryCta",
            styles: {
              variant: "secondary",
            },
          } satisfies CTAWrapperProps,
        },
      ],
      PhoneSlot: [
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
      EmailSlot: [
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
    },
    analytics: {
      scope: "professionalHeroSection",
    },
    liveVisibility: true,
  },
  // TODO: Add ComponentErrorBoundary
  render: (props) => (
    <AnalyticsScopeProvider
      name={`${props.analytics?.scope ?? "professionalHeroSection"}${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={!!props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <ProfessionalHero {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
