import React from "react";
import { ComponentConfig, Fields, Slot, PuckComponent } from "@puckeditor/core";
import {
  backgroundColors,
  BackgroundStyle,
  ThemeOptions,
} from "../../utils/themeConfigOptions.ts";
import { YextField } from "../../editor/YextField.tsx";
import { VisibilityWrapper } from "../atoms/visibilityWrapper.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../utils/applyAnalytics.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import { HeadingTextProps } from "../contentBlocks/HeadingText.tsx";
import { BodyTextProps } from "../contentBlocks/BodyText.tsx";
import { ImageWrapperProps } from "../contentBlocks/image/Image.tsx";
import { CTAWrapperProps } from "../contentBlocks/CtaWrapper.tsx";
import { AddressProps } from "../contentBlocks/Address.tsx";
import { PhoneListProps } from "../contentBlocks/PhoneList.tsx";
import { EmailsProps } from "../contentBlocks/Emails.tsx";
import { ReviewStars, getAggregateRating } from "../atoms/reviewStars.tsx";
import { useDocument } from "../../hooks/useDocument.tsx";
import { PageSection } from "../atoms/pageSection.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { getRandomPlaceholderImageObject } from "../../utils/imagePlaceholders.ts";
import { ComponentErrorBoundary } from "../../internal/components/ComponentErrorBoundary.tsx";

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

  /**
   * Whether to show the credentials slot.
   * @defaultValue true
   */
  showCredentials?: boolean;

  /**
   * Whether to show the subtitle slot.
   * @defaultValue true
   */
  showSubtitle?: boolean;

  /**
   * Whether to show the business name slot.
   * @defaultValue true
   */
  showBusinessName?: boolean;

  /**
   * Whether to show the professional title slot.
   * @defaultValue true
   */
  showProfessionalTitle?: boolean;

  /**
   * Whether to show the address slot.
   * @defaultValue true
   */
  showAddress?: boolean;

  /**
   * Whether to show the primary CTA slot.
   * @defaultValue true
   */
  showPrimaryCTA?: boolean;

  /**
   * Whether to show the secondary CTA slot.
   * @defaultValue true
   */
  showSecondaryCTA?: boolean;

  /**
   * Whether to show the phone slot.
   * @defaultValue true
   */
  showPhone?: boolean;

  /**
   * Whether to show the email slot.
   * @defaultValue true
   */
  showEmail?: boolean;
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
    CredentialsSlot: Slot;
    ProfessionalNameSlot: Slot;
    ProfessionalTitleSlot: Slot;
    SubtitleSlot: Slot;
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
  conditionalRender?: {
    isRightColumnVisible?: boolean;
  };

  /** @internal */
  analytics: {
    scope?: string;
  };
}

