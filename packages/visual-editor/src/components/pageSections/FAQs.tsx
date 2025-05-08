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
  EntityField,
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
  data: {
    heading: YextEntityField<string>;
    FAQs: YextEntityField<FAQs>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    headingLevel: HeadingProps["level"];
  };
  liveVisibility: boolean;
}

const FAQsSectionFields: Fields<FAQsSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<any, string>("Section Heading", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
      FAQs: YextField("FAQs", {
        type: "entityField",
        filter: {
          types: ["type.faqs_section"],
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

const FAQsSectionComponent: React.FC<FAQsSectionProps> = ({ data, styles }) => {
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField<string>(
    document,
    data.heading
  );
  const resolvedFAQs = resolveYextEntityField(document, data.FAQs);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8 md:gap-12"
    >
      {resolvedHeading && (
        <EntityField
          displayName="Heading Text"
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <Heading level={styles.headingLevel}>{resolvedHeading}</Heading>
        </EntityField>
      )}
      {resolvedFAQs && resolvedFAQs.length > 0 && (
        <EntityField
          displayName="FAQs"
          fieldId={data.FAQs.field}
          constantValueEnabled={data.FAQs.constantValueEnabled}
        >
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
        </EntityField>
      )}
    </PageSection>
  );
};

export const FAQsSection: ComponentConfig<FAQsSectionProps> = {
  label: "FAQs Section",
  fields: FAQsSectionFields,
  defaultProps: {
    data: {
      heading: {
        field: "",
        constantValue: "Frequently Asked Questions",
        constantValueEnabled: true,
      },
      FAQs: {
        field: "",
        constantValue: [],
        constantValueEnabled: false,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background2.value,
      headingLevel: 2,
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
