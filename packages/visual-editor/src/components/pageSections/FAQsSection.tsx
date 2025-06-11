import { useTranslation } from "react-i18next";
import React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  EntityField,
  Heading,
  HeadingLevel,
  resolveYextEntityField,
  PageSection,
  useDocument,
  YextEntityField,
  YextField,
  VisibilityWrapper,
  TranslatableString,
  resolveTranslatableString,
  msg,
  pt,
  ThemeOptions,
  Body,
  FAQSectionType,
  ComponentFields,
  resolveTranslatableRTF2,
  FAQStruct,
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
    heading: {
      level: HeadingLevel;
      align: "left" | "center" | "right";
    };
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
          filter: { types: ["type.string"] },
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
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.headingLevel", "Level"), {
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
      className="flex flex-col gap-8 md:gap-12"
    >
      {resolvedHeading && (
        <EntityField
          displayName={pt("fields.heading", "Heading")}
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <div className={`flex ${justifyClass}`}>
            <Heading level={styles?.heading?.level ?? 2}>
              {resolvedHeading}
            </Heading>
          </div>
        </EntityField>
      )}
      {resolvedFAQs?.faqs && resolvedFAQs.faqs?.length > 0 && (
        <EntityField
          displayName={pt("fields.faqs", "FAQs")}
          fieldId={data?.faqs.field}
          constantValueEnabled={data?.faqs.constantValueEnabled}
        >
          <Accordion type="single" collapsible>
            {resolvedFAQs?.faqs?.map((faqItem: FAQStruct, index: number) => (
              <AccordionItem value={index.toString()} key={index}>
                <AccordionTrigger>
                  <Body>
                    {resolveTranslatableString(faqItem.question, i18n.language)}
                  </Body>
                </AccordionTrigger>
                <AccordionContent>
                  <EntityField
                    displayName={pt("fields.answer", "Answer")}
                    fieldId={data.faqs.field}
                    constantValueEnabled={data.faqs.constantValueEnabled}
                  >
                    <Body>
                      {resolveTranslatableRTF2(faqItem.answer, i18n.language)}
                    </Body>
                  </EntityField>
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
      heading: {
        level: 2,
        align: "left",
      },
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