const ProfessionalHero: PuckComponent<ProfessionalHeroSectionProps> = (
  props
) => {
  const { styles, slots, conditionalRender } = props;
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
          "w-full flex flex-col gap-4",
          showImage ? "lg:w-2/3" : "w-full"
        )}
      >
        {/* Top: Names and Title */}
        <div className="flex flex-col gap-2">
          {styles.showBusinessName && (
            <div className="[&_p]:font-bold text-center lg:text-left">
              <slots.BusinessNameSlot style={{ height: "auto" }} allow={[]} />
            </div>
          )}
          <div className="flex flex-col lg:flex-row lg:gap-4">
            <div
              className={`${
                styles.showCredentials ? "w-full lg:w-1/2" : "w-full"
              } text-center lg:text-left [&_div]:justify-center lg:[&_div]:justify-start`}
            >
              <slots.ProfessionalNameSlot
                style={{ height: "auto" }}
                allow={[]}
              />
            </div>
            {styles.showCredentials && (
              <div className="w-full lg:w-1/2 text-center lg:text-left [&_div]:justify-center lg:[&_div]:justify-start">
                <slots.CredentialsSlot style={{ height: "auto" }} allow={[]} />
              </div>
            )}
          </div>
          {styles.showProfessionalTitle && (
            <div className="text-center lg:text-left [&_div]:justify-center lg:[&_div]:justify-start">
              <slots.ProfessionalTitleSlot
                style={{ height: "auto" }}
                allow={[]}
              />
            </div>
          )}
          {styles.showSubtitle && (
            <div className="[&_p]:font-bold text-center lg:text-left [&_div]:justify-center lg:[&_div]:justify-start">
              <slots.SubtitleSlot style={{ height: "auto" }} allow={[]} />
            </div>
          )}
        </div>

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
            {styles.showAddress && (
              <slots.AddressSlot style={{ height: "auto" }} allow={[]} />
            )}
            <div className="flex flex-col md:flex-row gap-4">
              {styles.showPrimaryCTA && (
                <slots.PrimaryCTASlot style={{ height: "auto" }} allow={[]} />
              )}
              {styles.showSecondaryCTA && (
                <slots.SecondaryCTASlot style={{ height: "auto" }} allow={[]} />
              )}
            </div>
          </div>

          {/* Right Inner Column */}
          {conditionalRender?.isRightColumnVisible && (
            <div className="flex flex-col gap-4 flex-1">
              {styles.showPhone && (
                <slots.PhoneSlot style={{ height: "auto" }} allow={[]} />
              )}
              {styles.showEmail && (
                <slots.EmailSlot style={{ height: "auto" }} allow={[]} />
              )}
            </div>
          )}
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
      showImage: YextField(msg("fields.showImage", "Show Image"), {
        type: "radio",
        options: [
          {
            label: msg("fields.options.show", "Show"),
            value: true,
          },
          {
            label: msg("fields.options.hide", "Hide"),
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
      showBusinessName: YextField(
        msg("fields.showBusinessName", "Show Business Name"),
        {
          type: "radio",
          options: [
            {
              label: msg("fields.options.show", "Show"),
              value: true,
            },
            {
              label: msg("fields.options.hide", "Hide"),
              value: false,
            },
          ],
        }
      ),
      showCredentials: YextField(
        msg("fields.showCredentials", "Show Credentials"),
        {
          type: "radio",
          options: [
            {
              label: msg("fields.options.show", "Show"),
              value: true,
            },
            {
              label: msg("fields.options.hide", "Hide"),
              value: false,
            },
          ],
        }
      ),
      showProfessionalTitle: YextField(
        msg("fields.showProfessionalTitle", "Show Professional Title"),
        {
          type: "radio",
          options: [
            {
              label: msg("fields.options.show", "Show"),
              value: true,
            },
            {
              label: msg("fields.options.hide", "Hide"),
              value: false,
            },
          ],
        }
      ),
      showSubtitle: YextField(msg("fields.showSubtitle", "Show Subtitle"), {
        type: "radio",
        options: [
          {
            label: msg("fields.options.show", "Show"),
            value: true,
          },
          {
            label: msg("fields.options.hide", "Hide"),
            value: false,
          },
        ],
      }),
      showAverageReview: YextField(
        msg("fields.showAverageReview", "Show Average Review"),
        {
          type: "radio",
          options: [
            {
              label: msg("fields.options.show", "Show"),
              value: true,
            },
            {
              label: msg("fields.options.hide", "Hide"),
              value: false,
            },
          ],
        }
      ),
      showAddress: YextField(msg("fields.showAddress", "Show Address"), {
        type: "radio",
        options: [
          {
            label: msg("fields.options.show", "Show"),
            value: true,
          },
          {
            label: msg("fields.options.hide", "Hide"),
            value: false,
          },
        ],
      }),
      showPrimaryCTA: YextField(
        msg("fields.showPrimaryCTA", "Show Primary CTA"),
        {
          type: "radio",
          options: [
            {
              label: msg("fields.options.show", "Show"),
              value: true,
            },
            {
              label: msg("fields.options.hide", "Hide"),
              value: false,
            },
          ],
        }
      ),
      showSecondaryCTA: YextField(
        msg("fields.showSecondaryCTA", "Show Secondary CTA"),
        {
          type: "radio",
          options: [
            {
              label: msg("fields.options.show", "Show"),
              value: true,
            },
            {
              label: msg("fields.options.hide", "Hide"),
              value: false,
            },
          ],
        }
      ),
      showPhone: YextField(msg("fields.showPhone", "Show Phone"), {
        type: "radio",
        options: [
          {
            label: msg("fields.options.show", "Show"),
            value: true,
          },
          {
            label: msg("fields.options.hide", "Hide"),
            value: false,
          },
        ],
      }),
      showEmail: YextField(msg("fields.showEmail", "Show Email"), {
        type: "radio",
        options: [
          {
            label: msg("fields.options.show", "Show"),
            value: true,
          },
          {
            label: msg("fields.options.hide", "Hide"),
            value: false,
          },
        ],
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      ImageSlot: { type: "slot" },
      BusinessNameSlot: { type: "slot" },
      CredentialsSlot: { type: "slot" },
      ProfessionalNameSlot: { type: "slot" },
      ProfessionalTitleSlot: { type: "slot" },
      SubtitleSlot: { type: "slot" },
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
      showImage: true,
      desktopImagePosition: "left",
      mobileImagePosition: "top",
      showBusinessName: true,
      showCredentials: true,
      showProfessionalTitle: true,
      showSubtitle: true,
      showAverageReview: true,
      showAddress: true,
      showPrimaryCTA: true,
      showSecondaryCTA: true,
      showPhone: true,
      showEmail: true,
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
          type: "BodyTextSlot",
          props: {
            data: {
              text: {
                field: "",
                constantValue: {
                  en: "Business Name",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              variant: "lg",
            },
          } satisfies BodyTextProps,
        },
      ],
      CredentialsSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                field: "",
                constantValue: {
                  en: "Credentials",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              level: 2,
              align: "left",
            },
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
            styles: { level: 2, align: "left" },
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
            styles: {
              level: 5,
              align: "left",
              semanticLevelOverride: 3,
            },
          } satisfies HeadingTextProps,
        },
      ],
      SubtitleSlot: [
        {
          type: "BodyTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "Subtitle",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: {
              variant: "base",
            },
          } satisfies BodyTextProps,
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
              actionType: "link",
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
              actionType: "link",
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
  resolveData: (data, params) => {
    const streamDocument = params.metadata?.streamDocument;
    const locale = streamDocument?.locale;
    if (!locale || !streamDocument) {
      return { ...data };
    }

    const emailSlot = data?.props?.slots?.EmailSlot?.[0];
    const resolvedEmails = emailSlot
      ? resolveComponentData(emailSlot.props.data.list, locale, streamDocument)
      : [];

    const phoneSlot = data?.props?.slots?.PhoneSlot?.[0];
    const phoneNumbersConfig = phoneSlot?.props?.data?.phoneNumbers || [];
    const hasPhones = phoneNumbersConfig.some((config: any) => {
      const resolved = resolveComponentData(
        config.number,
        locale,
        streamDocument
      );
      return !!resolved;
    });

    const showPhone = data.props.styles.showPhone ?? true;
    const showEmail = data.props.styles.showEmail ?? true;

    const isRightColumnVisible =
      (showEmail && resolvedEmails && resolvedEmails.length > 0) ||
      (showPhone && hasPhones);

    return {
      ...data,
      props: {
        ...data.props,
        conditionalRender: { isRightColumnVisible },
      },
    };
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
