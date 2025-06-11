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
  msg,
  pt,
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
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>(
        msg("fields.sectionHeading", "Section Heading"),
        {
          type: "entityField",
          filter: {
            types: ["type.string"],
          },
        }
      ),
      faqs: YextField(msg("fields.faqs", "FAQs"), {
        type: "entityField",
        filter: {
          types: [ComponentFields.FAQSection.type],
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          hasSearch: true,
          options: "BACKGROUND_COLOR",
        }
      ),
      headingLevel: YextField(msg("fields.headingLevel", "Heading Level"), {
        type: "select",
        hasSearch: true,
        options: "HEADING_LEVEL",
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

const FAQsSectionComponent: React.FC<FAQSectionProps> = ({ data, styles }) => {
  const { i18n } = useTranslation();
  const document = useDocument();
  const resolvedHeading = resolveTranslatableString(
    resolveYextEntityField<TranslatableString>(document, data?.heading),
    i18n.language
  );
  const resolvedFAQs = resolveYextEntityField(document, data?.faqs);

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8 md:gap-12"
    >
      {resolvedHeading && (
        <EntityField
          displayName={pt("fields.headingText", "Heading Text")}
          fieldId={data?.heading.field}
          constantValueEnabled={data?.heading.constantValueEnabled}
        >
          <Heading level={styles?.headingLevel}>{resolvedHeading}</Heading>
        </EntityField>
      )}
      {resolvedFAQs?.faqs && resolvedFAQs.faqs?.length > 0 && (
        <EntityField
          displayName={pt("fields.faqs", "FAQs")}
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
  label: msg("components.faqsSection", "FAQs Section"),
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
