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
  YextCollection,
  EntityField,
} from "@yext/visual-editor";
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
  faqs: YextCollection;
  questionField: string;
  answerField: string;
}

const getSubfieldOptions = (data: any) => {
  const document = (data as any).document;
  const items = data?.faqs?.items;
  if (!items || items.constantValueEnabled) return [];

  const resolvedList = resolveYextEntityField(document, items);
  const first =
    Array.isArray(resolvedList) && resolvedList.length > 0
      ? resolvedList[0]
      : undefined;

  if (!first) return [];
  return Object.keys(first).map((key) => ({ label: key, value: key }));
};

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
  faqs: {
    type: "object",
    label: "FAQs",
    objectFields: {
      items: YextEntityFieldSelector<any, Array<any>>({
        label: "FAQs List",
        isCollection: true,
        filter: {
          includeListsOnly: true,
        },
      }),
      limit: {
        type: "number",
        label: "Items Limit",
      },
    },
  },
  questionField: {
    type: "custom",
    label: "Question Field",
    render: (props) => {
      console.log(props);
      const data = (props as any)._root?.data?.props || {};
      console.log(data);
      const options = getSubfieldOptions(data);

      if (options.length === 0) {
        return <div className="text-gray-500">Select a FAQs list first</div>;
      }

      return (
        <select
          value={props.value || ""}
          onChange={(e) => props.onChange(e.target.value)}
          id={props.id}
          name={props.name}
          disabled={props.readOnly}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">Select field</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    },
  },
  // Custom field for answerField to show subfields of selected FAQs list
  answerField: {
    type: "custom",
    label: "Answer Field",
    render: (props) => {
      // Get the parent data - the document and data context
      const data = (props as any)._root?.data?.props || {};
      const options = getSubfieldOptions(data);

      if (options.length === 0) {
        return <div className="text-gray-500">Select a FAQs list first</div>;
      }

      return (
        <select
          value={props.value || ""}
          onChange={(e) => props.onChange(e.target.value)}
          id={props.id}
          name={props.name}
          disabled={props.readOnly}
          className="p-2 border border-gray-300 rounded"
        >
          <option value="">Select field</option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );
    },
  },
};

const FAQsSectionWrapper: React.FC<FAQsSectionProps> = ({
  styles,
  sectionHeading,
  faqs,
  questionField,
  answerField,
}) => {
  const document = useDocument();
  const resolvedHeading = resolveYextEntityField<string>(
    document,
    sectionHeading.text
  );
  const resolvedFAQs = resolveYextEntityField<Array<any>>(document, faqs.items);
  const limitedFAQs = resolvedFAQs?.slice(
    0,
    typeof faqs.limit === "number" ? faqs.limit : undefined
  );
  const faqItems = faqs.items.constantValueEnabled
    ? faqs.items.constantValue
    : limitedFAQs;

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8 md:gap-12"
    >
      {resolvedHeading && (
        <Heading level={sectionHeading.level}>{resolvedHeading}</Heading>
      )}
      <EntityField
        displayName="FAQs"
        fieldId={faqs.items.field}
        constantValueEnabled={faqs.items.constantValueEnabled}
      >
        <Accordion type="single" collapsible>
          {faqItems?.map((faqItem, index) => (
            <AccordionItem value={index.toString()} key={index}>
              <AccordionTrigger>
                <Body variant="lg" className="font-bold text-left">
                  {faqs.items.constantValueEnabled
                    ? faqItem.question
                    : faqItem[questionField]}
                </Body>
              </AccordionTrigger>
              <AccordionContent>
                <Body variant="base">
                  {faqs.items.constantValueEnabled
                    ? faqItem.answer
                    : faqItem[answerField]}
                </Body>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </EntityField>
    </PageSection>
  );
};

export const FAQsSection: ComponentConfig<FAQsSectionProps> = {
  label: "FAQs Section",
  resolveFields: (data, { fields }) => {
    if (data.props.faqs.items.constantValueEnabled) {
      return {
        ...fields,
        questionField: {
          ...fields.questionField,
          type: "custom",
          render: () => <></>,
        },
        answerField: {
          ...fields.answerField,
          type: "custom",
          render: () => <></>,
        },
      };
    } else {
      return fields;
    }
  },
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
    faqs: {
      items: {
        field: "",
        constantValue: [DEFAULT_FAQ, DEFAULT_FAQ, DEFAULT_FAQ],
        constantValueEnabled: true,
      },
      limit: 3,
    },
    questionField: "question",
    answerField: "answer",
  },
  render: (props) => <FAQsSectionWrapper {...props} />,
};
