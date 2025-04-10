import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  YextEntityField,
  YextEntityFieldSelector,
  useDocument,
  resolveYextEntityField,
  BasicSelector,
  ThemeOptions,
  Heading,
  HeadingLevel,
  Body,
  PageSection,
  backgroundColors,
  BackgroundStyle,
  Background,
} from "../../index.js";

export interface TestimonialsProps {
  backgroundColor?: BackgroundStyle;
  cardBackgroundColor?: BackgroundStyle;
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingLevel;
  };
  testimonials: Array<{
    testimonial: YextEntityField<string>;
    authorName: YextEntityField<string>;
    date: YextEntityField<string>;
  }>;
}

const testimonialFields: Fields<TestimonialsProps> = {
  backgroundColor: BasicSelector(
    "Background Color",
    ThemeOptions.BACKGROUND_COLOR
  ),
  cardBackgroundColor: BasicSelector(
    "Card Background Color",
    ThemeOptions.BACKGROUND_COLOR
  ),
  sectionHeading: {
    type: "object",
    label: "Section Heading",
    objectFields: {
      text: YextEntityFieldSelector<any, string>({
        label: "Text",
        filter: {
          types: ["type.string"],
        },
      }),
      level: BasicSelector("Heading Level", ThemeOptions.HEADING_LEVEL),
    },
  },
  testimonials: {
    type: "array",
    label: "Testimonials",
    arrayFields: {
      testimonial: YextEntityFieldSelector<any, string>({
        label: "Testimonial",
        filter: {
          types: ["type.string"],
        },
      }),
      authorName: YextEntityFieldSelector<any, string>({
        label: "Author Name",
        filter: {
          types: ["type.string"],
        },
      }),
      date: YextEntityFieldSelector<any, string>({
        label: "Date",
        filter: {
          types: ["type.string"],
        },
      }),
    },
  },
};

const TestimonialsWrapper: React.FC<TestimonialsProps> = (props) => {
  const { backgroundColor, cardBackgroundColor, sectionHeading, testimonials } =
    props;
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );

  return (
    <PageSection background={backgroundColor} className="flex flex-col gap-12">
      {resolvedHeading && (
        <div className="text-center">
          <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {testimonials.map((testimonial, index) => {
          const resolvedTestimonial = resolveYextEntityField<string>(
            document,
            testimonial.testimonial
          );
          const resolvedAuthor = resolveYextEntityField<string>(
            document,
            testimonial.authorName
          );
          const resolvedDate = resolveYextEntityField<string>(
            document,
            testimonial.date
          );

          return (
            <div
              key={index}
              className={`flex flex-col rounded-lg overflow-hidden border`}
            >
              <Background
                background={backgroundColors.background1.value}
                className="p-8"
              >
                {resolvedTestimonial && (
                  <Body className="line-clamp-5">{resolvedTestimonial}</Body>
                )}
              </Background>
              <Background background={cardBackgroundColor} className="p-8">
                {resolvedAuthor && (
                  <Heading level={3}>{resolvedAuthor}</Heading>
                )}
                {resolvedDate && <Body variant="sm">{resolvedDate}</Body>}
              </Background>
            </div>
          );
        })}
      </div>
    </PageSection>
  );
};

export const Testimonials: ComponentConfig<TestimonialsProps> = {
  label: "Testimonials",
  fields: testimonialFields,
  defaultProps: {
    backgroundColor: backgroundColors.background1.value,
    cardBackgroundColor: backgroundColors.background2.value,
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Testimonials",
        constantValueEnabled: true,
      },
      level: 2,
    },
    testimonials: [
      {
        testimonial: {
          field: "",
          constantValue:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          constantValueEnabled: true,
        },
        authorName: {
          field: "",
          constantValue: "Name",
          constantValueEnabled: true,
        },
        date: {
          field: "",
          constantValue: "July 22, 2022",
          constantValueEnabled: true,
        },
      },
      {
        testimonial: {
          field: "",
          constantValue:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          constantValueEnabled: true,
        },
        authorName: {
          field: "",
          constantValue: "Name",
          constantValueEnabled: true,
        },
        date: {
          field: "",
          constantValue: "July 22, 2022",
          constantValueEnabled: true,
        },
      },
      {
        testimonial: {
          field: "",
          constantValue:
            "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
          constantValueEnabled: true,
        },
        authorName: {
          field: "",
          constantValue: "Name",
          constantValueEnabled: true,
        },
        date: {
          field: "",
          constantValue: "July 22, 2022",
          constantValueEnabled: true,
        },
      },
    ],
  },
  render: (props) => <TestimonialsWrapper {...props} />,
};
