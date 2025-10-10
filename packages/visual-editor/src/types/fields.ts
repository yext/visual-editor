import { EntityFieldTypes } from "../internal/utils/getFilteredEntityFields.ts";

export type ComponentField = {
  name: string;
  type: EntityFieldTypes;
  isList: boolean;
  tooltipDescription: string;
  altLanguageBehavior: "LANGUAGE_SPECIFIC" | "PRIMARY_ONLY" | "OVERRIDABLE";
};

export const ComponentFields = {
  PromoSection: {
    name: "Promo Section",
    type: "type.promo_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "LANGUAGE_SPECIFIC",
  },
  ProductSection: {
    name: "Product Section",
    type: "type.products_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "LANGUAGE_SPECIFIC",
  },
  EventSection: {
    name: "Event Section",
    type: "type.events_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "LANGUAGE_SPECIFIC",
  },
  FAQSection: {
    name: "FAQ Section",
    type: "type.faq_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "LANGUAGE_SPECIFIC",
  },
  TestimonialSection: {
    name: "Testimonial Section",
    type: "type.testimonials_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "LANGUAGE_SPECIFIC",
  },
  InsightSection: {
    name: "Insight Section",
    type: "type.insights_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "LANGUAGE_SPECIFIC",
  },
  TeamSection: {
    name: "Team Section",
    type: "type.team_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "LANGUAGE_SPECIFIC",
  },
} as const satisfies Record<string, ComponentField>;
