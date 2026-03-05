import { Migration } from "../../utils/migrate.ts";

const DEFAULT_PRIMARY_CTA_DESTINATION = "entityPage";

export const addLocatorPrimaryCtaDestination: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      const resultCard = props.resultCard ?? {};
      const primaryCTA = resultCard.primaryCTA ?? {};

      return {
        ...props,
        resultCard: {
          ...resultCard,
          primaryCTA: {
            ...primaryCTA,
            destination:
              primaryCTA?.destination ?? DEFAULT_PRIMARY_CTA_DESTINATION,
          },
        },
      };
    },
  },
};
