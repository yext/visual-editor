import { WithId } from "@measured/puck";
import { Migration } from "../../utils/migrate.ts";
import { CTAGroupProps } from "../contentBlocks/CTAGroup.tsx";
import { CTAWrapperProps } from "../contentBlocks/CtaWrapper.tsx";

export const organizeCTAWrapperProps: Migration = {
  CTAWrapper: {
    action: "updated",
    propTransformation: (props) => {
      const presetImage = props.entityField?.constantValue?.presetImageType;
      // TODO: make sure the CTA migrations are good
      // const displayType =
      //   props.entityField?.constantValue?.ctaType === "presetImage"
      //     ? "presetImage"
      //     : "textAndLink";
      const selectedTypes =
        props.entityField?.selectedType === "getDirections"
          ? ["type.coordinate"]
          : ["type.cta"];
      delete props.entityField?.selectedType;

      return {
        id: props.id,
        className: props.className,
        data: {
          entityField: { ...props.entityField, selectedTypes: selectedTypes },
        },
        styles: {
          presetImage,
          variant: props.variant,
        },
      } satisfies WithId<CTAWrapperProps>;
    },
  },
  CTAGroup: {
    action: "updated",
    propTransformation: (props) => {
      props.buttons = props.buttons.map((cta: any) => {
        let displayType = "textAndLink";
        if (cta.entityField?.constantValue?.ctaType === "presetImage") {
          displayType = "presetImage";
        } else if (
          cta.entityField?.constantValue?.ctaType === "getDirections"
        ) {
          cta.entityField.selectedTypes = ["type.coordinate"];
        }

        return {
          ...cta,
          displayType,
          presetImage: cta.entityField?.constantValue?.presetImageType,
        } satisfies CTAGroupProps;
      });
      return props;
    },
  },
};
