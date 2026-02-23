import { Migration } from "../../utils/migrate.ts";

const DEFAULT_PRIMARY_HEADING_CONSTANT_VALUE = "";
const DEFAULT_IMAGE_CONSTANT_VALUE = {
  url: "",
  height: 0,
  width: 0,
};

export const locatorStaticContentToggles: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      const resultCard = props.resultCard ?? {};
      const primaryHeading = resultCard.primaryHeading ?? {};
      const secondaryHeading = resultCard.secondaryHeading ?? {};
      const tertiaryHeading = resultCard.tertiaryHeading ?? {};
      const image = resultCard.image ?? {};

      return {
        ...props,
        resultCard: {
          ...resultCard,
          primaryHeading: {
            ...primaryHeading,
            constantValueEnabled: primaryHeading.constantValueEnabled ?? false,
            constantValue:
              primaryHeading.constantValue ??
              DEFAULT_PRIMARY_HEADING_CONSTANT_VALUE,
          },
          secondaryHeading: {
            ...secondaryHeading,
            constantValueEnabled:
              secondaryHeading.constantValueEnabled ?? false,
            constantValue:
              secondaryHeading.constantValue ??
              DEFAULT_PRIMARY_HEADING_CONSTANT_VALUE,
          },
          tertiaryHeading: {
            ...tertiaryHeading,
            constantValueEnabled: tertiaryHeading.constantValueEnabled ?? false,
            constantValue:
              tertiaryHeading.constantValue ??
              DEFAULT_PRIMARY_HEADING_CONSTANT_VALUE,
          },
          image: {
            ...image,
            constantValueEnabled: image.constantValueEnabled ?? false,
            constantValue: image.constantValue ?? DEFAULT_IMAGE_CONSTANT_VALUE,
          },
        },
      };
    },
  },
};
