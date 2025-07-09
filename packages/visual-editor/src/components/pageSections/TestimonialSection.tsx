import { useTranslation } from "react-i18next";
import {
  HeadingLevel,
  BackgroundStyle,
  YextField,
  YextEntityField,
  useDocument,
  resolveYextEntityField,
  PageSection,
  Heading,
  EntityField,
  Background,
  backgroundColors,
  VisibilityWrapper,
  TestimonialSectionType,
  TestimonialStruct,
  Timestamp,
  ComponentFields,
  TimestampOption,
  TranslatableString,
  resolveTranslatableString,
  msg,
  pt,
  resolveTranslatableRichText,
  ThemeOptions,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import { defaultTestimonial } from "../../internal/puck/constant-value-fields/TestimonialSection.tsx";

export interface TestimonialSectionProps {
  data: {
    heading: YextEntityField<TranslatableString>;
    testimonials: YextEntityField<TestimonialSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    heading: {
      level: HeadingLevel;
      align: "left" | "center" | "right";
    };
    cards: {
      headingLevel: HeadingLevel;
      backgroundColor?: BackgroundStyle;
    };
  };
  liveVisibility: boolean;
}

const testimonialSectionFields: Fields<TestimonialSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>(
        msg("fields.headingText", "Heading Text"),
        {
          type: "entityField",
          filter: { types: ["type.string"] },
        }
      ),
      testimonials: YextField(
        msg("fields.testimonialSection", "Testimonial Section"),
        {
          type: "entityField",
          filter: {
            types: [ComponentFields.TestimonialSection.type],
          },
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
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.level", "Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          align: YextField(msg("fields.headingAlign", "Heading Align"), {
            type: "radio",
            options: ThemeOptions.ALIGNMENT,
          }),
        },
      }),
      cards: YextField(msg("fields.cards", "Cards"), {
        type: "object",
        objectFields: {
          headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          backgroundColor: YextField(
            msg("fields.backgroundColor", "Background Color"),
            {
              type: "select",
              options: "BACKGROUND_COLOR",
            }
          ),
        },
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: true },
      ],
    }
  ),
};

const TestimonialCard = ({
  testimonial,
  cardStyles,
  sectionHeadingLevel,
}: {
  testimonial: TestimonialStruct;
  cardStyles: TestimonialSectionProps["styles"]["cards"];
  sectionHeadingLevel: HeadingLevel;
}) => {
  const { i18n } = useTranslation();

  return (
    <div className="flex flex-col rounded-lg overflow-hidden border h-full">
      <Background
        background={backgroundColors.background1.value}
        className="p-8 grow"
      >
        {resolveTranslatableRichText(testimonial.description, i18n.language)}
      </Background>
      <Background background={cardStyles.backgroundColor} className="p-8">
        {testimonial.contributorName && (
          <Heading
            level={cardStyles.headingLevel}
            semanticLevelOverride={
              sectionHeadingLevel < 6
                ? ((sectionHeadingLevel + 1) as HeadingLevel)
                : "span"
            }
          >
            {resolveTranslatableString(
              testimonial.contributorName,
              i18n.language
            )}
          </Heading>
        )}
        {testimonial.contributionDate && (
          <Timestamp
            date={testimonial.contributionDate}
            option={TimestampOption.DATE}
            hideTimeZone={true}
          />
        )}
      </Background>
    </div>
  );
};

const TestimonialSectionWrapper = ({
  data,
  styles,
}: TestimonialSectionProps) => {
  const { i18n } = useTranslation();
  const document = useDocument();
  const resolvedTestimonials = resolveYextEntityField(
    document,
    data.testimonials
  );
  const resolvedHeading = resolveTranslatableString(
    resolveYextEntityField(document, data.heading),
    i18n.language
  );

  const justifyClass = styles?.heading?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.heading.align]
    : "justify-start";

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName={pt("fields.headingText", "Heading Text")}
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <div className={`flex ${justifyClass}`}>
            <Heading level={styles?.heading?.level}>{resolvedHeading}</Heading>
          </div>
        </EntityField>
      )}
      {resolvedTestimonials?.testimonials && (
        <EntityField
          displayName={pt("fields.testimonials", "Testimonials")}
          fieldId={data.testimonials.field}
          constantValueEnabled={data.testimonials.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            {resolvedTestimonials.testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                cardStyles={styles.cards}
                sectionHeadingLevel={styles.heading.level}
              />
            ))}
          </div>
        </EntityField>
      )}
    </PageSection>
  );
};

export const TestimonialSection: ComponentConfig<TestimonialSectionProps> = {
  label: msg("components.testimonialsSection", "Testimonials Section"),
  fields: testimonialSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background2.value,
      heading: {
        level: 2,
        align: "left",
      },
      cards: {
        backgroundColor: backgroundColors.background1.value,
        headingLevel: 3,
      },
    },
    data: {
      heading: {
        field: "",
        constantValue: {
          en: "Featured Testimonials",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      testimonials: {
        field: "",
        constantValue: {
          testimonials: [
            defaultTestimonial,
            defaultTestimonial,
            defaultTestimonial,
          ],
        },
        constantValueEnabled: true,
      },
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <TestimonialSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
