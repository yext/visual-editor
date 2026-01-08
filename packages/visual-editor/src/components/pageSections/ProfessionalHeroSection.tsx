import React from "react";
import { ComponentConfig, Fields, Slot, PuckComponent } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  YextField,
  VisibilityWrapper,
  msg,
  getAnalyticsScopeHash,
  YextEntityField,
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
  AssetImageType,
  TranslatableAssetImage,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";
import { AnalyticsScopeProvider, ImageType } from "@yext/pages-components";
import { getRandomPlaceholderImageObject } from "../../utils/imagePlaceholders";
import { ComponentErrorBoundary } from "../../internal/components/ComponentErrorBoundary";

export interface ProfessionalHeroData {
  backgroundImage: YextEntityField<
    ImageType | AssetImageType | TranslatableAssetImage
  >;
}

export interface ProfessionalHeroStyles {
  backgroundColor?: BackgroundStyle;
  showAverageReview: boolean;
  imageHeight?: number;
}

export interface ProfessionalHeroSectionProps {
  data: ProfessionalHeroData;
  styles: ProfessionalHeroStyles;
  slots: {
    ImageSlot: Slot;
    BusinessNameSlot: Slot;
    ProfessionalNameSlot: Slot;
    ProfessionalTitleSlot: Slot;
    AddressSlot: Slot;
    ContactCTASlot: Slot;
    PhoneSlot: Slot;
    EmailSlot: Slot;
  };
  liveVisibility?: boolean;
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

  return (
    <PageSection
      background={styles.backgroundColor}
      aria-label={t("professionalHero", "Professional Hero")}
      className="flex flex-col lg:flex-row gap-8 lg:gap-16"
    >
      {/* Left Column: Image */}
      <div className="w-full lg:w-1/3 flex-shrink-0">
        <slots.ImageSlot allow={[]} />
      </div>

      {/* Right Column: Content */}
      <div className="w-full lg:w-2/3 flex flex-col gap-6">
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
            <slots.ContactCTASlot style={{ height: "auto" }} allow={[]} />
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
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      backgroundImage: YextField(msg("fields.image", "Image"), {
        type: "entityField",
        filter: {
          types: ["type.image"],
        },
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
      imageHeight: YextField(msg("fields.imageHeight", "Image Height"), {
        type: "number",
        min: 0,
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      ImageSlot: { type: "slot" },
      BusinessNameSlot: { type: "slot" },
      ProfessionalNameSlot: { type: "slot" },
      ProfessionalTitleSlot: { type: "slot" },
      AddressSlot: { type: "slot" },
      ContactCTASlot: { type: "slot" },
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
    data: {
      backgroundImage: {
        field: "",
        constantValue: {
          ...getRandomPlaceholderImageObject({ width: 640, height: 700 }),
          width: 640,
          height: 700,
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      showAverageReview: true,
      imageHeight: 500,
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
                    width: 640,
                    height: 700,
                  }),
                  width: 640,
                  height: 700,
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              aspectRatio: 0.9,
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
            styles: { level: 4, align: "left" },
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
      ContactCTASlot: [
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
            eventName: "contactCta",
            styles: {
              variant: "primary",
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
  render: (props) => (
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
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
    </ComponentErrorBoundary>
  ),
};
