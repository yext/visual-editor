import { Migration } from "../../utils/migrate.ts";
import {
  defaultDirectoryCardSlotData,
  DirectoryCardProps,
} from "../directory/DirectoryCard.tsx";

const defaultCardTitle = { defaultValue: "[[name]]" };

type LegacyDirectoryCardProps = {
  id?: string;
  index?: number;
  styles?: DirectoryCardProps["styles"];
  data?: { cardTitle?: unknown };
  slots?: DirectoryCardProps["slots"];
};

const isEntityFieldValue = (
  value: unknown
): value is {
  field?: string;
  constantValue?: unknown;
  constantValueEnabled?: boolean;
} =>
  typeof value === "object" &&
  value !== null &&
  ("field" in value || "constantValue" in value);

const isDefaultDirectoryCardTitle = (value: unknown): boolean => {
  if (isEntityFieldValue(value)) {
    return isDefaultDirectoryCardTitle(value.constantValue);
  }

  return (
    typeof value === "object" &&
    value !== null &&
    "defaultValue" in value &&
    (value as { defaultValue?: unknown }).defaultValue ===
      defaultCardTitle.defaultValue
  );
};

const toHeadingTextField = (value: unknown) =>
  isEntityFieldValue(value)
    ? {
        field: value.field ?? "",
        constantValueEnabled: value.constantValueEnabled ?? false,
        constantValue: value.constantValue,
      }
    : {
        field: "",
        constantValueEnabled: true,
        constantValue: value ?? defaultCardTitle,
      };

const toDirectoryGridTitleMapping = (value: unknown) => {
  if (
    isEntityFieldValue(value) &&
    !value.constantValueEnabled &&
    typeof value.field === "string" &&
    value.field.length > 0
  ) {
    return {
      field: value.field,
      constantValueEnabled: false,
      constantValue: value.constantValue,
    };
  }

  if (isDefaultDirectoryCardTitle(value)) {
    return {
      field: "name",
      constantValueEnabled: false,
      constantValue: undefined,
    };
  }

  const headingTextField = toHeadingTextField(value);
  return {
    field: "",
    constantValueEnabled: true,
    constantValue: headingTextField.constantValue ?? defaultCardTitle,
  };
};

const getLegacyCardTitle = (cardProps: LegacyDirectoryCardProps = {}) => {
  const headingSlot = cardProps.slots?.HeadingSlot?.[0] as
    | {
        props?: {
          data?: { text?: unknown };
          parentData?: { field?: string };
        };
      }
    | undefined;
  const savedHeadingText =
    cardProps.data?.cardTitle ?? headingSlot?.props?.data?.text;

  if (
    savedHeadingText !== undefined &&
    savedHeadingText !== "" &&
    (!isEntityFieldValue(savedHeadingText) ||
      savedHeadingText.field !== "" ||
      (savedHeadingText.constantValue !== undefined &&
        savedHeadingText.constantValue !== "" &&
        savedHeadingText.constantValue !== null))
  ) {
    return savedHeadingText;
  }

  if (headingSlot?.props?.parentData?.field === "profile.name") {
    return defaultCardTitle;
  }

  return savedHeadingText;
};

const normalizeDirectoryCards = (cards: unknown) => {
  if (!Array.isArray(cards)) {
    return [];
  }

  return cards.map((card, index) => {
    if (!card || typeof card !== "object") {
      return card;
    }

    const cardProps = ((card as { props?: LegacyDirectoryCardProps }).props ??
      {}) as LegacyDirectoryCardProps;
    const headingText = getLegacyCardTitle(cardProps ?? {});
    const normalizedCard = defaultDirectoryCardSlotData(
      cardProps?.id ?? "",
      cardProps?.index ?? index,
      undefined,
      cardProps?.styles,
      cardProps?.slots
    );
    const headingSlot = normalizedCard.props.slots.HeadingSlot[0];

    headingSlot.props = {
      ...headingSlot.props,
      data: {
        ...headingSlot.props.data,
        text: toHeadingTextField(headingText),
      },
    };

    Object.values(normalizedCard.props.slots).forEach((slotArray) => {
      slotArray.forEach((slotChild) => {
        const slotChildProps = slotChild.props as
          | { parentData?: unknown }
          | undefined;

        if (!slotChildProps || !("parentData" in slotChildProps)) {
          return;
        }

        delete slotChildProps.parentData;
      });
    });

    return normalizedCard;
  });
};

export const directoryCardTitleField: Migration = {
  DirectoryGrid: {
    action: "updated",
    propTransformation: (props) => {
      const firstLegacyCardProps =
        Array.isArray(props.slots?.CardSlot) &&
        props.slots.CardSlot[0] &&
        typeof props.slots.CardSlot[0] === "object"
          ? (((props.slots.CardSlot[0] as { props?: LegacyDirectoryCardProps })
              .props ?? {}) as LegacyDirectoryCardProps)
          : {};
      const cards = normalizeDirectoryCards(props.slots?.CardSlot);
      const firstHeadingText = getLegacyCardTitle(firstLegacyCardProps);

      return {
        ...props,
        data: {
          field: "dm_directoryChildren",
          constantValueEnabled: false,
          constantValue: [],
          mappings: {
            cardTitle: toDirectoryGridTitleMapping(firstHeadingText),
          },
        },
        slots: {
          ...props.slots,
          CardSlot: cards,
        },
        manualSlots: {
          CardSlot: cards,
        },
      };
    },
  },
};
