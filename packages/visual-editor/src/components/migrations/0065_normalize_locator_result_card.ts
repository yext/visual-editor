import { DEFAULT_ENTITY_TYPE } from "../../utils/locatorEntityTypes.ts";
import { Migration } from "../../utils/migrate.ts";
import { DEFAULT_LOCATOR_RESULT_CARD_PROPS } from "../LocatorResultCard.tsx";

const normalizeResultCardItem = (
  item: Record<string, any> | undefined,
  fallbackEntityType: string
) => {
  const itemEntityType =
    item?.entityType ??
    item?.props?.entityType ??
    fallbackEntityType ??
    DEFAULT_ENTITY_TYPE;
  const rawProps = item?.props ?? item ?? {};

  return {
    props: {
      ...DEFAULT_LOCATOR_RESULT_CARD_PROPS,
      ...rawProps,
      entityType: itemEntityType,
      primaryHeading: {
        ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.primaryHeading,
        ...rawProps.primaryHeading,
      },
      secondaryHeading: {
        ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.secondaryHeading,
        ...rawProps.secondaryHeading,
      },
      tertiaryHeading: {
        ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.tertiaryHeading,
        ...rawProps.tertiaryHeading,
      },
      hours: {
        ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.hours,
        ...rawProps.hours,
        table: {
          ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.hours.table,
          ...rawProps.hours?.table,
        },
      },
      address: {
        ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.address,
        ...rawProps.address,
      },
      phone: {
        ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.phone,
        ...rawProps.phone,
      },
      email: {
        ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.email,
        ...rawProps.email,
      },
      services: {
        ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.services,
        ...rawProps.services,
      },
      primaryCTA: {
        ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.primaryCTA,
        ...rawProps.primaryCTA,
      },
      secondaryCTA: {
        ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.secondaryCTA,
        ...rawProps.secondaryCTA,
      },
      image: {
        ...DEFAULT_LOCATOR_RESULT_CARD_PROPS.image,
        ...rawProps.image,
      },
    },
  };
};

export const normalizeLocatorResultCard: Migration = {
  Locator: {
    action: "updated",
    propTransformation: (props) => {
      const currentResultCard = props.resultCard;

      if (Array.isArray(currentResultCard)) {
        return {
          ...props,
          resultCard: currentResultCard.map((item) =>
            normalizeResultCardItem(item, item?.entityType)
          ),
        };
      }

      if (
        !currentResultCard ||
        typeof currentResultCard !== "object" ||
        Object.keys(currentResultCard).length === 0
      ) {
        return props;
      }

      const fallbackEntityType =
        currentResultCard.entityType ?? DEFAULT_ENTITY_TYPE;

      return {
        ...props,
        resultCard: [
          normalizeResultCardItem(currentResultCard, fallbackEntityType),
        ],
      };
    },
  },
};
