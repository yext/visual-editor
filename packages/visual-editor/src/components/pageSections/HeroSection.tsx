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
} from "@yext/visual-editor";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface HeroSectionProps {
  businessName: {
    entityField: YextEntityField<string>;
    level: HeadingLevel;
  };
  localGeoModifier: {
    entityField: YextEntityField<string>;
    level: HeadingLevel;
  };
  hours: {
    entityField: YextEntityField<HoursType>;
    showHours: boolean;
  };
  hero: YextEntityField<HeroSectionType>;
  styles: {
    backgroundColor?: BackgroundStyle;
    imageOrientation: "left" | "right";
  };
  liveVisibility: boolean;
}

const heroSectionFields: Fields<HeroSectionProps> = {
  businessName: YextField("Business Name", {
    type: "object",
    objectFields: {
      entityField: YextField<any, string>("Value", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      level: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  localGeoModifier: YextField("Local GeoModifier", {
    type: "object",
    objectFields: {
      entityField: YextField<any, string>("Value", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      level: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  hours: YextField("Hours", {
    type: "object",
    objectFields: {
      entityField: YextField("Hours Field", {
        type: "entityField",
        filter: {
          types: ["type.hours"],
        },
      }),
      showHours: YextField("Show Hours", {
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
      }),
    },
  }),
  hero: YextField("Hero", {
    type: "entityField",
    filter: {
      types: ["type.hero_section"],
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      imageOrientation: YextField("Image Orientation", {
        type: "radio",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      }),
    },
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const HeroSectionWrapper = ({
  businessName,
  localGeoModifier,
  hours,
  hero,
  styles,
}: HeroSectionProps) => {
  const document = useDocument() as any;
  const resolvedBusinessName = resolveYextEntityField<string>(
    document,
    businessName.entityField
  );
  const resolvedLocalGeoModifier = resolveYextEntityField<string>(
    document,
    localGeoModifier.entityField
  );
  const resolvedHours = resolveYextEntityField<HoursType>(
    document,
    hours.entityField
  );
  const resolvedHero = resolveYextEntityField(document, hero);

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
                displayName="Business Name"
                fieldId={businessName.entityField.field}
                constantValueEnabled={
                  businessName.entityField.constantValueEnabled
                }
              >
                <Heading level={businessName.level}>
                  {resolvedBusinessName}
                </Heading>
              </EntityField>
            )}
            {resolvedLocalGeoModifier && (
              <EntityField
                displayName="Local GeoModifier"
                fieldId={localGeoModifier.entityField.field}
                constantValueEnabled={
                  localGeoModifier.entityField.constantValueEnabled
                }
              >
                <Heading level={localGeoModifier.level}>
                  {resolvedLocalGeoModifier}
                </Heading>
              </EntityField>
            )}
          </section>
          {resolvedHours && hours.showHours && (
            <EntityField
              displayName="Hours"
              fieldId={hours.entityField.field}
              constantValueEnabled={hours.entityField.constantValueEnabled}
            >
              <HoursStatus hours={resolvedHours} timezone={timezone} />
            </EntityField>
          )}
        </header>
        {(resolvedHero?.primaryCta || resolvedHero?.secondaryCta) && (
          <div
            className="flex flex-col gap-y-4 md:flex-row md:gap-x-4"
            aria-label="Call to Actions"
          >
            {resolvedHero?.primaryCta?.label && (
              <CTA
                variant="primary"
                label={resolvedHero.primaryCta.label}
                link={resolvedHero.primaryCta.link}
                linkType={resolvedHero.primaryCta.linkType}
                className={"py-3"}
              />
            )}
            {resolvedHero?.secondaryCta?.label && (
              <CTA
                variant="secondary"
                label={resolvedHero.secondaryCta.label}
                link={resolvedHero.secondaryCta.link}
                linkType={resolvedHero.secondaryCta.linkType}
                className={"py-3"}
              />
            )}
          </div>
        )}
      </div>
      {resolvedHero?.image && (
        <div className="w-full" role="region" aria-label="Hero Image">
          <Image
            image={resolvedHero?.image}
            layout="auto"
            aspectRatio={resolvedHero?.image.width / resolvedHero?.image.height}
          />
        </div>
      )}
    </PageSection>
  );
};

export const HeroSection: ComponentConfig<HeroSectionProps> = {
  label: "Hero Section",
  fields: heroSectionFields,
  defaultProps: {
    businessName: {
      entityField: {
        field: "name",
        constantValue: "Business Name",
      },
      level: 3,
    },
    localGeoModifier: {
      entityField: {
        field: "address.city",
        constantValue: "Geomodifier Name",
      },
      level: 1,
    },
    hours: {
      entityField: {
        field: "hours",
        constantValue: {},
      },
      showHours: true,
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
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      imageOrientation: "right",
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
