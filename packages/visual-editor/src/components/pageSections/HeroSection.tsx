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
  usePlatformTranslation,
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
  data: YextField(msg("Data"), {
    type: "object",
    objectFields: {
      businessName: YextField<any, TranslatableString>(msg("Business Name"), {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      localGeoModifier: YextField<any, TranslatableString>(
        msg("Local GeoModifier"),
        {
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        }
      ),
      hours: YextField("Hours", {
        type: "entityField",
        filter: {
          types: ["type.hours"],
        },
      }),
      hero: YextStructFieldSelector({
        label: msg("Hero"),
        filter: {
          type: ComponentFields.HeroSection.type,
        },
      }),
    },
  }),
  styles: YextField(msg("Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(msg("Background Color"), {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      imageOrientation: YextField(msg("Image Orientation"), {
        type: "radio",
        options: [
          { label: msg("Left"), value: "left" },
          { label: msg("Right"), value: "right" },
        ],
      }),
      businessNameLevel: YextField(msg("Business Name Heading Level"), {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      localGeoModifierLevel: YextField(msg("Local GeoModifier Heading Level"), {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      primaryCTA: YextField(msg("Primary CTA Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
      }),
      secondaryCTA: YextField(msg("Secondary CTA Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
      }),
    },
  }),
  liveVisibility: YextField(msg("Visible on Live Page"), {
    type: "radio",
    options: [
      { label: msg("Show"), value: true },
      { label: msg("Hide"), value: false },
    ],
  }),
};

const HeroSectionWrapper = ({ data, styles }: HeroSectionProps) => {
  const { t, i18n } = useTranslation();
  const { t: pt } = usePlatformTranslation();
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
                displayName={pt("businessName", "Business Name")}
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
                displayName={pt("localGeomodifier", "Local GeoModifier")}
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
              displayName={pt("hours", "Hours")}
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
                displayName={pt("primaryCta", "Primary CTA")}
                fieldId={data.hero.field}
                constantValueEnabled={
                  data.hero.constantValueOverride.primaryCta
                }
              >
                <CTA
                  eventName={`primaryCta`}
                  variant={styles?.primaryCTA}
                  label={resolvedHero.primaryCta.label}
                  link={resolvedHero.primaryCta.link}
                  linkType={resolvedHero.primaryCta.linkType}
                  className={"py-3"}
                />
              </EntityField>
            )}
            {resolvedHero?.secondaryCta?.label && (
              <EntityField
                displayName={pt("secondaryCta", "Secondary CTA")}
                fieldId={data.hero.field}
                constantValueEnabled={
                  data.hero.constantValueOverride.secondaryCta
                }
              >
                <CTA
                  eventName={`secondaryCta`}
                  variant={styles?.secondaryCTA}
                  label={resolvedHero.secondaryCta.label}
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
          displayName={pt("image", "Image")}
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
  label: msg("Hero Section"),
  fields: heroSectionFields,
  defaultProps: {
    data: {
      businessName: {
        field: "name",
        constantValue: "Business Name",
      },
      localGeoModifier: {
        field: "address.city",
        constantValue: "Geomodifier Name",
      },
      hours: {
        field: "hours",
        constantValue: {},
      },
      hero: {
        field: "",
        constantValue: {
          image: {
            height: 360,
            width: 640,
            url: PLACEHOLDER_IMAGE_URL,
          },
          primaryCta: {
            label: "Call To Action",
            link: "#",
            linkType: "URL",
          },
          secondaryCta: {
            label: "Call To Action",
            link: "#",
            linkType: "URL",
          },
        },
        constantValueOverride: {
          image: false,
          primaryCta: false,
          secondaryCta: false,
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
