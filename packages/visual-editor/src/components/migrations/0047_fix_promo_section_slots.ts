import { Migration } from "../../utils/migrate.ts";

// The original version of migration 30 incorrectly set the field for the slot components.
// This migration fixes the issue if the field is set incorrectly.
// Otherwise, it leaves the props unchanged.
export const fixPromoSectionSlots: Migration = {
  PromoSection: {
    action: "updated",
    propTransformation: (props) => {
      const field = props.data.promo?.field ?? "";
      if (field === "") {
        return props;
      }

      const titleField = props.slots.HeadingSlot?.[0]?.props?.data?.text?.field;
      if (titleField && titleField === field) {
        props.slots.HeadingSlot[0].props.data.text.field =
          titleField + ".title";
      }

      const descriptionField =
        props.slots.DescriptionSlot?.[0]?.props?.data?.text?.field;
      if (descriptionField && descriptionField === field) {
        props.slots.DescriptionSlot[0].props.data.text.field =
          descriptionField + ".description";
      }

      const ctaField =
        props.slots.CTASlot?.[0]?.props?.data?.entityField?.field;
      if (ctaField && ctaField === field) {
        props.slots.CTASlot[0].props.data.entityField.field = ctaField + ".cta";
      }

      const imageField = props.slots.ImageSlot?.[0]?.props?.data?.image?.field;
      if (imageField && imageField === field) {
        props.slots.ImageSlot[0].props.data.image.field = imageField + ".image";
      }

      return props;
    },
  },
};
