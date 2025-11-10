import { setDeep } from "@measured/puck";
import { Migration } from "../../utils/migrate";

export const set_default_cta_variants: Migration = {
  InsightCard: {
    action: "updated",
    propTransformation: (props) => {
      const ctaSlot = props?.slots?.CTASlot?.[0];
      if (ctaSlot && ctaSlot.props.styles?.variant === undefined) {
        return setDeep(
          props,
          "slots.CTASlot[0].props.styles.variant",
          "primary"
        );
      }
      return props;
    },
  },
  CoreInfoSection: {
    action: "updated",
    propTransformation: (props) => {
      const addressCtaSlot = props.slots?.CoreInfoAddressSlot?.[0];
      if (
        addressCtaSlot &&
        addressCtaSlot.props.styles?.ctaVariant === undefined
      ) {
        return setDeep(
          props,
          "slots.CoreInfoAddressSlot[0].props.styles.ctaVariant",
          "link"
        );
      }
      return props;
    },
  },
  TestimonialCard: {
    action: "updated",
    propTransformation: (props) => {
      const contributionDataSlot = props.slots?.ContributionDateSlot?.[0];
      if (
        contributionDataSlot &&
        (contributionDataSlot.props.data?.date?.constantValue === undefined ||
          Number.isNaN(
            Date.parse(contributionDataSlot.props.data?.date?.constantValue)
          ))
      ) {
        return setDeep(
          props,
          "slots.ContributionDateSlot[0].props.data.date.constantValue",
          "2022-08-02T14:00:00"
        );
      }
      return props;
    },
  },
};
