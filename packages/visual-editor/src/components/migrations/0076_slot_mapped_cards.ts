import { Migration } from "../../utils/migrate.ts";
// Snapshot the 0076-time mapping defaults here so this append-only migration
// stays deterministic even if createSlottedItemSource changes later.
const defaultEntityFieldMapping = {
  field: "",
  constantValueEnabled: false,
  constantValue: undefined,
};

const eventDefaultMappings = {
  image: { ...defaultEntityFieldMapping },
  title: { ...defaultEntityFieldMapping },
  dateTime: { ...defaultEntityFieldMapping },
  description: { ...defaultEntityFieldMapping },
  cta: { ...defaultEntityFieldMapping },
};
const faqDefaultMappings = {
  question: { ...defaultEntityFieldMapping },
  answer: { ...defaultEntityFieldMapping },
};
const productDefaultMappings = {
  image: { ...defaultEntityFieldMapping },
  brow: { ...defaultEntityFieldMapping },
  name: { ...defaultEntityFieldMapping },
  price: { ...defaultEntityFieldMapping },
  description: { ...defaultEntityFieldMapping },
  cta: { ...defaultEntityFieldMapping },
};
const testimonialDefaultMappings = {
  description: { ...defaultEntityFieldMapping },
  contributorName: { ...defaultEntityFieldMapping },
  contributionDate: { ...defaultEntityFieldMapping },
};
const insightDefaultMappings = {
  image: { ...defaultEntityFieldMapping },
  name: { ...defaultEntityFieldMapping },
  category: { ...defaultEntityFieldMapping },
  publishTime: { ...defaultEntityFieldMapping },
  description: { ...defaultEntityFieldMapping },
  cta: { ...defaultEntityFieldMapping },
};
const teamDefaultMappings = {
  headshot: { ...defaultEntityFieldMapping },
  name: { ...defaultEntityFieldMapping },
  title: { ...defaultEntityFieldMapping },
  phoneNumber: { ...defaultEntityFieldMapping },
  email: { ...defaultEntityFieldMapping },
  cta: { ...defaultEntityFieldMapping },
};
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
            mappings: {
              ...props.data.mappings,
              price:
                props.data.mappings.price &&
                typeof props.data.mappings.price === "object" &&
                ("value" in props.data.mappings.price ||
                  "currencyCode" in props.data.mappings.price)
                  ? {
                      ...productPriceMapping,
                      field: "price",
                    }
                  : props.data.mappings.price,
            },
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
            price: { ...productPriceMapping, field: "price" },
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
