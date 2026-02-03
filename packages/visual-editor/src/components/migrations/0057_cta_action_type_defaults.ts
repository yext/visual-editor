import { Migration } from "../../utils/migrate.ts";

export const ctaActionTypeDefaults: Migration = {
  CTAWrapper: {
    action: "updated",
    propTransformation: (props) => {
      const data = props.data ?? {};
      const buttonText =
        typeof data.buttonText === "string"
          ? { en: data.buttonText, hasLocalizedValue: "true" }
          : data.buttonText;
      const ariaLabel =
        typeof data.ariaLabel === "string"
          ? { en: data.ariaLabel, hasLocalizedValue: "true" }
          : data.ariaLabel;
      const updatedData = {
        ...data,
        actionType: data.actionType ?? "link",
        buttonText: buttonText ?? { en: "Button", hasLocalizedValue: "true" },
        customId: data.customId ?? "",
        customClass: data.customClass ?? "",
        dataAttributes: data.dataAttributes ?? [],
        ariaLabel: ariaLabel ?? { en: "", hasLocalizedValue: "true" },
      };

      return {
        ...props,
        data: updatedData,
      };
    },
  },
};
