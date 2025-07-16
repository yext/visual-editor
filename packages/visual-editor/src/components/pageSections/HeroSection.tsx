import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { AnalyticsScopeProvider, HoursType } from "@yext/pages-components";
import {
  HeroSectionType,
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  Image,
  backgroundColors,
  BackgroundStyle,
  HeadingLevel,
  CTA,
  Heading,
  PageSection,
  YextField,
  VisibilityWrapper,
  CTAProps,
  resolveYextStructField,
  YextStructFieldSelector,
  YextStructEntityField,
  ComponentFields,
  HoursStatusAtom,
  TranslatableString,
  resolveTranslatableString,
  msg,
  pt,
  getAnalyticsScopeHash,
  ReviewStars,
  getAggregateRating,
} from "@yext/visual-editor";
import {
  ImageStylingFields,
  ImageStylingProps,
} from "../contentBlocks/ImageStyling.js";

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
  hero: YextStructEntityField<HeroSectionType>;

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
  analytics?: {
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
      hero: YextStructFieldSelector({
        label: msg("fields.hero", "Hero"),
        filter: {
          type: ComponentFields.HeroSection.type,
        },
      }),
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
  const document = useDocument() as any;
  const resolvedBusinessName = resolveTranslatableString(
    resolveYextEntityField<TranslatableString>(
      document,
      data?.businessName,
      locale
    ),
    locale
  );
  const resolvedLocalGeoModifier = resolveTranslatableString(
    resolveYextEntityField<TranslatableString>(
      document,
      data?.localGeoModifier,
      locale
    ),
    locale
  );
  const resolvedHours = resolveYextEntityField<HoursType>(
    document,
    data?.hours,
    locale
  );
  const resolvedHero = resolveYextStructField(document, data?.hero, locale);

  const { timezone } = document as {
    timezone: string;
  };

  const { averageRating, reviewCount } = getAggregateRating(document);

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
        {(resolvedHero?.primaryCta?.label ||
          resolvedHero?.secondaryCta?.label) && (
          <div
            className="flex flex-col gap-y-4 md:flex-row md:gap-x-4"
            aria-label={t("callToActions", "Call to Actions")}
          >
            {resolvedHero?.primaryCta?.label && (
              <EntityField
                displayName={pt("fields.primaryCta", "Primary CTA")}
                fieldId={data.hero.field}
                constantValueEnabled={
                  data.hero.constantValueOverride.primaryCta
                }
              >
                <CTA
                  eventName={`primaryCta`}
                  variant={styles?.primaryCTA}
                  label={resolveTranslatableString(
                    resolvedHero.primaryCta.label,
                    i18n.language
                  )}
                  link={resolvedHero.primaryCta.link}
                  linkType={resolvedHero.primaryCta.linkType}
                  className={"py-3"}
                />
              </EntityField>
            )}
            {resolvedHero?.secondaryCta?.label && (
              <EntityField
                displayName={pt("fields.secondaryCta", "Secondary CTA")}
                fieldId={data.hero.field}
                constantValueEnabled={
                  data.hero.constantValueOverride.secondaryCta
                }
              >
                <CTA
                  eventName={`secondaryCta`}
                  variant={styles?.secondaryCTA}
                  label={resolveTranslatableString(
                    resolvedHero.secondaryCta.label,
                    i18n.language
                  )}
                  link={resolvedHero.secondaryCta.link}
                  linkType={resolvedHero.secondaryCta.linkType}
                  className={"py-3"}
                />
              </EntityField>
            )}
          </div>
        )}
      </div>
      {resolvedHero?.image && (
        <EntityField
          displayName={pt("fields.image", "Image")}
          fieldId={data.hero.field}
          constantValueEnabled={data.hero.constantValueOverride.image}
        >
          <div
            className="w-full"
            role="region"
            aria-label={t("heroImage", "Hero Image")}
          >
            <Image
              image={resolvedHero?.image}
              aspectRatio={styles.image.aspectRatio}
              width={styles.image.width || 640}
              className="max-w-full sm:max-w-initial rounded-image-borderRadius"
            />
          </div>
        </EntityField>
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
        field: "",
        constantValueEnabled: true,
        constantValue: {
          primaryCta: {
            label: {
              en: "Call To Action",
              hasLocalizedValue: "true",
            },
            link: "#",
            linkType: "URL",
          },
          secondaryCta: {
            label: {
              en: "Call To Action",
              hasLocalizedValue: "true",
            },
            link: "#",
            linkType: "URL",
          },
          image: {
            url: PLACEHOLDER_IMAGE_URL,
            height: 360,
            width: 640,
          },
        },
        constantValueOverride: {
          image: true,
          primaryCta: true,
          secondaryCta: true,
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
  resolveFields: (data, { lastData }) => {
    // If set to entity value and no field selected, hide the component.
    if (
      !data.props.data.hero.constantValueEnabled &&
      data.props.data.hero.field === ""
    ) {
      data.props.liveVisibility = false;
      return {
        ...heroSectionFields,
        liveVisibility: undefined,
      };
    }

    // If no field was selected and then constant value is enabled
    // or a field is selected, show the component.
    if (
      (data.props.data.hero.constantValueEnabled &&
        !lastData?.props.data.hero.constantValueEnabled &&
        data.props.data.hero.field === "") ||
      (lastData?.props.data.hero.field === "" &&
        data.props.data.hero.field !== "")
    ) {
      data.props.liveVisibility = true;
    }

    // Otherwise, return normal fields.
    return heroSectionFields;
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
