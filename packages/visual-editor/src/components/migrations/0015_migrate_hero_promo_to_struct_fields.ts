import { Migration } from "../../utils/migrate.ts";

export const migrateHeroPromoToStructFields: Migration = {
  HeroSection: {
    action: "updated",
    propTransformation: (props) => {
      // Handle old structure where hero data was directly in the component
      // and needs to be wrapped in YextStructEntityField format
      if (props.data?.hero) {
        const oldHeroData = props.data.hero;

        // Check if it's the old structure (not wrapped in YextStructEntityField)
        if (oldHeroData.primaryCta && !oldHeroData.primaryCta.cta) {
          // Convert old CTA structure to new nested structure
          props.data.hero = {
            field: "",
            constantValue: {
              image: oldHeroData.image,
              primaryCta: {
                cta: {
                  label: oldHeroData.primaryCta.label,
                  link: oldHeroData.primaryCta.link,
                  linkType: oldHeroData.primaryCta.linkType,
                  ctaType: "textAndLink",
                },
              },
              secondaryCta: oldHeroData.secondaryCta
                ? {
                    cta: {
                      label: oldHeroData.secondaryCta.label,
                      link: oldHeroData.secondaryCta.link,
                      linkType: oldHeroData.secondaryCta.linkType,
                      ctaType: "textAndLink",
                    },
                  }
                : undefined,
            },
            constantValueEnabled: true,
            constantValueOverride: {
              image: true,
              primaryCta: true,
              secondaryCta: true,
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

        // Check if it's the old structure (not wrapped in YextStructEntityField)
        if (oldPromoData.cta && !oldPromoData.cta.cta) {
          // Convert old CTA structure to new nested structure
          props.data.promo = {
            field: "",
            constantValue: {
              image: oldPromoData.image,
              title: oldPromoData.title,
              description: oldPromoData.description,
              cta: {
                cta: {
                  label: oldPromoData.cta.label,
                  link: oldPromoData.cta.link,
                  linkType: oldPromoData.cta.linkType,
                  ctaType: "textAndLink",
                },
              },
            },
            constantValueEnabled: true,
            constantValueOverride: {
              image: true,
              title: true,
              description: true,
              cta: true,
            },
          };
        }
      }

      return props;
    },
  },
};
