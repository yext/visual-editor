import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  HoursStatus,
  HoursType,
  Image,
  ImageType,
} from "@yext/pages-components";
import {
  useDocument,
  resolveYextEntityField,
  EntityField,
  YextEntityField,
  YextEntityFieldSelector,
  BasicSelector,
  BackgroundStyle,
  backgroundColors,
} from "../../index.js";
import { CTA, CTAProps } from "./atoms/cta.js";
import { Heading, HeadingProps, headingOptions } from "./atoms/heading.js";
import { Section } from "./atoms/section.js";
// Define Props
interface HeroSectionProps {
  businessName: {
    entityField: YextEntityField<string>;
    level: HeadingProps["level"];
  };
  localGeoModifier: {
    entityField: YextEntityField<string>;
    level: HeadingProps["level"];
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
  image: {
    entityField: YextEntityField<ImageType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    imageOrientation: "left" | "right";
  };
}

//Define fields Should be of fields<props in step1>
const defaultFields: Fields<HeroSectionProps> = {
  businessName: {
    label: "Business Name",
    type: "object",
    objectFields: {
      entityField: YextEntityFieldSelector({
        label: "Name",
        filter: {
          types: ["type.string"],
        },
      }),
      level: BasicSelector("Heading Level", headingOptions),
    },
  },
  localGeoModifier: {
    label: "Local GeoModifier",
    type: "object",
    objectFields: {
      entityField: YextEntityFieldSelector({
        label: "Name",
        filter: {
          types: ["type.string"],
        },
      }),
      level: BasicSelector("Heading Level", headingOptions),
    },
  },
  hours: {
    label: "Hours",
    type: "object",
    objectFields: {
      entityField: YextEntityFieldSelector({
        label: "Hours Field",
        filter: {
          types: ["type.hours"],
        },
      }),
      showHours: {
        label: "Show Hours",
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
      },
    },
  },
  primaryCta: {
    label: "Primary CTA",
    type: "object",
    objectFields: {
      entityField: YextEntityFieldSelector({
        label: "Value",
        filter: {
          types: ["type.cta"],
        },
      }),
      variant: BasicSelector("Button Variant", [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Link", value: "link" },
      ]),
      showCTA: {
        label: "CTA",
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
      },
    },
  },
  secondaryCta: {
    label: "Secondary CTA",
    type: "object",
    objectFields: {
      entityField: YextEntityFieldSelector({
        label: "Value",
        filter: {
          types: ["type.cta"],
        },
      }),
      variant: BasicSelector("Variant", [
        { label: "Primary", value: "primary" },
        { label: "Secondary", value: "secondary" },
        { label: "Link", value: "link" },
      ]),
      showCTA: {
        label: "CTA",
        type: "radio",
        options: [
          { label: "Show", value: true },
          { label: "Hide", value: false },
        ],
      },
    },
  },
  image: {
    label: "Image",
    type: "object",
    objectFields: {
      entityField: YextEntityFieldSelector({
        label: "Photo",
        filter: {
          types: ["type.image"],
        },
      }),
    },
  },
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      backgroundColor: BasicSelector(
        "Background Color",
        Object.values(backgroundColors)
      ),
      imageOrientation: {
        label: "Image Orientation",
        type: "radio",
        options: [
          { label: "Left", value: "left" },
          { label: "Right", value: "right" },
        ],
      },
    },
  },
};
//Define the Component Wrapper with props
const HeroSectionWrapper = ({
  businessName: businessNameField,
  localGeoModifier: localGeoModifierField,
  hours: hoursField,
  primaryCta: primaryCtaField,
  secondaryCta: secondaryCtaField,
  image: imageField,
  styles,
}: HeroSectionProps) => {
  const document = useDocument();
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
  const image = resolveYextEntityField<ImageType>(
    document,
    imageField.entityField
  );

  return (
    <Section background={styles.backgroundColor}>
      <article
        className={`flex flex-col gap-6 md:gap-10 ${styles.imageOrientation === "right" ? `md:flex-row` : `md:flex-row-reverse`}`}
      >
        <article className="flex flex-col justify-center gap-y-6 w-full break-all md:gap-y-8">
          <header className="flex flex-col gap-y-4">
            <section className="flex flex-col gap-y-0">
              {businessName && (
                <EntityField
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
                fieldId={hoursField.entityField.field}
                constantValueEnabled={
                  hoursField.entityField.constantValueEnabled
                }
              >
                <HoursStatus
                  hours={hours}
                  timezone={Intl.DateTimeFormat().resolvedOptions().timeZone}
                />
              </EntityField>
            )}
          </header>

          <nav
            className="flex flex-col gap-y-4 md:flex-row md:gap-x-4"
            aria-label="Call to Action Buttons"
          >
            {primaryCta && primaryCtaField.showCTA && (
              <EntityField
                fieldId={primaryCtaField.entityField.field}
                constantValueEnabled={
                  primaryCtaField.entityField.constantValueEnabled
                }
              >
                <CTA
                  variant={primaryCtaField.variant}
                  label={primaryCta?.label ?? ""}
                  link={primaryCta?.link || "#"}
                  linkType={primaryCta?.linkType}
                />
              </EntityField>
            )}
            {secondaryCta && secondaryCtaField.showCTA && (
              <EntityField
                fieldId={secondaryCtaField.entityField.field}
                constantValueEnabled={
                  secondaryCtaField.entityField.constantValueEnabled
                }
              >
                <CTA
                  variant={secondaryCtaField.variant}
                  label={secondaryCta?.label ?? ""}
                  link={secondaryCta?.link || "#"}
                  linkType={secondaryCta?.linkType}
                />
              </EntityField>
            )}
          </nav>
        </article>
        {image && (
          <EntityField
            fieldId={imageField.entityField.field}
            constantValueEnabled={imageField.entityField.constantValueEnabled}
          >
            <figure className={`max-w-2xl`}>
              <Image
                image={image}
                className="w-full h-full object-cover rounded-md"
              />
            </figure>
          </EntityField>
        )}
      </article>
    </Section>
  );
};

// Create the component of type ComponentConfig<props>
const HeroSectionComponent: ComponentConfig<HeroSectionProps> = {
  label: "Hero Section",
  fields: defaultFields,
  defaultProps: {
    businessName: {
      entityField: {
        field: "name",
        constantValue: "Business Name",
        constantValueEnabled: undefined,
      },
      level: 3,
    },
    localGeoModifier: {
      entityField: {
        field: "address.city",
        constantValue: "Geomodifier Name",
        constantValueEnabled: undefined,
      },
      level: 1,
    },
    hours: {
      entityField: {
        field: "hours",
        constantValue: {},
        constantValueEnabled: undefined,
      },
      showHours: true,
    },
    primaryCta: {
      entityField: {
        field: "c_primaryCta",
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
        field: "c_secondaryCta",
        constantValue: {
          label: "Call To Action",
          link: "#",
          linkType: "URL",
        },
        constantValueEnabled: true,
      },
      variant: "seconday",
      showCTA: true,
    },
    image: {
      entityField: {
        field: "c_hero.image",
        constantValue: {
          alternateText: "placeholdder image",
          height: 360,
          width: 640,
          url: "https://placehold.co/640x360",
        },
        constantValueEnabled: undefined,
      },
    },
    styles: {
      imageOrientation: "right",
    },
  },

  render: (props) => <HeroSectionWrapper {...props} />,
};

export { HeroSectionComponent as HeroSection, type HeroSectionProps };
