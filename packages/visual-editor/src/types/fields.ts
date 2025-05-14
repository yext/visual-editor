import { StructEntityFieldTypes } from "../editor/YextStructFieldSelector.tsx";
import { EntityFieldTypes } from "../internal/utils/getFilteredEntityFields.ts";

export type ComponentField = {
  name: string;
  type: StructEntityFieldTypes | EntityFieldTypes;
  isList: boolean;
  tooltipDescription: string;
  altLanguageBehavior: "LANGUAGE_SPECIFIC" | "PRIMARY_ONLY" | "OVERRIDABLE";
};

export const ComponentFields = {
  HeroSection: {
    name: "Hero Section",
    type: "type.hero_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "PRIMARY_ONLY",
  },
  PromoSection: {
    name: "Promo Section",
    type: "type.promo_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "PRIMARY_ONLY",
  },
  ProductsSection: {
    name: "Products Section",
    type: "type.products_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "PRIMARY_ONLY",
  },
  EventsSection: {
    name: "Events Section",
    type: "type.events_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "PRIMARY_ONLY",
  },
  FAQSection: {
    name: "FAQ Section",
    type: "type.faq_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "PRIMARY_ONLY",
  },
  TestimonialsSection: {
    name: "Testimonials Section",
    type: "type.testimonials_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "PRIMARY_ONLY",
  },
  InsightsSection: {
    name: "Insights Section",
    type: "type.insights_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "PRIMARY_ONLY",
  },
  TeamSection: {
    name: "Team Section",
    type: "type.team_section",
    isList: false,
    tooltipDescription: "",
    altLanguageBehavior: "PRIMARY_ONLY",
  },
} as const satisfies Record<string, ComponentField>;
