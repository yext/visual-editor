import { Migration } from "../../utils/migrate.ts";

// Helper function to add missing CTA properties
const addMissingCTAProperties = (cta: any) => {
  if (cta && cta.label && !cta.ctaType) {
    return {
      ...cta,
      link: cta.link || "#",
      linkType: cta.linkType || "URL",
      ctaType: "textAndLink",
    };
  }
  return cta;
};

// Helper function to process array items with CTAs
const processArrayWithCTAs = (data: any, arrayKey?: string) => {
  const itemsArray = Array.isArray(data)
    ? data
    : arrayKey
      ? data[arrayKey]
      : undefined;

  if (Array.isArray(itemsArray)) {
    const updatedItems = itemsArray.map((item: any) => ({
      ...item,
      cta: addMissingCTAProperties(item.cta),
    }));

    if (Array.isArray(data)) {
      return updatedItems;
    } else if (arrayKey) {
      return { ...data, [arrayKey]: updatedItems };
    }
  }
  return data;
};

export const migrateCTAStructures: Migration = {
  HeroSection: {
    action: "updated",
    propTransformation: (props) => {
      // Add missing ctaType properties to existing CTAs
      if (props.data?.hero?.constantValue?.primaryCta) {
        props.data.hero.constantValue.primaryCta = addMissingCTAProperties(
          props.data.hero.constantValue.primaryCta
        );
      }
      if (props.data?.hero?.constantValue?.secondaryCta) {
        props.data.hero.constantValue.secondaryCta = addMissingCTAProperties(
          props.data.hero.constantValue.secondaryCta
        );
      }
      return props;
    },
  },

  PromoSection: {
    action: "updated",
    propTransformation: (props) => {
      // Add missing ctaType property to existing CTA
      if (props.data?.promo?.constantValue?.cta) {
        props.data.promo.constantValue.cta = addMissingCTAProperties(
          props.data.promo.constantValue.cta
        );
      }
      return props;
    },
  },

  ProductSection: {
    action: "updated",
    propTransformation: (props) => {
      if (props.data?.products?.constantValue) {
        props.data.products.constantValue = processArrayWithCTAs(
          props.data.products.constantValue,
          "products"
        );
      }
      return props;
    },
  },

  TeamSection: {
    action: "updated",
    propTransformation: (props) => {
      if (props.data?.people?.constantValue) {
        props.data.people.constantValue = processArrayWithCTAs(
          props.data.people.constantValue,
          "people"
        );
      }
      return props;
    },
  },

  InsightSection: {
    action: "updated",
    propTransformation: (props) => {
      if (props.data?.insights?.constantValue) {
        props.data.insights.constantValue = processArrayWithCTAs(
          props.data.insights.constantValue,
          "insights"
        );
      }
      return props;
    },
  },

  EventSection: {
    action: "updated",
    propTransformation: (props) => {
      if (props.data?.events?.constantValue) {
        props.data.events.constantValue = processArrayWithCTAs(
          props.data.events.constantValue,
          "events"
        );
      }
      return props;
    },
  },
};
