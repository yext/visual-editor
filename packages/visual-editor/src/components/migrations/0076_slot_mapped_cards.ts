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
const productDefaultMappings = createSlottedItemSource({
  label: "Products",
  itemLabel: "Product",
  mappingFields: {
    image: {
      type: "entityField",
      label: "Image",
      filter: { types: ["type.image"] },
    },
    brow: {
      type: "entityField",
      label: "Brow Text",
      filter: { types: ["type.string", "type.rich_text_v2"] },
    },
    name: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    price: {
      type: "object",
      label: "Price",
      objectFields: {
        value: {
          type: "entityField",
          label: "Value",
          filter: { types: [] },
        },
        currencyCode: {
          type: "entityField",
          label: "Currency Code",
          filter: { types: ["type.string"] },
        },
      },
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
const testimonialDefaultMappings = createSlottedItemSource({
  label: "Testimonial",
  itemLabel: "Testimonial",
  mappingFields: {
    description: {
      type: "entityField",
      label: "Description",
      filter: { types: ["type.rich_text_v2"] },
    },
    contributorName: {
      type: "entityField",
      label: "Contributor Name",
      filter: { types: ["type.string"] },
    },
    contributionDate: {
      type: "entityField",
      label: "Contribution Date",
      filter: { types: ["type.datetime"] },
    },
  },
}).defaultValue.mappings!;
const insightDefaultMappings = createSlottedItemSource({
  label: "Insights",
  itemLabel: "Insight",
  mappingFields: {
    image: {
      type: "entityField",
      label: "Image",
      filter: { types: ["type.image"] },
    },
    name: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string"] },
    },
    category: {
      type: "entityField",
      label: "Category",
      filter: { types: ["type.string", "type.rich_text_v2"] },
    },
    publishTime: {
      type: "entityField",
      label: "Publish Time",
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
const teamDefaultMappings = createSlottedItemSource({
  label: "Team",
  itemLabel: "Team",
  mappingFields: {
    headshot: {
      type: "entityField",
      label: "Image",
      filter: { types: ["type.image"] },
    },
    name: {
      type: "entityField",
      label: "Name",
      filter: { types: ["type.string"] },
    },
    title: {
      type: "entityField",
      label: "Title",
      filter: { types: ["type.string", "type.rich_text_v2"] },
    },
    phoneNumber: {
      type: "entityField",
      label: "Phone",
      filter: { types: ["type.phone"] },
    },
    email: {
      type: "entityField",
      label: "Email",
      filter: { types: ["type.string"] },
    },
    cta: {
      type: "entityField",
      label: "CTA",
      filter: { types: ["type.cta"] },
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
const productImageMapping = productDefaultMappings.image as unknown as Record<
  string,
  unknown
>;
const productBrowMapping = productDefaultMappings.brow as unknown as Record<
  string,
  unknown
>;
const productNameMapping = productDefaultMappings.name as unknown as Record<
  string,
  unknown
>;
const productPriceMapping = productDefaultMappings.price as unknown as Record<
  string,
  unknown
>;
const productPriceValueMapping =
  (productPriceMapping.value as Record<string, unknown>) ?? {};
const productPriceCurrencyCodeMapping =
  (productPriceMapping.currencyCode as Record<string, unknown>) ?? {};
const productDescriptionMapping =
  productDefaultMappings.description as unknown as Record<string, unknown>;
const productCtaMapping = productDefaultMappings.cta as unknown as Record<
  string,
  unknown
>;
const testimonialDescriptionMapping =
  testimonialDefaultMappings.description as unknown as Record<string, unknown>;
const testimonialContributorNameMapping =
  testimonialDefaultMappings.contributorName as unknown as Record<
    string,
    unknown
  >;
const testimonialContributionDateMapping =
  testimonialDefaultMappings.contributionDate as unknown as Record<
    string,
    unknown
  >;
const insightImageMapping = insightDefaultMappings.image as unknown as Record<
  string,
  unknown
>;
const insightNameMapping = insightDefaultMappings.name as unknown as Record<
  string,
  unknown
>;
const insightCategoryMapping =
  insightDefaultMappings.category as unknown as Record<string, unknown>;
const insightPublishTimeMapping =
  insightDefaultMappings.publishTime as unknown as Record<string, unknown>;
const insightDescriptionMapping =
  insightDefaultMappings.description as unknown as Record<string, unknown>;
const insightCtaMapping = insightDefaultMappings.cta as unknown as Record<
  string,
  unknown
>;
const teamHeadshotMapping = teamDefaultMappings.headshot as unknown as Record<
  string,
  unknown
>;
const teamNameMapping = teamDefaultMappings.name as unknown as Record<
  string,
  unknown
>;
const teamTitleMapping = teamDefaultMappings.title as unknown as Record<
  string,
  unknown
>;
const teamPhoneNumberMapping =
  teamDefaultMappings.phoneNumber as unknown as Record<string, unknown>;
const teamEmailMapping = teamDefaultMappings.email as unknown as Record<
  string,
  unknown
>;
const teamCtaMapping = teamDefaultMappings.cta as unknown as Record<
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
  ProductCardsWrapper: {
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
            field: appendChildField(props.data.field, "products"),
          },
        };
      }

      return {
        ...props,
        data: {
          ...props.data,
          field: appendChildField(props.data.field, "products"),
          mappings: {
            ...productDefaultMappings,
            image: { ...productImageMapping, field: "image" },
            brow: { ...productBrowMapping, field: "brow" },
            name: { ...productNameMapping, field: "name" },
            price: {
              ...productPriceMapping,
              value: { ...productPriceValueMapping, field: "price.value" },
              currencyCode: {
                ...productPriceCurrencyCodeMapping,
                field: "price.currencyCode",
              },
            },
            description: {
              ...productDescriptionMapping,
              field: "description",
            },
            cta: { ...productCtaMapping, field: "cta" },
          },
        },
      };
    },
  },
  TestimonialCardsWrapper: {
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
            field: appendChildField(props.data.field, "testimonials"),
          },
        };
      }

      return {
        ...props,
        data: {
          ...props.data,
          field: appendChildField(props.data.field, "testimonials"),
          mappings: {
            ...testimonialDefaultMappings,
            description: {
              ...testimonialDescriptionMapping,
              field: "description",
            },
            contributorName: {
              ...testimonialContributorNameMapping,
              field: "contributorName",
            },
            contributionDate: {
              ...testimonialContributionDateMapping,
              field: "contributionDate",
            },
          },
        },
      };
    },
  },
  InsightCardsWrapper: {
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
            field: appendChildField(props.data.field, "insights"),
          },
        };
      }

      return {
        ...props,
        data: {
          ...props.data,
          field: appendChildField(props.data.field, "insights"),
          mappings: {
            ...insightDefaultMappings,
            image: { ...insightImageMapping, field: "image" },
            name: { ...insightNameMapping, field: "name" },
            category: { ...insightCategoryMapping, field: "category" },
            publishTime: {
              ...insightPublishTimeMapping,
              field: "publishTime",
            },
            description: {
              ...insightDescriptionMapping,
              field: "description",
            },
            cta: { ...insightCtaMapping, field: "cta" },
          },
        },
      };
    },
  },
  TeamCardsWrapper: {
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
            field: appendChildField(props.data.field, "people"),
          },
        };
      }

      return {
        ...props,
        data: {
          ...props.data,
          field: appendChildField(props.data.field, "people"),
          mappings: {
            ...teamDefaultMappings,
            headshot: { ...teamHeadshotMapping, field: "headshot" },
            name: { ...teamNameMapping, field: "name" },
            title: { ...teamTitleMapping, field: "title" },
            phoneNumber: {
              ...teamPhoneNumberMapping,
              field: "phoneNumber",
            },
            email: { ...teamEmailMapping, field: "email" },
            cta: { ...teamCtaMapping, field: "cta" },
          },
        },
      };
    },
  },
};
