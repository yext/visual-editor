import { useTranslation } from "react-i18next";
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
  FAQSectionType,
  ComponentFields,
  TranslatableString,
  resolveTranslatableString,
  MaybeRTF,
} from "@yext/visual-editor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../atoms/accordion.js";

export interface FAQSectionProps {
  data: {
    heading: YextEntityField<TranslatableString>;
    faqs: YextEntityField<FAQSectionType>;
  };
  styles: {
    backgroundColor?: BackgroundStyle;
    headingLevel: HeadingProps["level"];
  };
  liveVisibility: boolean;
}

const FAQsSectionFields: Fields<FAQSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>("Section Heading", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
        isTranslatable: true,
      }),
      faqs: YextField("FAQs", {
        type: "entityField",
        filter: {
          types: [ComponentFields.FAQSection.type],
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

const FAQsSectionComponent: React.FC<FAQSectionProps> = ({ data, styles }) => {
  const { t } = useTranslation();
  const document = useDocument();
  const resolvedHeading = resolveTranslatableString(
    resolveYextEntityField<TranslatableString>(document, data?.heading)
  );
  const resolvedFAQs = resolveYextEntityField(document, data?.faqs);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8 md:gap-12"
    >
      {resolvedHeading && (
        <EntityField
          displayName={t("headingText", "Heading Text")}
          fieldId={data?.heading.field}
          constantValueEnabled={data?.heading.constantValueEnabled}
        >
          <Heading level={styles?.headingLevel}>{resolvedHeading}</Heading>
        </EntityField>
      )}
      {resolvedFAQs?.faqs && resolvedFAQs.faqs?.length > 0 && (
        <EntityField
          displayName={t("faqs", "FAQs")}
          fieldId={data?.faqs.field}
          constantValueEnabled={data?.faqs.constantValueEnabled}
        >
          <Accordion type="single" collapsible>
            {resolvedFAQs?.faqs?.map((faqItem, index) => (
              <AccordionItem value={index.toString()} key={index}>
                <AccordionTrigger>
                  <Body variant="lg" className="font-bold text-left">
                    {faqItem.question}
                  </Body>
                </AccordionTrigger>
                <AccordionContent>
                  <MaybeRTF data={faqItem.answer} />
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </EntityField>
      )}
    </PageSection>
  );
};

export const FAQSection: ComponentConfig<FAQSectionProps> = {
  label: "FAQs Section",
  fields: FAQsSectionFields,
  defaultProps: {
    data: {
      heading: {
        field: "",
        constantValue: "Frequently Asked Questions",
        constantValueEnabled: true,
      },
      faqs: {
        field: "",
        constantValue: {
          faqs: [],
        },
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
