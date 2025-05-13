import { StructEntityFieldTypes } from "../editor/YextStructFieldSelector.tsx";
import { EntityFieldTypes } from "../internal/utils/getFilteredEntityFields.ts";

export type ComponentField = {
  fieldDefinition: FieldDefinition;
  fieldTypeDefinition: FieldTypeDefinition;
};

type FieldDefinition = {
  id: string;
  name: string;
};

type FieldTypeDefinition = {
  type: StructEntityFieldTypes | EntityFieldTypes;
  subfields?: any;
};

export const ComponentFieldMappings = {
  HeroSection: {
    fieldDefinition: {
      id: "heroSection",
      name: "Hero Section",
    },
    fieldTypeDefinition: {
      type: "type.hero_section",
    },
  },
  PromoSection: {
    fieldDefinition: {
      id: "promoSection",
      name: "Promo Section",
    },
    fieldTypeDefinition: {
      type: "type.promo_section",
    },
  },
  ProductsSection: {
    fieldDefinition: {
      id: "productsSection",
      name: "Products Section",
    },
    fieldTypeDefinition: {
      type: "type.products_section",
    },
  },
  EventsSection: {
    fieldDefinition: {
      id: "eventsSection",
      name: "Events Section",
    },
    fieldTypeDefinition: {
      type: "type.events_section",
    },
  },
  FAQSection: {
    fieldDefinition: {
      id: "faqSection",
      name: "FAQ Section",
    },
    fieldTypeDefinition: {
      type: "type.faq_section",
    },
  },
  TestimonialsSection: {
    fieldDefinition: {
      id: "testimonialsSection",
      name: "Testimonials Section",
    },
    fieldTypeDefinition: {
      type: "type.testimonials_section",
    },
  },
  InsightsSection: {
    fieldDefinition: {
      id: "insightsSection",
      name: "Insights Section",
    },
    fieldTypeDefinition: {
      type: "type.insights_section",
    },
  },
  TeamSection: {
    fieldDefinition: {
      id: "teamSection",
      name: "Team Section",
    },
    fieldTypeDefinition: {
      type: "type.team_section",
    },
  },
} as const satisfies Record<string, ComponentField>;
