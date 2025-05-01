import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  useDocument,
  resolveYextEntityField,
  YextEntityField,
  Body,
  HeadingProps,
  BackgroundStyle,
  PageSection,
  Heading,
  backgroundColors,
  YextField,
  VisibilityWrapper,
} from "@yext/visual-editor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../atoms/accordion.js";
import { LexicalRichText } from "@yext/pages-components";

/** TODO remove types when spruce is ready */
type FAQs = Array<FAQStruct>;

type FAQStruct = {
  question: string; // single-line text
  answer: RTF2;
};

type RTF2 = {
  json?: Record<string, any>;
};
/** end of hardcoded types */

export interface FAQsSectionProps {
  styles: {
    backgroundColor?: BackgroundStyle;
  };
  sectionHeading: {
    text: YextEntityField<string>;
    level: HeadingProps["level"];
  };
  FAQs: YextEntityField<FAQs>;
  liveVisibility: boolean;
}

const FAQsSectionFields: Fields<FAQsSectionProps> = {
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "BACKGROUND_COLOR",
      }),
    },
  }),
  sectionHeading: YextField("Section Heading", {
    type: "object",
    objectFields: {
      text: YextField<any, string>("Text", {
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
  FAQs: YextField("FAQs Section", {
    type: "entityField",
    filter: {
      types: ["type.faqs"],
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

const FAQsSectionComponent: React.FC<FAQsSectionProps> = ({
  styles,
  sectionHeading,
  FAQs,
}) => {
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );
  const resolvedFAQs = resolveYextEntityField(document, FAQs);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8 md:gap-12"
    >
      {resolvedHeading && (
        <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
      )}
      <Accordion type="single" collapsible>
        {resolvedFAQs?.map((faqItem, index) => (
          <AccordionItem value={index.toString()} key={index}>
            <AccordionTrigger>
              <Body variant="lg" className="font-bold text-left">
                {faqItem.question}
              </Body>
            </AccordionTrigger>
            <AccordionContent>
              <Body variant="base">
                <LexicalRichText
                  serializedAST={JSON.stringify(faqItem.answer.json) ?? ""}
                />
              </Body>
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
    FAQs: {
      field: "",
      constantValue: [],
      constantValueEnabled: false,
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <FAQsSectionComponent {...props} />
    </VisibilityWrapper>
  ),
};
