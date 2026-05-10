import { Migration } from "../../utils/migrate.ts";
import { createSlottedItemSource } from "../../utils/itemSource/index.ts";

const eventDefaultMappings = createSlottedItemSource({
  label: "Events",
  itemLabel: "Event",
  mappingFields: {
    image: {
      type: "entityField",
      label: "Image",
      filter: { types: ["type.image"] },
    },
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    dateTime: {
      type: "entityField",
      label: "Date & Time",
      filter: { types: ["type.datetime"] },
    },
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.rich_text_v2"] },
    },
    cta: {
      type: "entityField",
      label: "CTA",
      filter: { types: ["type.cta"] },
    },
  },
}).defaultValue.mappings!;
const faqDefaultMappings = createSlottedItemSource({
  label: "FAQs",
  itemLabel: "FAQ",
  mappingFields: {
    question: {
      type: "entityField",
      label: "Question",
      filter: {
        types: ["type.string", "type.rich_text_v2"],
      },
    },
    answer: {
      type: "entityField",
      label: "Answer",
      filter: {
        types: ["type.rich_text_v2"],
      },
    },
  },
}).defaultValue.mappings!;
const eventImageMapping = eventDefaultMappings.image as unknown as Record<
  string,
  unknown
>;
const eventTitleMapping = eventDefaultMappings.title as unknown as Record<
  string,
  unknown
>;
const eventDateTimeMapping = eventDefaultMappings.dateTime as unknown as Record<
  string,
  unknown
>;
const eventDescriptionMapping =
  eventDefaultMappings.description as unknown as Record<string, unknown>;
const eventCtaMapping = eventDefaultMappings.cta as unknown as Record<
  string,
  unknown
>;
const faqQuestionMapping = faqDefaultMappings.question as unknown as Record<
  string,
  unknown
>;
const faqAnswerMapping = faqDefaultMappings.answer as unknown as Record<
  string,
  unknown
>;

const appendChildField = (field: string, childField: string): string => {
  if (!field || field.endsWith(`.${childField}`)) {
    return field;
  }

  return `${field}.${childField}`;
};

export const slotMappedCardsMigration: Migration = {
  EventCardsWrapper: {
    action: "updated",
    propTransformation: (props) => {
      if (props.data?.constantValueEnabled !== false || !props.data?.field) {
        return props;
      }

      if (props.data?.mappings) {
        return {
          ...props,
          data: {
            ...props.data,
            field: appendChildField(props.data.field, "events"),
          },
        };
      }

      return {
        ...props,
        data: {
          ...props.data,
          field: appendChildField(props.data.field, "events"),
          mappings: {
            ...eventDefaultMappings,
            image: {
              ...eventImageMapping,
              field: "image",
            },
            title: {
              ...eventTitleMapping,
              field: "title",
            },
            dateTime: {
              ...eventDateTimeMapping,
              field: "dateTime",
            },
            description: {
              ...eventDescriptionMapping,
              field: "description",
            },
            cta: {
              ...eventCtaMapping,
              field: "cta",
            },
          },
        },
      };
    },
  },
  FAQSection: {
    action: "updated",
    propTransformation: (props) => {
      if (props.data?.constantValueEnabled !== false || !props.data?.field) {
        return props;
      }

      if (props.data?.mappings) {
        return {
          ...props,
          data: {
            ...props.data,
            field: appendChildField(props.data.field, "faqs"),
          },
        };
      }

      return {
        ...props,
        data: {
          ...props.data,
          field: appendChildField(props.data.field, "faqs"),
          mappings: {
            ...faqDefaultMappings,
            question: {
              ...faqQuestionMapping,
              field: "question",
            },
            answer: {
              ...faqAnswerMapping,
              field: "answer",
            },
          },
        },
      };
    },
  },
};
