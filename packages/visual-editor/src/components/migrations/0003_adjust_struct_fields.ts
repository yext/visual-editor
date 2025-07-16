import { Migration } from "../../utils/migrate.ts";

export const adjustStructFields: Migration = {
  PromoSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          ...props.data,
          promo: {
            ...props.data.promo,
            constantValueEnabled: props.data.promo.field === "",
            constantValueOverride: {
              image: props.data.promo.constantValueOverride.image ?? false,
              title: props.data.promo.constantValueOverride.title ?? false,
              description:
                props.data.promo.constantValueOverride.description ?? false,
              cta: props.data.promo.constantValueOverride.cta ?? false,
            },
          },
        },
      };
    },
  },
  HeroSection: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          ...props.data,
          hero: {
            ...props.data.hero,
            constantValueEnabled: props.data.hero.field === "",
            constantValueOverride: {
              image: props.data.hero.constantValueOverride.image ?? false,
              primaryCta:
                props.data.hero.constantValueOverride.primaryCta ?? false,
              secondaryCta:
                props.data.hero.constantValueOverride.secondaryCta ?? false,
            },
          },
        },
      };
    },
  },
};
