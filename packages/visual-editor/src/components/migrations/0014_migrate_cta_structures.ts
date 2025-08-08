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
          // Convert old CTA structure to new nested structure
          props.data.hero = {
            field: oldHeroData.field || "",
            constantValue: {
              image: oldHeroData.constantValue?.image,
              primaryCta: {
                cta: {
                  label:
                    oldHeroData.constantValue.primaryCta.label ||
                    "Call To Action",
                  link: oldHeroData.constantValue.primaryCta.link,
                  linkType: oldHeroData.constantValue.primaryCta.linkType,
                  ctaType: "textAndLink",
                },
              },
              secondaryCta: oldHeroData.constantValue?.secondaryCta
                ? {
                    cta: {
                      label:
                        oldHeroData.constantValue.secondaryCta.label ||
                        "Call To Action",
                      link: oldHeroData.constantValue.secondaryCta.link,
                      linkType: oldHeroData.constantValue.secondaryCta.linkType,
                      ctaType: "textAndLink",
                    },
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
        // In this case, we need to set up the component to handle the conversion
        if (
          !oldHeroData.constantValueEnabled &&
          oldHeroData.field &&
          !oldHeroData.constantValueOverride?.primaryCta &&
          !oldHeroData.constantValueOverride?.secondaryCta
        ) {
          // For entity values, we need to provide constant values that match the expected new structure
          // but keep the entity field enabled for other data
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
                cta: {
                  label: "Get Directions",
                  link: "#",
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
              },
              secondaryCta: {
                cta: {
                  label: "Learn More",
                  link: "#",
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
              },
            },
          };
        }

        // Handle cases where CTAs already have the new nested structure but are missing ctaType
        // (This covers the functionality from 0014_enhance_cta_types.ts)
        if (
          props.data?.hero?.constantValue?.primaryCta?.cta &&
          !props.data.hero.constantValue.primaryCta.cta.ctaType
        ) {
          props.data.hero.constantValue.primaryCta.cta = {
            ...props.data.hero.constantValue.primaryCta.cta,
            ctaType: "textAndLink",
          };
        }
        if (
          props.data?.hero?.constantValue?.secondaryCta?.cta &&
          !props.data.hero.constantValue.secondaryCta.cta.ctaType
        ) {
          props.data.hero.constantValue.secondaryCta.cta = {
            ...props.data.hero.constantValue.secondaryCta.cta,
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
          // Convert old CTA structure to new nested structure
          props.data.promo = {
            field: oldPromoData.field || "",
            constantValue: {
              image: oldPromoData.constantValue?.image,
              title: oldPromoData.constantValue?.title,
              description: oldPromoData.constantValue?.description,
              cta: {
                cta: {
                  label:
                    oldPromoData.constantValue.cta.label || "Call To Action",
                  link: oldPromoData.constantValue.cta.link,
                  linkType: oldPromoData.constantValue.cta.linkType,
                  ctaType: "textAndLink",
                },
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
                cta: {
                  label: "Call to Order",
                  link: "+18005551010",
                  linkType: "PHONE",
                  ctaType: "textAndLink",
                },
              },
            },
          };
        }

        // Handle cases where CTAs already have the new nested structure but are missing ctaType
        if (
          props.data?.promo?.constantValue?.cta?.cta &&
          !props.data.promo.constantValue.cta.cta.ctaType
        ) {
          props.data.promo.constantValue.cta.cta = {
            ...props.data.promo.constantValue.cta.cta,
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
      // Handle old structure where products array has CTAs without nested 'cta' wrapper
      if (props.data?.products?.constantValue) {
        const productsArray = Array.isArray(props.data.products.constantValue)
          ? props.data.products.constantValue
          : props.data.products.constantValue.products;

        if (Array.isArray(productsArray)) {
          const updatedProducts = productsArray.map((product: any) => {
            if (product.cta && product.cta.label && !product.cta.cta) {
              return {
                ...product,
                cta: {
                  cta: {
                    label: product.cta.label || "CTA",
                    link: product.cta.link,
                    linkType: product.cta.linkType,
                    ctaType: "textAndLink",
                  },
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

      // Handle cases where CTAs already have the new nested structure but are missing ctaType
      if (props.data?.products?.constantValue) {
        const productsArray = Array.isArray(props.data.products.constantValue)
          ? props.data.products.constantValue
          : props.data.products.constantValue.products;

        if (Array.isArray(productsArray)) {
          const updatedProducts = productsArray.map((product: any) => {
            if (product.cta && product.cta.cta && !product.cta.cta.ctaType) {
              return {
                ...product,
                cta: {
                  ...product.cta,
                  cta: {
                    ...product.cta.cta,
                    ctaType: "textAndLink",
                  },
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
      // Handle old structure where people array has CTAs without nested 'cta' wrapper
      if (props.data?.people?.constantValue) {
        const peopleArray = Array.isArray(props.data.people.constantValue)
          ? props.data.people.constantValue
          : props.data.people.constantValue.people;

        if (Array.isArray(peopleArray)) {
          const updatedPeople = peopleArray.map((person: any) => {
            if (person.cta && person.cta.label && !person.cta.cta) {
              return {
                ...person,
                cta: {
                  cta: {
                    label: person.cta.label || "CTA",
                    link: person.cta.link,
                    linkType: person.cta.linkType,
                    ctaType: "textAndLink",
                  },
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

      // Handle cases where CTAs already have the new nested structure but are missing ctaType
      if (props.data?.people?.constantValue) {
        const peopleArray = Array.isArray(props.data.people.constantValue)
          ? props.data.people.constantValue
          : props.data.people.constantValue.people;

        if (Array.isArray(peopleArray)) {
          const updatedPeople = peopleArray.map((person: any) => {
            if (person.cta && person.cta.cta && !person.cta.cta.ctaType) {
              return {
                ...person,
                cta: {
                  ...person.cta,
                  cta: {
                    ...person.cta.cta,
                    ctaType: "textAndLink",
                  },
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
      // Handle old structure where insights array has CTAs without nested 'cta' wrapper
      if (props.data?.insights?.constantValue) {
        const insightsArray = Array.isArray(props.data.insights.constantValue)
          ? props.data.insights.constantValue
          : props.data.insights.constantValue.insights;

        if (Array.isArray(insightsArray)) {
          const updatedInsights = insightsArray.map((insight: any) => {
            if (insight.cta && insight.cta.label && !insight.cta.cta) {
              return {
                ...insight,
                cta: {
                  cta: {
                    label: insight.cta.label || "CTA",
                    link: insight.cta.link,
                    linkType: insight.cta.linkType,
                    ctaType: "textAndLink",
                  },
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

      // Handle cases where CTAs already have the new nested structure but are missing ctaType
      if (props.data?.insights?.constantValue) {
        const insightsArray = Array.isArray(props.data.insights.constantValue)
          ? props.data.insights.constantValue
          : props.data.insights.constantValue.insights;

        if (Array.isArray(insightsArray)) {
          const updatedInsights = insightsArray.map((insight: any) => {
            if (insight.cta && insight.cta.cta && !insight.cta.cta.ctaType) {
              return {
                ...insight,
                cta: {
                  ...insight.cta,
                  cta: {
                    ...insight.cta.cta,
                    ctaType: "textAndLink",
                  },
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
      // Handle old structure where events array has CTAs without nested 'cta' wrapper
      if (props.data?.events?.constantValue) {
        const eventsArray = Array.isArray(props.data.events.constantValue)
          ? props.data.events.constantValue
          : props.data.events.constantValue.events;

        if (Array.isArray(eventsArray)) {
          const updatedEvents = eventsArray.map((event: any) => {
            if (event.cta && event.cta.label && !event.cta.cta) {
              return {
                ...event,
                cta: {
                  cta: {
                    label: event.cta.label || "CTA",
                    link: event.cta.link,
                    linkType: event.cta.linkType,
                    ctaType: "textAndLink",
                  },
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

      // Handle cases where CTAs already have the new nested structure but are missing ctaType
      if (props.data?.events?.constantValue) {
        const eventsArray = Array.isArray(props.data.events.constantValue)
          ? props.data.events.constantValue
          : props.data.events.constantValue.events;

        if (Array.isArray(eventsArray)) {
          const updatedEvents = eventsArray.map((event: any) => {
            if (event.cta && event.cta.cta && !event.cta.cta.ctaType) {
              return {
                ...event,
                cta: {
                  ...event.cta,
                  cta: {
                    ...event.cta.cta,
                    ctaType: "textAndLink",
                  },
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
