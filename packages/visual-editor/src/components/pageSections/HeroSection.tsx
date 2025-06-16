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
} from "@yext/visual-editor";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface HeroSectionProps {
  data: {
    businessName: YextEntityField<TranslatableString>;
    localGeoModifier: YextEntityField<TranslatableString>;
    hours: YextEntityField<HoursType>;
    hero: YextStructEntityField<HeroSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    imageOrientation: "left" | "right";
    businessNameLevel: HeadingLevel;
    localGeoModifierLevel: HeadingLevel;
    primaryCTA: CTAProps["variant"];
    secondaryCTA: CTAProps["variant"];
  };
  analytics?: {
    scope?: string;
  };
  liveVisibility: boolean;
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
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          hasSearch: true,
          options: "BACKGROUND_COLOR",
        }
      ),
      imageOrientation: YextField(
        msg("fields.imageOrientation", "Image Orientation"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.left", "Left"), value: "left" },
            { label: msg("fields.options.right", "Right"), value: "right" },
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
  const document = useDocument() as any;
  const resolvedBusinessName = resolveTranslatableString(
    resolveYextEntityField<TranslatableString>(document, data?.businessName),
    i18n.language
  );
  const resolvedLocalGeoModifier = resolveTranslatableString(
    resolveYextEntityField<TranslatableString>(
      document,
      data?.localGeoModifier
    ),
    i18n.language
  );
  const resolvedHours = resolveYextEntityField<HoursType>(
    document,
    data?.hours
  );
  const resolvedHero = resolveYextStructField(document, data?.hero);

  const { timezone } = document as {
    timezone: string;
  };

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
              layout="auto"
              aspectRatio={
                resolvedHero?.image.width / resolvedHero?.image.height
              }
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
        },
      },
      localGeoModifier: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          en: "Geomodifier",
        },
      },
      hours: {
        field: "",
        constantValueEnabled: true,
        constantValue: {
          monday: {
            isClosed: false,
            openIntervals: [{ end: "17:00", start: "10:00" }],
          },
          tuesday: {
            isClosed: false,
            openIntervals: [{ end: "17:00", start: "10:00" }],
          },
          wednesday: {
            isClosed: false,
            openIntervals: [{ end: "17:00", start: "10:00" }],
          },
          thursday: {
            isClosed: false,
            openIntervals: [{ end: "17:00", start: "10:00" }],
          },
          friday: {
            isClosed: false,
            openIntervals: [{ end: "17:00", start: "10:00" }],
          },
          saturday: {
            isClosed: false,
            openIntervals: [{ end: "17:00", start: "10:00" }],
          },
          sunday: {
            isClosed: false,
            openIntervals: [{ end: "17:00", start: "10:00" }],
          },
        },
      },
      hero: {
        field: "",
        constantValue: {
          primaryCta: {
            label: {
              en: "Call To Action",
            },
            link: "#",
            linkType: "URL",
          },
          secondaryCta: {
            label: {
              en: "Call To Action",
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
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      imageOrientation: "right",
      businessNameLevel: 3,
      localGeoModifierLevel: 1,
      primaryCTA: "primary",
      secondaryCTA: "secondary",
    },
    analytics: {
      scope: "heroSection",
    },
    liveVisibility: true,
  },
  render: (props) => (
    <AnalyticsScopeProvider name={props.analytics?.scope ?? "heroSection"}>
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <HeroSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
