import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { HoursStatus, HoursType } from "@yext/pages-components";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  Image,
  ImageProps,
  ImageWrapperProps,
  backgroundColors,
  BackgroundStyle,
  HeadingLevel,
  CTA,
  CTAProps,
  Heading,
  PageSection,
  YextField,
  VisibilityWrapper,
} from "@yext/visual-editor";
import {
  ImageWrapperFields,
  resolvedImageFields,
} from "../contentBlocks/Image.js";

const PLACEHOLDER_IMAGE_URL = "https://placehold.co/640x360";

export interface HeroSectionProps {
  image: ImageWrapperProps;
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
  primaryCta: {
    entityField: YextEntityField<CTAProps>;
    variant: CTAProps["variant"];
    showCTA: boolean;
  };
  secondaryCta: {
    entityField: YextEntityField<CTAProps>;
    variant: CTAProps["variant"];
    showCTA: boolean;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    imageOrientation: "left" | "right";
  };
  liveVisibility: boolean;
}

const heroSectionFields: Fields<HeroSectionProps> = {
  image: YextField("Image", {
    type: "object",
    objectFields: {
      ...ImageWrapperFields,
      image: {
        ...ImageWrapperFields.image,
        label: "Value",
      },
    },
  }),
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
  primaryCta: YextField("Primary CTA", {
    type: "object",
    objectFields: {
      entityField: YextField("Value", {
        type: "entityField",
        filter: {
          types: ["type.cta"],
        },
      }),
      variant: YextField("Button Variant", {
        type: "radio",
        options: "CTA_VARIANT",
      }),
      showCTA: YextField("CTA", {
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
      }),
    },
  }),
  secondaryCta: YextField("Secondary CTA", {
    type: "object",
    objectFields: {
      entityField: YextField("Value", {
        type: "entityField",
        filter: {
          types: ["type.cta"],
        },
      }),
      variant: YextField("Button Variant", {
        type: "radio",
        options: "CTA_VARIANT",
      }),
      showCTA: YextField("CTA", {
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
      }),
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
  businessName: businessNameField,
  localGeoModifier: localGeoModifierField,
  hours: hoursField,
  primaryCta: primaryCtaField,
  secondaryCta: secondaryCtaField,
  image: imageField,
  styles,
}: HeroSectionProps) => {
  const document = useDocument() as any;
  const businessName = resolveYextEntityField<string>(
    document,
    businessNameField.entityField
  );
  const localGeoModifier = resolveYextEntityField<string>(
    document,
    localGeoModifierField.entityField
  );
  const hours = resolveYextEntityField<HoursType>(
    document,
    hoursField.entityField
  );
  const primaryCta = resolveYextEntityField<CTAProps>(
    document,
    primaryCtaField.entityField
  );
  const secondaryCta = resolveYextEntityField<CTAProps>(
    document,
    secondaryCtaField.entityField
  );
  const image = resolveYextEntityField<ImageProps["image"]>(
    document,
    imageField.image
  );

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
            {businessName && (
              <EntityField
                displayName="Business Name"
                fieldId={businessNameField.entityField.field}
                constantValueEnabled={
                  businessNameField.entityField.constantValueEnabled
                }
              >
                <Heading level={businessNameField.level}>
                  {businessName}
                </Heading>
              </EntityField>
            )}
            {localGeoModifier && (
              <EntityField
                displayName="Local GeoModifier"
                fieldId={localGeoModifierField.entityField.field}
                constantValueEnabled={
                  localGeoModifierField.entityField.constantValueEnabled
                }
              >
                <Heading level={localGeoModifierField.level}>
                  {localGeoModifier}
                </Heading>
              </EntityField>
            )}
          </section>
          {hours && hoursField.showHours && (
            <EntityField
              displayName="Hours"
              fieldId={hoursField.entityField.field}
              constantValueEnabled={hoursField.entityField.constantValueEnabled}
            >
              <HoursStatus hours={hours} timezone={timezone} />
            </EntityField>
          )}
        </header>
        {((primaryCta && primaryCtaField.showCTA) ||
          (secondaryCta && secondaryCtaField.showCTA)) && (
          <div
            className="flex flex-col gap-y-4 md:flex-row md:gap-x-4"
            aria-label="Call to Actions"
          >
            {primaryCta && primaryCtaField.showCTA && (
              <EntityField
                displayName="Primary CTA"
                fieldId={primaryCtaField.entityField.field}
                constantValueEnabled={
                  primaryCtaField.entityField.constantValueEnabled
                }
              >
                <CTA
                  variant={primaryCtaField.variant}
                  label={primaryCta.label}
                  link={primaryCta.link}
                  linkType={primaryCta.linkType}
                />
              </EntityField>
            )}
            {secondaryCta && secondaryCtaField.showCTA && (
              <EntityField
                displayName="Secondary CTA"
                fieldId={secondaryCtaField.entityField.field}
                constantValueEnabled={
                  secondaryCtaField.entityField.constantValueEnabled
                }
              >
                <CTA
                  variant={secondaryCtaField.variant}
                  label={secondaryCta.label}
                  link={secondaryCta.link}
                  linkType={secondaryCta.linkType}
                />
              </EntityField>
            )}
          </div>
        )}
      </div>
      {image && (
        <div className="w-full" role="region" aria-label="Hero Image">
          <EntityField
            displayName="Image"
            fieldId={imageField.image.field}
            constantValueEnabled={imageField.image.constantValueEnabled}
          >
            <Image
              image={image}
              layout={imageField.layout}
              width={imageField.width}
              height={imageField.height}
              aspectRatio={imageField.aspectRatio}
            />
          </EntityField>
        </div>
      )}
    </PageSection>
  );
};

export const HeroSection: ComponentConfig<HeroSectionProps> = {
  label: "Hero Section",
  fields: heroSectionFields,
  defaultProps: {
    image: {
      image: {
        field: "",
        constantValue: {
          height: 360,
          width: 640,
          url: PLACEHOLDER_IMAGE_URL,
        },
      },
      layout: "auto",
      aspectRatio: 1.78,
    },
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
    primaryCta: {
      entityField: {
        field: "",
        constantValue: {
          label: "Call To Action",
          link: "#",
          linkType: "URL",
        },
        constantValueEnabled: true,
      },
      variant: "primary",
      showCTA: true,
    },
    secondaryCta: {
      entityField: {
        field: "",
        constantValue: {
          label: "Call To Action",
          link: "#",
          linkType: "URL",
        },
        constantValueEnabled: true,
      },
      variant: "secondary",
      showCTA: true,
    },
    styles: {
      backgroundColor: backgroundColors.background1.value,
      imageOrientation: "right",
    },
    liveVisibility: true,
  },
  resolveFields(data) {
    return {
      ...heroSectionFields,
      image: {
        ...heroSectionFields.image,
        objectFields: resolvedImageFields(data.props.image.layout),
      },
    };
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
