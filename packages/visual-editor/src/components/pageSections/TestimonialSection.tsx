import {
  HeadingLevel,
  BackgroundStyle,
  YextField,
  YextEntityField,
  useDocument,
  resolveYextEntityField,
  PageSection,
  Body,
  Heading,
  EntityField,
  Background,
  backgroundColors,
} from "@yext/visual-editor";
import { LexicalRichText } from "@yext/pages-components";
import { ComponentConfig, Fields } from "@measured/puck";

/** TODO remove types when spruce is ready */
type Testimonials = Array<TestimonialStruct>;

type TestimonialStruct = {
  description?: RTF2;
  contributorName?: string; // single line text
  contributionDateTime?: string; // dateTime
};

type RTF2 = {
  json?: Record<string, any>;
};
/** end of hardcoded types */

export interface TestimonialSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
    cardBackgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  testimonials: YextEntityField<Testimonials>;
}

const testimonialSectionFields: Fields<TestimonialSectionProps> = {
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
    },
  }),
  sectionHeading: YextField("Section Heading", {
    type: "object",
    objectFields: {
      text: YextField<any, string>("Heading Text", {
        type: "entityField",
        filter: { types: ["type.string"] },
      }),
      level: YextField("Heading Level", {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  testimonials: YextField("Testimonial Section", {
    type: "entityField",
    filter: {
      types: ["type.testimonial"],
    },
  }),
};

const TestimonialCard = ({
  testimonial,
  backgroundColor,
}: {
  testimonial: TestimonialStruct;
  backgroundColor?: BackgroundStyle;
}) => {
  return (
    <div className="flex flex-col rounded-lg overflow-hidden border h-full">
      <Background
        background={backgroundColors.background1.value}
        className="p-8"
      >
        {testimonial.description && (
          <Body>
            <LexicalRichText
              serializedAST={JSON.stringify(testimonial.description.json) ?? ""}
            />
          </Body>
        )}
      </Background>
      <Background background={backgroundColor} className="p-8">
        {testimonial.contributorName && (
          <Heading level={3}>{testimonial.contributorName}</Heading>
        )}
        {testimonial.contributionDateTime && (
          <Body variant="sm">{testimonial.contributionDateTime}</Body>
        )}
      </Background>
    </div>
  );
};

const TestimonialSectionWrapper = ({
  styles,
  sectionHeading,
  testimonials,
}: TestimonialSectionProps) => {
  const document = useDocument();
  const resolvedTestimonials = resolveYextEntityField(document, testimonials);
  const resolvedHeading = resolveYextEntityField(document, sectionHeading.text);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <div className="text-center">
          <EntityField
            displayName="Heading Text"
            fieldId={sectionHeading.text.field}
            constantValueEnabled={sectionHeading.text.constantValueEnabled}
          >
            <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
          </EntityField>
        </div>
      )}
      {resolvedTestimonials && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center">
          {resolvedTestimonials.map((testimonial, index) => (
            <TestimonialCard
              key={index}
              testimonial={testimonial}
              backgroundColor={styles.cardBackgroundColor}
            />
          ))}
        </div>
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
    },
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Featured Testimonials",
        constantValueEnabled: true,
      },
      level: 2,
    },
    testimonials: {
      field: "",
      constantValue: [],
      constantValueEnabled: false,
    },
  },
  render: (props) => <TestimonialSectionWrapper {...props} />,
};
