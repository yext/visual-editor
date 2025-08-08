import { Migration } from "../../utils/migrate.ts";

export const enhanceCTATypes: Migration = {
  HeroSection: {
    action: "updated",
    propTransformation: (props) => {
      // Update hero section CTAs to use enhanced format
      if (props.data?.hero?.constantValue?.primaryCta?.cta) {
        props.data.hero.constantValue.primaryCta.cta = {
          ...props.data.hero.constantValue.primaryCta.cta,
          ctaType: "textAndLink",
        };
      }
      if (props.data?.hero?.constantValue?.secondaryCta?.cta) {
        props.data.hero.constantValue.secondaryCta.cta = {
          ...props.data.hero.constantValue.secondaryCta.cta,
          ctaType: "textAndLink",
        };
      }
      return props;
    },
  },
  PromoSection: {
    action: "updated",
    propTransformation: (props) => {
      // Update promo section CTAs to use enhanced format
      if (props.data?.promo?.constantValue?.cta?.cta) {
        props.data.promo.constantValue.cta.cta = {
          ...props.data.promo.constantValue.cta.cta,
          ctaType: "textAndLink",
        };
      }
      return props;
    },
  },
  ProductSection: {
    action: "updated",
    propTransformation: (props) => {
      // Update product section CTAs to use enhanced format
      if (props.data?.products?.constantValue) {
        props.data.products.constantValue =
          props.data.products.constantValue.map((product: any) => {
            if (product.cta) {
              product.cta = {
                ...product.cta,
                ctaType: "textAndLink",
              };
            }
            return product;
          });
      }
      return props;
    },
  },
  EventSection: {
    action: "updated",
    propTransformation: (props) => {
      // Update event section CTAs to use enhanced format
      if (props.data?.events?.constantValue) {
        props.data.events.constantValue = props.data.events.constantValue.map(
          (event: any) => {
            if (event.cta) {
              event.cta = {
                ...event.cta,
                ctaType: "textAndLink",
              };
            }
            return event;
          }
        );
      }
      return props;
    },
  },
  InsightSection: {
    action: "updated",
    propTransformation: (props) => {
      // Update insight section CTAs to use enhanced format
      if (props.data?.insights?.constantValue) {
        props.data.insights.constantValue =
          props.data.insights.constantValue.map((insight: any) => {
            if (insight.cta) {
              insight.cta = {
                ...insight.cta,
                ctaType: "textAndLink",
              };
            }
            return insight;
          });
      }
      return props;
    },
  },
  TeamSection: {
    action: "updated",
    propTransformation: (props) => {
      // Update team section CTAs to use enhanced format
      if (props.data?.people?.constantValue) {
        props.data.people.constantValue = props.data.people.constantValue.map(
          (person: any) => {
            if (person.cta) {
              person.cta = {
                ...person.cta,
                ctaType: "textAndLink",
              };
            }
            return person;
          }
        );
      }
      return props;
    },
  },
};
