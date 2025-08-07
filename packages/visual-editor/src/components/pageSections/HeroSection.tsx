import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider, HoursType } from "@yext/pages-components";
import {
  HeroSectionType,
  useDocument,
  EntityField,
  YextEntityField,
  Image,
  backgroundColors,
  BackgroundStyle,
  HeadingLevel,
  Heading,
  PageSection,
  YextField,
  VisibilityWrapper,
  CTAProps,
  HoursStatusAtom,
  TranslatableString,
  msg,
  pt,
  getAnalyticsScopeHash,
  ReviewStars,
  getAggregateRating,
  resolveComponentData,
} from "@yext/visual-editor";
import { EnhancedCTA } from "../atoms/enhancedCta";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/ImageStyling.js";
import { ENHANCED_CTA_CONSTANT_CONFIG } from "../../internal/puck/constant-value-fields/EnhancedCallToAction.tsx";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface HeroData {
  /**
   * The primary business name displayed in the hero.
   * @defaultValue "Business Name" (constant)
   */
  businessName: YextEntityField<TranslatableString>;

  /**
   * A location-based modifier or slogan (e.g., "Serving Downtown").
   * @defaultValue "Geomodifier" (constant)
   */
  localGeoModifier: YextEntityField<TranslatableString>;

  /**
   * The entity's hours data, used to display an "Open/Closed" status.
   * @defaultValue 'hours' field
   */
  hours: YextEntityField<HoursType>;

  /**
   * The main hero content, including an image and primary/secondary call-to-action buttons.
   * @defaultValue Placeholder image and CTAs
   */
  hero: HeroSectionType;

  /**
   * If 'true', displays the entity's average review rating.
   * @defaultValue true
   */
  showAverageReview: boolean;
}

export interface HeroStyles {
  /**
   * The background color for the entire section.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /**
   * Positions the image to the left or right of the text content.
   * @defaultValue right
   */
  imageOrientation: "left" | "right";

  /**
   * The HTML heading level for the business name.
   * @defaultValue 3
   */
  businessNameLevel: HeadingLevel;

  /**
   * The HTML heading level for the local geo-modifier.
   * @defaultValue 1
   */
  localGeoModifierLevel: HeadingLevel;

  /**
   * The visual style variant for the primary call-to-action button.
   * @defaultValue primary
   */
  primaryCTA: CTAProps["variant"];

  /**
   * The visual style variant for the secondary call-to-action button.
   * @defaultValue secondary
   */
  secondaryCTA: CTAProps["variant"];

  /**
   * Styling options for the hero image, such as aspect ratio.
   */
  image: ImageStylingProps;
}

export interface HeroSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: HeroData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: HeroStyles;

  /** @internal */
  analytics: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility?: boolean;
}

const heroSectionFields: Fields<HeroSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      businessName: YextField<any, TranslatableString>(
        msg("fields.businessName", "Business Name"),
        {
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        }
      ),
      localGeoModifier: YextField<any, TranslatableString>(
        msg("fields.localGeomodifier", "Local GeoModifier"),
        {
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        }
      ),
      hours: YextField(msg("fields.hours", "Hours"), {
        type: "entityField",
        filter: {
          types: ["type.hours"],
        },
      }),
      hero: {
        type: "object",
        label: msg("fields.hero", "Hero"),
        objectFields: {
          image: {
            type: "object",
            label: pt("fields.image", "Image"),
            objectFields: {
              url: {
                label: pt("fields.url", "URL"),
                type: "text",
              },
              height: {
                label: pt("fields.height", "Height"),
                type: "number",
              },
              width: {
                label: pt("fields.width", "Width"),
                type: "number",
              },
            },
          },
          primaryCta: {
            type: "object",
            label: pt("fields.primaryCTA", "Primary CTA"),
            objectFields: {
              cta: ENHANCED_CTA_CONSTANT_CONFIG,
            },
          },
          secondaryCta: {
            type: "object",
            label: pt("fields.secondaryCTA", "Secondary CTA"),
            objectFields: {
              cta: ENHANCED_CTA_CONSTANT_CONFIG,
            },
          },
        },
      },
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
      imageOrientation: YextField(
        msg("fields.imageOrientation", "Image Orientation"),
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
      businessNameLevel: YextField(
        msg("fields.businessNameHeadingLevel", "Business Name Heading Level"),
        {
          type: "select",
          hasSearch: true,
          options: "HEADING_LEVEL",
        }
      ),
      localGeoModifierLevel: YextField(
        msg(
          "fields.localGeomodifierHeadingLevel",
          "Local GeoModifier Heading Level"
        ),
        {
          type: "select",
          hasSearch: true,
          options: "HEADING_LEVEL",
        }
      ),
      primaryCTA: YextField(
        msg("fields.primaryCTAVariant", "Primary CTA Variant"),
        {
          type: "radio",
          options: "CTA_VARIANT",
        }
      ),
      secondaryCTA: YextField(
        msg("fields.secondaryCTAVariant", "Secondary CTA Variant"),
        {
          type: "radio",
          options: "CTA_VARIANT",
        }
      ),
      image: YextField(msg("fields.image", "Image"), {
        type: "object",
        objectFields: ImageStylingFields,
      }),
    },
  }),
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

