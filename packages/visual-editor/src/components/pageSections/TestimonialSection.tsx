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
  MaybeRTF,
  TimestampOption,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";

export interface TestimonialSectionProps {
  data: {
    heading: YextEntityField<string>;
    testimonials: YextEntityField<TestimonialSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
    headingLevel: HeadingLevel;
  };
  liveVisibility: boolean;
}

const testimonialSectionFields: Fields<TestimonialSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<any, string>("Heading Text", {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      testimonials: YextField("Testimonial Section", {
        type: "entityField",
        filter: {
          types: [ComponentFields.TestimonialSection.type],
        },
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
      cardBackgroundColor: YextField("Card Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
      headingLevel: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
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

const TestimonialCard = ({
  testimonial,
  backgroundColor,
  sectionHeadingLevel,
}: {
  testimonial: TestimonialStruct;
  backgroundColor?: BackgroundStyle;
  sectionHeadingLevel: HeadingLevel;
}) => {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden border h-full">
      <Background
        background={backgroundColors.background1.value}
        className="p-8"
      >
        <MaybeRTF data={testimonial.description} />
      </Background>
      <Background background={backgroundColor} className="p-8">
        {testimonial.contributorName && (
          <Heading
            level={3}
            semanticLevelOverride={
              sectionHeadingLevel < 6
                ? ((sectionHeadingLevel + 1) as HeadingLevel)
                : "span"
            }
          >
            {testimonial.contributorName}
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
  const document = useDocument();
  const resolvedTestimonials = resolveYextEntityField(
    document,
    data.testimonials
  );
  const resolvedHeading = resolveYextEntityField(document, data.heading);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName="Heading Text"
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <div className="text-center">
            <Heading level={styles.headingLevel}>{resolvedHeading}</Heading>
          </div>
        </EntityField>
      )}
      {resolvedTestimonials?.testimonials && (
        <EntityField
          displayName="Testimonials"
          fieldId={data.testimonials.field}
          constantValueEnabled={data.testimonials.constantValueEnabled}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
            {resolvedTestimonials.testimonials.map((testimonial, index) => (
              <TestimonialCard
                key={index}
                testimonial={testimonial}
                backgroundColor={styles.cardBackgroundColor}
                sectionHeadingLevel={styles.headingLevel}
              />
            ))}
          </div>
        </EntityField>
      )}
    </PageSection>
  );
};

export const TestimonialSection: ComponentConfig<TestimonialSectionProps> = {
  label: "Testimonials Section",
  fields: testimonialSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background2.value,
      cardBackgroundColor: backgroundColors.background1.value,
      headingLevel: 2,
    },
    data: {
      heading: {
        field: "",
        constantValue: "Featured Testimonials",
        constantValueEnabled: true,
      },
      testimonials: {
        field: "",
        constantValue: {
          testimonials: [],
        },
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
