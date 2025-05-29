import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { HoursStatus, HoursType } from "@yext/pages-components";
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
  i18n,
} from "@yext/visual-editor";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface HeroSectionProps {
  data: {
    businessName: YextEntityField<string>;
    localGeoModifier: YextEntityField<string>;
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
  liveVisibility: boolean;
}

const heroSectionFields: Fields<HeroSectionProps> = {
  data: YextField(i18n("Data"), {
    type: "object",
    objectFields: {
      businessName: YextField<any, string>(i18n("Business Name"), {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      localGeoModifier: YextField<any, string>(i18n("Local GeoModifier"), {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      hours: YextField(i18n("Hours"), {
        type: "entityField",
        filter: {
          types: ["type.hours"],
        },
      }),
      hero: YextStructFieldSelector({
        label: i18n("Hero"),
        filter: {
          type: ComponentFields.HeroSection.type,
        },
      }),
    },
  }),
  styles: YextField(i18n("Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(i18n("Background Color"), {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      imageOrientation: YextField(i18n("Image Orientation"), {
        type: "radio",
        options: [
          { label: i18n("Left"), value: "left" },
          { label: i18n("Right"), value: "right" },
        ],
      }),
      businessNameLevel: YextField(i18n("Business Name Heading Level"), {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
      localGeoModifierLevel: YextField(
        i18n("Local GeoModifier Heading Level"),
        {
          type: "select",
          hasSearch: true,
          options: "HEADING_LEVEL",
        }
      ),
      primaryCTA: YextField(i18n("Primary CTA Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
      }),
      secondaryCTA: YextField(i18n("Secondary CTA Variant"), {
        type: "radio",
        options: "CTA_VARIANT",
      }),
    },
  }),
  liveVisibility: YextField(i18n("Visible on Live Page"), {
    type: "radio",
    options: [
      { label: i18n("Show"), value: true },
      { label: i18n("Hide"), value: false },
    ],
  }),
};

const HeroSectionWrapper = ({ data, styles }: HeroSectionProps) => {
  const document = useDocument() as any;
  const resolvedBusinessName = resolveYextEntityField<string>(
    document,
    data?.businessName
  );
  const resolvedLocalGeoModifier = resolveYextEntityField<string>(
    document,
    data?.localGeoModifier
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
      aria-label="Hero Banner"
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
        <header className="flex flex-col gap-y-4" aria-label="Hero Header">
          <section
            className="flex flex-col gap-y-0"
            aria-label="Business Information"
          >
            {resolvedBusinessName && (
              <EntityField
                displayName={i18n("Business Name")}
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
                displayName={i18n("Local GeoModifier")}
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
              displayName={i18n("Hours")}
              fieldId={data?.hours.field}
              constantValueEnabled={data?.hours.constantValueEnabled}
            >
              <HoursStatus hours={resolvedHours} timezone={timezone} />
            </EntityField>
          )}
        </header>
        {(resolvedHero?.primaryCta?.label ||
          resolvedHero?.secondaryCta?.label) && (
          <div
            className="flex flex-col gap-y-4 md:flex-row md:gap-x-4"
            aria-label="Call to Actions"
          >
            {resolvedHero?.primaryCta?.label && (
              <EntityField
                displayName={i18n("Primary CTA")}
                fieldId={data.hero.field}
                constantValueEnabled={
                  data.hero.constantValueOverride.primaryCta
                }
              >
                <CTA
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
                displayName={i18n("Secondary CTA")}
                fieldId={data.hero.field}
                constantValueEnabled={
                  data.hero.constantValueOverride.secondaryCta
                }
              >
                <CTA
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
          displayName={i18n("Image")}
          fieldId={data.hero.field}
          constantValueEnabled={data.hero.constantValueOverride.image}
        >
          <div className="w-full" role="region" aria-label="Hero Image">
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
  label: i18n("Hero Section"),
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
            label: i18n("Call To Action"),
            link: "#",
            linkType: "URL",
          },
          secondaryCta: {
            label: i18n("Call To Action"),
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
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <HeroSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
