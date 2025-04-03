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
  Section,
  backgroundColors,
  BackgroundStyle,
} from "../../index.js";

export interface TestimonialCardProps {
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

const testimonialCardFields: Fields<TestimonialCardProps> = {
  backgroundColor: BasicSelector(
    "Background Color",
    Object.values(backgroundColors)
  ),
  cardBackgroundColor: BasicSelector(
    "Card Background Color",
    Object.values(backgroundColors)
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

const TestimonialCardWrapper: React.FC<TestimonialCardProps> = (props) => {
  const { backgroundColor, cardBackgroundColor, sectionHeading, testimonials } =
    props;
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );

  return (
    <Section background={backgroundColor} className="components">
      <div className="flex flex-col gap-12 p-8">
        {resolvedHeading && (
          <div className="text-center">
            <Heading
              level={sectionHeading.level}
              className="text-palette-background"
            >
              {resolvedHeading}
            </Heading>
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
                className={`flex flex-col rounded-lg overflow-hidden`}
              >
                <Section className="flex-grow p-6 bg-white">
                  {resolvedTestimonial && (
                    <Body variant="base" className="text-black">
                      {resolvedTestimonial}
                    </Body>
                  )}
                </Section>
                <Section background={cardBackgroundColor} className="p-4">
                  {resolvedAuthor && (
                    <Heading level={3} className="text-palette-foreground">
                      {resolvedAuthor}
                    </Heading>
                  )}
                  {resolvedDate && (
                    <Body variant="sm" className="text-palette-foreground">
                      {resolvedDate}
                    </Body>
                  )}
                </Section>
              </div>
            );
          })}
        </div>
      </div>
    </Section>
  );
};

export const TestimonialCard: ComponentConfig<TestimonialCardProps> = {
  label: "Testimonials",
  fields: testimonialCardFields,
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
  render: (props) => <TestimonialCardWrapper {...props} />,
};
