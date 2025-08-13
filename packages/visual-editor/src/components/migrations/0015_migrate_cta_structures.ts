import { Migration } from "../../utils/migrate.ts";

export const migrateCTAStructures: Migration = {
  HeroSection: {
    action: "updated",
    propTransformation: (props) => {
      // Handle old structure where hero data was directly in the component
      // and needs to be wrapped in YextStructEntityField format
      if (props.data?.hero) {
        const oldHeroData = props.data.hero;

        // Check if it's the old structure (CTAs don't have nested 'cta' wrapper)
        if (
          oldHeroData.constantValue?.primaryCta &&
          oldHeroData.constantValue.primaryCta.label &&
          !oldHeroData.constantValue.primaryCta.cta
        ) {
          // Convert old CTA structure to new flat structure
          props.data.hero = {
            field: oldHeroData.field || "",
            constantValue: {
              image: oldHeroData.constantValue?.image,
              primaryCta: {
                label:
                  oldHeroData.constantValue.primaryCta.label ||
                  "Call To Action",
                link: oldHeroData.constantValue.primaryCta.link,
                linkType: oldHeroData.constantValue.primaryCta.linkType,
                ctaType: "textAndLink",
              },
              secondaryCta: oldHeroData.constantValue?.secondaryCta
                ? {
                    label:
                      oldHeroData.constantValue.secondaryCta.label ||
                      "Call To Action",
                    link: oldHeroData.constantValue.secondaryCta.link,
                    linkType: oldHeroData.constantValue.secondaryCta.linkType,
                    ctaType: "textAndLink",
                  }
                : undefined,
            },
            constantValueEnabled: oldHeroData.constantValueEnabled ?? true,
            constantValueOverride: oldHeroData.constantValueOverride || {
              image: true,
              primaryCta: true,
              secondaryCta: true,
            },
          };
        }

        // Handle case where entity field has old structure but we're using entity values
        if (
          !oldHeroData.constantValueEnabled &&
          oldHeroData.field &&
          !oldHeroData.constantValueOverride?.primaryCta &&
          !oldHeroData.constantValueOverride?.secondaryCta
        ) {
          // For entity values, we need to provide constant values that match the expected new structure
          // but keep the entity field enabled for other data
          // Preserve existing CTA labels if they exist, otherwise use sensible defaults
          const existingPrimaryLabel =
            oldHeroData.constantValue?.primaryCta?.label;
          const existingSecondaryLabel =
            oldHeroData.constantValue?.secondaryCta?.label;

          props.data.hero = {
            ...oldHeroData,
            constantValueOverride: {
              image: false,
              primaryCta: true,
              secondaryCta: true,
            },
            constantValue: {
              ...oldHeroData.constantValue,
              primaryCta: {
                label: existingPrimaryLabel || "Get Directions",
                link: oldHeroData.constantValue?.primaryCta?.link || "#",
                linkType:
                  oldHeroData.constantValue?.primaryCta?.linkType || "URL",
                ctaType: "textAndLink",
              },
              secondaryCta: {
                label: existingSecondaryLabel || "Learn More",
                link: oldHeroData.constantValue?.secondaryCta?.link || "#",
                linkType:
                  oldHeroData.constantValue?.secondaryCta?.linkType || "URL",
                ctaType: "textAndLink",
              },
            },
          };
        }

        // Handle cases where CTAs already have the new structure but are missing ctaType
        if (
          props.data?.hero?.constantValue?.primaryCta &&
          !props.data.hero.constantValue.primaryCta.ctaType
        ) {
          props.data.hero.constantValue.primaryCta = {
            ...props.data.hero.constantValue.primaryCta,
            ctaType: "textAndLink",
          };
        }
        if (
          props.data?.hero?.constantValue?.secondaryCta &&
          !props.data.hero.constantValue.secondaryCta.ctaType
        ) {
          props.data.hero.constantValue.secondaryCta = {
            ...props.data.hero.constantValue.secondaryCta,
            ctaType: "textAndLink",
          };
        }
      }

      return props;
    },
  },
  PromoSection: {
    action: "updated",
    propTransformation: (props) => {
      // Handle old structure where promo data was directly in the component
      // and needs to be wrapped in YextStructEntityField format
      if (props.data?.promo) {
        const oldPromoData = props.data.promo;

        // Check if it's the old structure (CTAs don't have nested 'cta' wrapper)
        if (
          oldPromoData.constantValue?.cta &&
          oldPromoData.constantValue.cta.label &&
          !oldPromoData.constantValue.cta.cta
        ) {
          // Convert old CTA structure to new flat structure
          props.data.promo = {
            field: oldPromoData.field || "",
            constantValue: {
              image: oldPromoData.constantValue?.image,
              title: oldPromoData.constantValue?.title,
              description: oldPromoData.constantValue?.description,
              cta: {
                label: oldPromoData.constantValue.cta.label || "Call To Action",
                link: oldPromoData.constantValue.cta.link,
                linkType: oldPromoData.constantValue.cta.linkType,
                ctaType: "textAndLink",
              },
            },
            constantValueEnabled: oldPromoData.constantValueEnabled ?? true,
            constantValueOverride: oldPromoData.constantValueOverride || {
              image: true,
              title: true,
              description: true,
              cta: true,
            },
          };
        }

        // Handle case where entity field has old structure but we're using entity values
        if (
          !oldPromoData.constantValueEnabled &&
          oldPromoData.field &&
          !oldPromoData.constantValueOverride?.cta
        ) {
          // For entity values, we need to provide constant values that match the expected new structure
          // but keep the entity field enabled for other data
          // Preserve existing CTA label if it exists, otherwise use sensible default
          const existingCtaLabel = oldPromoData.constantValue?.cta?.label;

          props.data.promo = {
            ...oldPromoData,
            constantValueOverride: {
              image: false,
              title: false,
              description: false,
              cta: true,
            },
            constantValue: {
              ...oldPromoData.constantValue,
              cta: {
                label: existingCtaLabel || "Call to Order",
                link: oldPromoData.constantValue?.cta?.link || "+18005551010",
                linkType: oldPromoData.constantValue?.cta?.linkType || "PHONE",
                ctaType: "textAndLink",
              },
            },
          };
        }

        // Handle cases where CTAs already have the new structure but are missing ctaType
        if (
          props.data?.promo?.constantValue?.cta &&
          !props.data.promo.constantValue.cta.ctaType
        ) {
          props.data.promo.constantValue.cta = {
            ...props.data.promo.constantValue.cta,
            ctaType: "textAndLink",
          };
        }
      }

      return props;
    },
  },
  ProductSection: {
    action: "updated",
    propTransformation: (props) => {
      // Handle CTAs that are missing required properties (flat structure)
      if (props.data?.products?.constantValue) {
        const productsArray = Array.isArray(props.data.products.constantValue)
          ? props.data.products.constantValue
          : props.data.products.constantValue.products;

        if (Array.isArray(productsArray)) {
          const updatedProducts = productsArray.map((product: any) => {
            if (product.cta && product.cta.label && !product.cta.ctaType) {
              return {
                ...product,
                cta: {
                  ...product.cta,
                  link: product.cta.link || "#",
                  linkType: product.cta.linkType || "URL",
                  ctaType: "textAndLink",
                },
              };
            }
            return product;
          });

          if (Array.isArray(props.data.products.constantValue)) {
            props.data.products.constantValue = updatedProducts;
          } else {
            props.data.products.constantValue.products = updatedProducts;
          }
        }
      }
      return props;
    },
  },
  TeamSection: {
    action: "updated",
    propTransformation: (props) => {
      // Handle CTAs that are missing required properties (flat structure)
      if (props.data?.people?.constantValue) {
        const peopleArray = Array.isArray(props.data.people.constantValue)
          ? props.data.people.constantValue
          : props.data.people.constantValue.people;

        if (Array.isArray(peopleArray)) {
          const updatedPeople = peopleArray.map((person: any) => {
            if (person.cta && person.cta.label && !person.cta.ctaType) {
              return {
                ...person,
                cta: {
                  ...person.cta,
                  link: person.cta.link || "#",
                  linkType: person.cta.linkType || "URL",
                  ctaType: "textAndLink",
                },
              };
            }
            return person;
          });

          if (Array.isArray(props.data.people.constantValue)) {
            props.data.people.constantValue = updatedPeople;
          } else {
            props.data.people.constantValue.people = updatedPeople;
          }
        }
      }
      return props;
    },
  },
  InsightSection: {
    action: "updated",
    propTransformation: (props) => {
      // Handle CTAs that are missing required properties (flat structure)
      if (props.data?.insights?.constantValue) {
        const insightsArray = Array.isArray(props.data.insights.constantValue)
          ? props.data.insights.constantValue
          : props.data.insights.constantValue.insights;

        if (Array.isArray(insightsArray)) {
          const updatedInsights = insightsArray.map((insight: any) => {
            if (insight.cta && insight.cta.label && !insight.cta.ctaType) {
              return {
                ...insight,
                cta: {
                  ...insight.cta,
                  link: insight.cta.link || "#",
                  linkType: insight.cta.linkType || "URL",
                  ctaType: "textAndLink",
                },
              };
            }
            return insight;
          });

          if (Array.isArray(props.data.insights.constantValue)) {
            props.data.insights.constantValue = updatedInsights;
          } else {
            props.data.insights.constantValue.insights = updatedInsights;
          }
        }
      }
      return props;
    },
  },
  EventSection: {
    action: "updated",
    propTransformation: (props) => {
      // Handle CTAs that are missing required properties (flat structure)
      if (props.data?.events?.constantValue) {
        const eventsArray = Array.isArray(props.data.events.constantValue)
          ? props.data.events.constantValue
          : props.data.events.constantValue.events;

        if (Array.isArray(eventsArray)) {
          const updatedEvents = eventsArray.map((event: any) => {
            if (event.cta && event.cta.label && !event.cta.ctaType) {
              return {
                ...event,
                cta: {
                  ...event.cta,
                  link: event.cta.link || "#",
                  linkType: event.cta.linkType || "URL",
                  ctaType: "textAndLink",
                },
              };
            }
            return event;
          });

          if (Array.isArray(props.data.events.constantValue)) {
            props.data.events.constantValue = updatedEvents;
          } else {
            props.data.events.constantValue.events = updatedEvents;
          }
        }
      }
      return props;
    },
  },
};