const HeroSectionWrapper = ({ data, styles }: HeroSectionProps) => {
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument() as any;
  const resolvedBusinessName = resolveComponentData(
    data?.businessName,
    locale,
    streamDocument
  );
  const resolvedLocalGeoModifier = resolveComponentData(
    data?.localGeoModifier,
    locale,
    streamDocument
  );
  const resolvedHours = resolveComponentData(
    data?.hours,
    locale,
    streamDocument
  );
  const resolvedHero = data?.hero;

  const { timezone } = streamDocument as {
    timezone: string;
  };

  const { averageRating, reviewCount } = getAggregateRating(streamDocument);

  return (
    <PageSection
      background={styles.backgroundColor}
      aria-label={t("heroBanner", "Hero Banner")}
      className={`flex flex-col gap-6 md:gap-10 ${
        styles.imageOrientation === "right"
          ? "md:flex-row"
          : "md:flex-row-reverse"
      }`}
    >
      <div
        className="flex flex-col justify-center gap-y-6 w-full break-words md:gap-y-8"
        aria-labelledby="hero-heading"
      >
        <header
          className="flex flex-col gap-y-4"
          aria-label={t("heroHeader", "Hero Header")}
        >
          <section
            className="flex flex-col gap-y-0"
            aria-label={t("businessInformation", "Business Information")}
          >
            {resolvedBusinessName && (
              <EntityField
                displayName={pt("fields.businessName", "Business Name")}
                fieldId={data?.businessName.field}
                constantValueEnabled={data?.businessName.constantValueEnabled}
              >
                <Heading level={styles?.businessNameLevel}>
                  {resolvedBusinessName}
                </Heading>
              </EntityField>
            )}
            {resolvedLocalGeoModifier && (
              <EntityField
                displayName={pt("fields.localGeomodifier", "Local GeoModifier")}
                fieldId={data?.localGeoModifier.field}
                constantValueEnabled={
                  data?.localGeoModifier.constantValueEnabled
                }
              >
                <Heading level={styles?.localGeoModifierLevel}>
                  {resolvedLocalGeoModifier}
                </Heading>
              </EntityField>
            )}
          </section>
          {resolvedHours && (
            <EntityField
              displayName={pt("fields.hours", "Hours")}
              fieldId={data?.hours.field}
              constantValueEnabled={data?.hours.constantValueEnabled}
            >
              <HoursStatusAtom hours={resolvedHours} timezone={timezone} />
            </EntityField>
          )}
          {reviewCount > 0 && data.showAverageReview && (
            <ReviewStars
              averageRating={averageRating}
              reviewCount={reviewCount}
            />
          )}
        </header>
        {(resolvedHero?.primaryCta?.cta?.label ||
          resolvedHero?.secondaryCta?.cta?.label) && (
          <div
            className="flex flex-col gap-y-4 md:flex-row md:gap-x-4"
            aria-label={t("callToActions", "Call to Actions")}
          >
            {resolvedHero?.primaryCta?.cta?.label && (
              <EnhancedCTA
                eventName={`primaryCta`}
                variant={styles?.primaryCTA}
                label={resolveComponentData(
                  resolvedHero.primaryCta.cta.label,
                  i18n.language
                )}
                link={resolvedHero.primaryCta.cta.link}
                linkType={resolvedHero.primaryCta.cta.linkType}
                ctaType={resolvedHero.primaryCta.cta.ctaType}
                coordinate={resolvedHero.primaryCta.cta.coordinate}
                presetImageType={resolvedHero.primaryCta.cta.presetImageType}
                className={"py-3"}
              />
            )}
            {resolvedHero?.secondaryCta?.cta?.label && (
              <EnhancedCTA
                eventName={`secondaryCta`}
                variant={styles?.secondaryCTA}
                label={resolveComponentData(
                  resolvedHero.secondaryCta.cta.label,
                  i18n.language
                )}
                link={resolvedHero.secondaryCta.cta.link}
                linkType={resolvedHero.secondaryCta.cta.linkType}
                ctaType={resolvedHero.secondaryCta.cta.ctaType}
                coordinate={resolvedHero.secondaryCta.cta.coordinate}
                presetImageType={resolvedHero.secondaryCta.cta.presetImageType}
                className={"py-3"}
              />
            )}
          </div>
        )}
      </div>
      {resolvedHero?.image && (
        <div
          className="w-full"
          role="region"
          aria-label={t("heroImage", "Hero Image")}
        >
          <Image
            image={resolvedHero?.image}
            aspectRatio={styles.image.aspectRatio}
            width={styles.image.width || 640}
            className="max-w-full sm:max-w-initial md:max-w-[350px] lg:max-w-none rounded-image-borderRadius"
          />
        </div>
      )}
    </PageSection>
  );
};

export const HeroSection: ComponentConfig<HeroSectionProps> = {
  label: msg("components.heroSection", "Hero Section"),
  fields: heroSectionFields,
  defaultProps: {
    data: {
      businessName: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          en: "Business Name",
          hasLocalizedValue: "true",
        },
      },
      localGeoModifier: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          en: "Geomodifier",
          hasLocalizedValue: "true",
        },
      },
      hours: {
        field: "hours",
        constantValue: {},
      },
      hero: {
        primaryCta: {
          cta: {
            label: {
              en: "Call To Action",
              hasLocalizedValue: "true",
            },
            link: "#",
            linkType: "URL",
            ctaType: "textAndLink",
          },
        },
        secondaryCta: {
          cta: {
            label: {
              en: "Call To Action",
              hasLocalizedValue: "true",
            },
            link: "#",
            linkType: "URL",
            ctaType: "textAndLink",
          },
        },
        image: {
          url: PLACEHOLDER_IMAGE_URL,
          height: 360,
          width: 640,
        },
      },
      showAverageReview: true,
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      imageOrientation: "right",
      businessNameLevel: 3,
      localGeoModifierLevel: 1,
      primaryCTA: "primary",
      secondaryCTA: "secondary",
      image: {
        aspectRatio: 1.78, // 16:9 default
      },
    },
    analytics: {
      scope: "heroSection",
    },
    liveVisibility: true,
  },

  render: (props) => (
    <AnalyticsScopeProvider
      name={`${props.analytics?.scope ?? "heroSection"}${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={!!props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <HeroSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
