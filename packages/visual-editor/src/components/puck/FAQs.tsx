import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  YextEntityField,
  YextEntityFieldSelector,
  Body,
  BasicSelector,
  ThemeOptions,
  HeadingProps,
  BackgroundStyle,
  PageSection,
  Heading,
  backgroundColors,
} from "../../index.js";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./atoms/accordion.js";

const DEFAULT_FAQ = {
  question: "Question Lorem ipsum dolor sit amet?",
  answer:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
};

export interface FAQsSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingProps["level"];
  };
  cards: Array<{
    question: string;
    answer: string;
  }>;
}

const FAQsSectionFields: Fields<FAQsSectionProps> = {
  styles: {
    label: "Styles",
    type: "object",
    objectFields: {
      backgroundColor: BasicSelector(
        "Background Color",
        ThemeOptions.BACKGROUND_COLOR
      ),
    },
  },
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
  cards: {
    type: "array",
    label: "FAQs",
    arrayFields: {
      question: {
        label: "Question",
        type: "text",
      },
      answer: {
        label: "Answer",
        type: "textarea",
      },
    },
  },
};

const FAQsSectionWrapper: React.FC<FAQsSectionProps> = ({
  styles,
  sectionHeading,
  cards,
}) => {
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8 md:gap-12"
    >
      {resolvedHeading && (
        <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
      )}
      <Accordion type="single" collapsible>
        {cards.map((faqItem, index) => (
          <AccordionItem value={index.toString()} key={index}>
            <AccordionTrigger>
              <Body variant="lg" className="font-bold text-left">
                {faqItem.question}
              </Body>
            </AccordionTrigger>
            <AccordionContent>
              <Body variant="base">{faqItem.answer}</Body>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </PageSection>
  );
};

export const FAQsSection: ComponentConfig<FAQsSectionProps> = {
  label: "FAQs Section",
  fields: FAQsSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background2.value,
    },
    sectionHeading: {
      text: {
        field: "",
        constantValue: "Frequently Asked Questions",
        constantValueEnabled: true,
      },
      level: 2,
    },
    cards: [DEFAULT_FAQ, DEFAULT_FAQ, DEFAULT_FAQ],
  },
  render: (props) => <FAQsSectionWrapper {...props} />,
};
