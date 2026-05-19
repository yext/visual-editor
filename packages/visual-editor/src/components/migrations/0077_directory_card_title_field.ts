import { Migration } from "../../utils/migrate.ts";

const defaultCardTitle = { defaultValue: "[[name]]" };

type LegacySlotChild = {
  props?: {
    data?: Record<string, unknown>;
    styles?: Record<string, unknown>;
    parentData?: unknown;
    [key: string]: unknown;
  };
  [key: string]: unknown;
};

type LegacySlots = {
  HeadingSlot?: LegacySlotChild[];
  AddressSlot?: LegacySlotChild[];
  PhoneSlot?: LegacySlotChild[];
  HoursSlot?: LegacySlotChild[];
};

type LegacyDirectoryCardProps = {
  id?: string;
  index?: number;
  styles?: {
    backgroundColor?: unknown;
  };
  data?: { cardTitle?: unknown };
  slots?: LegacySlots;
};

const defaultDirectoryCardSlotData = (
  id: string,
  index: number,
  existingCardStyle?: LegacyDirectoryCardProps["styles"],
  existingSlots?: LegacyDirectoryCardProps["slots"]
) => ({
  type: "DirectoryCard",
  props: {
    id,
    index,
    data: {
      cardTitle: defaultCardTitle,
    },
    styles: {
      backgroundColor: existingCardStyle?.backgroundColor ?? {
        selectedColor: "white",
        contrastingColor: "black",
      },
    },
    slots: {
      HeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            ...(id && { id: `${id}-heading` }),
            data: {
              text:
                existingSlots?.HeadingSlot?.[0]?.props?.data?.text ??
                defaultCardTitle,
            },
            styles: {
              level: existingSlots?.HeadingSlot?.[0]?.props?.styles?.level ?? 3,
              align:
                existingSlots?.HeadingSlot?.[0]?.props?.styles?.align ?? "left",
            },
          },
        },
      ],
      AddressSlot: [
        {
          type: "AddressSlot",
          props: {
            ...(id && { id: `${id}-address` }),
            data: {
              address: {
                field: "address",
                constantValue: {
                  line1: "",
                  city: "",
                  postalCode: "",
                  countryCode: "",
                },
              },
            },
            styles: {
              showRegion:
                existingSlots?.AddressSlot?.[0]?.props?.styles?.showRegion ??
                true,
              showCountry:
                existingSlots?.AddressSlot?.[0]?.props?.styles?.showCountry ??
                true,
              showGetDirectionsLink:
                existingSlots?.AddressSlot?.[0]?.props?.styles
                  ?.showGetDirectionsLink ?? false,
              ctaVariant:
                existingSlots?.AddressSlot?.[0]?.props?.styles?.ctaVariant ??
                "link",
            },
            parentData: {
              field: "profile.address",
            },
          },
        },
      ],
      PhoneSlot: [
        {
          type: "PhoneSlot",
          props: {
            ...(id && { id: `${id}-phone` }),
            data: {
              number: {
                constantValue: "",
                field: "mainPhone",
              },
              label: {
                constantValue: "",
                hasLocalizedValue: "true",
                field: "",
              },
            },
            styles: {
              phoneFormat:
                existingSlots?.PhoneSlot?.[0]?.props?.styles?.phoneFormat ??
                "domestic",
              includePhoneHyperlink:
                existingSlots?.PhoneSlot?.[0]?.props?.styles
                  ?.includePhoneHyperlink ?? true,
              includeIcon:
                existingSlots?.PhoneSlot?.[0]?.props?.styles?.includeIcon ??
                false,
            },
            parentData: {
              field: "profile.mainPhone",
            },
          },
        },
      ],
      HoursSlot: [
        {
          type: "HoursStatusSlot",
          props: {
            ...(id && { id: `${id}-hours` }),
            data: {
              hours: {
                constantValue: {},
                field: "hours",
              },
            },
            styles: {
              dayOfWeekFormat:
                existingSlots?.HoursSlot?.[0]?.props?.styles?.dayOfWeekFormat ??
                "long",
              showDayNames:
                existingSlots?.HoursSlot?.[0]?.props?.styles?.showDayNames ??
                true,
              showCurrentStatus:
                existingSlots?.HoursSlot?.[0]?.props?.styles
                  ?.showCurrentStatus ?? true,
              className:
                existingSlots?.HoursSlot?.[0]?.props?.styles?.className ??
                "mb-2 font-semibold font-body-fontFamily text-body-fontSize h-full",
            },
            parentData: {
              field: "profile.hours",
            },
          },
        },
      ],
    },
  },
});

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
