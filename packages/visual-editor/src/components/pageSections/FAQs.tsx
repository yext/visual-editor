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
  YextCollection,
  resolveYextSubfield,
} from "@yext/visual-editor";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../atoms/accordion.js";

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
  collection: FAQsCollection;
  liveVisibility: boolean;
}

type FAQs = Array<{
  question: string;
  answer: string;
}>;

// Custom extension of YextCollection for FAQsSection
// subfields are only set when constantValueEnabled is false
// FAQS is only set when constantValueEnabled is true
type FAQsCollection = YextCollection & {
  subfields?: {
    questionField: YextEntityField<string>;
    answerField: YextEntityField<string>;
  };
  FAQs?: FAQs;
};

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
  collection: YextField("FAQs", {
    type: "object",
    objectFields: {
      items: YextField<any, Array<any>>("FAQs Items", {
        type: "entityField",
        isCollection: true,
        filter: {
          includeListsOnly: true,
        },
      }),
      limit: YextField("Items Limit", {
        type: "optionalNumber",
        hideNumberFieldRadioLabel: "All",
        showNumberFieldRadioLabel: "Limit",
        defaultCustomValue: 3,
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

const FAQsSectionComponent = ({
  styles,
  sectionHeading,
  resolvedFAQs,
}: {
  styles: FAQsSectionProps["styles"];
  sectionHeading: FAQsSectionProps["sectionHeading"];
  resolvedFAQs: FAQs;
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
        {resolvedFAQs?.map((faqItem, index) => (
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

const FAQsSectionWrapper: React.FC<FAQsSectionProps> = ({
  styles,
  sectionHeading,
  collection,
}) => {
  const document = useDocument();

  if (collection?.items.constantValueEnabled) {
    return (
      <FAQsSectionComponent
        styles={styles}
        sectionHeading={sectionHeading}
        resolvedFAQs={collection?.FAQs ?? []}
      />
    );
  }

  const resolvedCollection = resolveYextEntityField(
    document,
    collection?.items
  );

  // resolve the subfields and add to resolvedFAQs
  // if a question or answer is "", then don't include in resolvedFAQs
  const resolvedFAQs: FAQs = (resolvedCollection || [])
    ?.slice(
      0,
      typeof collection?.limit !== "number" ? undefined : collection?.limit
    )
    ?.map((item) => ({
      question:
        resolveYextSubfield<string>(
          item,
          collection?.subfields?.questionField
        ) ?? "",
      answer:
        resolveYextSubfield<string>(item, collection?.subfields?.answerField) ??
        "",
    }))
    ?.filter(({ question, answer }) => question !== "" && answer !== "");

  return (
    <FAQsSectionComponent
      styles={styles}
      sectionHeading={sectionHeading}
      resolvedFAQs={resolvedFAQs}
    />
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
    collection: {
      items: {
        field: "",
        constantValue: [],
        constantValueEnabled: true,
      },
      limit: 3,
      FAQs: [DEFAULT_FAQ, DEFAULT_FAQ, DEFAULT_FAQ],
    },
    liveVisibility: true,
  },
  resolveFields(data, { fields }) {
    if (data.props.collection?.items.constantValueEnabled) {
      // @ts-expect-error ts(2339)
      delete fields.collection.objectFields.limit;
      return {
        ...fields,
        collection: {
          ...fields.collection,
          objectFields: {
            // @ts-expect-error ts(2339) objectFields exists
            ...fields.collection.objectFields,
            FAQs: YextField("FAQs", {
              type: "array",
              arrayFields: {
                question: YextField("Question", {
                  type: "text",
                }),
                answer: YextField("Answer", {
                  type: "text",
                  isMultiline: true,
                }),
              },
            }),
          },
        },
      };
    }

    return {
      ...fields,
      collection: {
        ...fields.collection,
        objectFields: {
          // @ts-expect-error ts(2339) objectFields exists
          ...fields.collection.objectFields,
          subfields: YextField("Subfields", {
            type: "object",
            objectFields: {
              questionField: YextField<any, string>("Question Subfield", {
                type: "entityField",
                isCollection: true,
                disableConstantValueToggle: true,
                filter: {
                  directChildrenOf: data.props.collection?.items.field,
                  types: ["type.string"],
                },
              }),
              answerField: YextField<any, string>("Answer Subfield", {
                type: "entityField",
                isCollection: true,
                disableConstantValueToggle: true,
                filter: {
                  directChildrenOf: data.props.collection?.items.field,
                  types: ["type.string"],
                },
              }),
            },
          }),
          limit: YextField("Items Limit", {
            type: "optionalNumber",
            hideNumberFieldRadioLabel: "All",
            showNumberFieldRadioLabel: "Limit",
            defaultCustomValue: 3,
          }),
        },
      },
    };
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <FAQsSectionWrapper {...props} />
    </VisibilityWrapper>
  ),
};
