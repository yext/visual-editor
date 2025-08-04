import { useTranslation } from "react-i18next";
import React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import { defaultFAQ } from "../../internal/puck/constant-value-fields/FAQsSection.tsx";
import {
  backgroundColors,
  BackgroundStyle,
  EntityField,
  Heading,
  HeadingLevel,
  PageSection,
  useDocument,
  YextEntityField,
  YextField,
  VisibilityWrapper,
  TranslatableString,
  msg,
  pt,
  ThemeOptions,
  Body,
  FAQSectionType,
  ComponentFields,
  FAQStruct,
  getAnalyticsScopeHash,
  resolveComponentData,
} from "@yext/visual-editor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../atoms/accordion.js";
import { AnalyticsScopeProvider, useAnalytics } from "@yext/pages-components";

export interface FAQData {
  /**
   * The main heading for the entire events section.
   * @defaultValue "Frequently Asked Questions" (constant)
   */
  heading: YextEntityField<TranslatableString>;

  /**
   * The source of the FAQ data (questions and answers), which can be linked to a Yext field or provided as a constant.
   * @defaultValue A list of 3 placeholder FAQs.
   */
  faqs: YextEntityField<FAQSectionType>;
}

export interface FAQStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: BackgroundStyle;

  /** Styling for the heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };
}

export interface FAQSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: FAQData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: FAQStyles;

  /** @internal */
  analytics?: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
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
          options: "BACKGROUND_COLOR",
        }
      ),
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.level", "Level"), {
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
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedHeading = resolveComponentData(
    data?.heading,
    locale,
    streamDocument
  );
  const resolvedFAQs = resolveComponentData(data?.faqs, locale, streamDocument);
  const analytics = useAnalytics();

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
          <Accordion>
            {resolvedFAQs?.faqs?.map((faqItem: FAQStruct, index: number) => (
              <AccordionItem
                key={index}
                data-ya-action={
                  analytics?.getDebugEnabled() ? "EXPAND/COLLAPSE" : undefined
                }
                data-ya-eventname={
                  analytics?.getDebugEnabled() ? `toggleFAQ${index}` : undefined
                }
                onToggle={(e) =>
                  e.currentTarget.open // the updated state after toggling
                    ? analytics?.track({
                        action: "EXPAND",
                        eventName: `toggleFAQ${index}`,
                      })
                    : analytics?.track({
                        action: "COLLAPSE",
                        eventName: `toggleFAQ${index}`,
                      })
                }
              >
                <AccordionTrigger>
                  <Body>
                    {resolveComponentData(faqItem.question, i18n.language)}
                  </Body>
                </AccordionTrigger>
                <AccordionContent>
                  <EntityField
                    displayName={pt("fields.answer", "Answer")}
                    fieldId={data.faqs.field}
                    constantValueEnabled={data.faqs.constantValueEnabled}
                  >
                    <Body>
                      {resolveComponentData(faqItem.answer, i18n.language)}
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

/**
 * The FAQ Section component displays a list of questions and answers in an organized format. It includes a main heading for the section and typically renders the FAQs as an accordion, where users can click on a question to reveal the answer.
 * Available on Location templates.
 */
export const FAQSection: ComponentConfig<FAQSectionProps> = {
  label: msg("components.faqsSection", "FAQs Section"),
  fields: FAQsSectionFields,
  defaultProps: {
    data: {
      heading: {
        field: "",
        constantValue: {
          en: "Frequently Asked Questions",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
      faqs: {
        field: "",
        constantValue: {
          faqs: [defaultFAQ, defaultFAQ, defaultFAQ],
        },
        constantValueEnabled: true,
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
    analytics: {
      scope: "faqsSection",
    },
  },
  render: (props) => (
    <AnalyticsScopeProvider
      name={`${props.analytics?.scope ?? "faqsSection"}${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <FAQsSectionComponent {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
