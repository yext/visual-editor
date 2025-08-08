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
                  label: oldHeroData.constantValue.primaryCta.label,
                  link: oldHeroData.constantValue.primaryCta.link,
                  linkType: oldHeroData.constantValue.primaryCta.linkType,
                  ctaType: "textAndLink",
                },
              },
              secondaryCta: oldHeroData.constantValue?.secondaryCta
                ? {
                    cta: {
                      label: oldHeroData.constantValue.secondaryCta.label,
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
          // Set up the component to use constant values that match the expected new structure
          // This ensures the component renders correctly even if the entity field has old structure
          props.data.hero = {
            ...oldHeroData,
            constantValueEnabled: true,
            constantValueOverride: {
              image: false,
              primaryCta: true,
              secondaryCta: true,
            },
            constantValue: {
              ...oldHeroData.constantValue,
              primaryCta: {
                cta: {
                  label: "Call To Action",
                  link: "#",
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
              },
              secondaryCta: {
                cta: {
                  label: "Call To Action",
                  link: "#",
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
              },
            },
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
                  label: oldPromoData.constantValue.cta.label,
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
          // Set up the component to use constant values that match the expected new structure
          props.data.promo = {
            ...oldPromoData,
            constantValueEnabled: true,
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
                  label: "Call To Action",
                  link: "#",
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
              },
            },
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
        props.data.products.constantValue =
          props.data.products.constantValue.map((product: any) => {
            if (product.cta && product.cta.label && !product.cta.cta) {
              return {
                ...product,
                cta: {
                  cta: {
                    label: product.cta.label,
                    link: product.cta.link,
                    linkType: product.cta.linkType,
                    ctaType: "textAndLink",
                  },
                },
              };
            }
            return product;
          });
      }
      return props;
    },
  },
  TeamSection: {
    action: "updated",
    propTransformation: (props) => {
      // Handle old structure where people array has CTAs without nested 'cta' wrapper
      if (props.data?.people?.constantValue) {
        props.data.people.constantValue = props.data.people.constantValue.map(
          (person: any) => {
            if (person.cta && person.cta.label && !person.cta.cta) {
              return {
                ...person,
                cta: {
                  cta: {
                    label: person.cta.label,
                    link: person.cta.link,
                    linkType: person.cta.linkType,
                    ctaType: "textAndLink",
                  },
                },
              };
            }
            return person;
          }
        );
      }
      return props;
    },
  },
  InsightSection: {
    action: "updated",
    propTransformation: (props) => {
      // Handle old structure where insights array has CTAs without nested 'cta' wrapper
      if (props.data?.insights?.constantValue) {
        props.data.insights.constantValue =
          props.data.insights.constantValue.map((insight: any) => {
            if (insight.cta && insight.cta.label && !insight.cta.cta) {
              return {
                ...insight,
                cta: {
                  cta: {
                    label: insight.cta.label,
                    link: insight.cta.link,
                    linkType: insight.cta.linkType,
                    ctaType: "textAndLink",
                  },
                },
              };
            }
            return insight;
          });
      }
      return props;
    },
  },
  EventSection: {
    action: "updated",
    propTransformation: (props) => {
      // Handle old structure where events array has CTAs without nested 'cta' wrapper
      if (props.data?.events?.constantValue) {
        props.data.events.constantValue = props.data.events.constantValue.map(
          (event: any) => {
            if (event.cta && event.cta.label && !event.cta.cta) {
              return {
                ...event,
                cta: {
                  cta: {
                    label: event.cta.label,
                    link: event.cta.link,
                    linkType: event.cta.linkType,
                    ctaType: "textAndLink",
                  },
                },
              };
            }
            return event;
          }
        );
      }
      return props;
    },
  },
};
