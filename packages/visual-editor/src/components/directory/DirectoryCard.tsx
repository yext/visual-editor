import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import {
  Background,
  HeadingTextProps,
  MaybeLink,
  useTemplateProps,
  YextField,
  msg,
  backgroundColors,
  BackgroundStyle,
  HoursStatusProps,
  PhoneProps,
  deepMerge,
} from "@yext/visual-editor";
import { Address } from "@yext/pages-components";
import { mergeMeta } from "../../utils/mergeMeta";
import { useCardContext } from "../../hooks/useCardContext";
import { useGetCardSlots } from "../../hooks/useGetCardSlots";
import React from "react";
import { resolvePageSetUrlOfChild } from "../../utils/urls/resolveUrlTemplate";

export const defaultDirectoryCardSlotData = (
  id: string,
  index: number,
  profile: any,
  existingCardStyle?: DirectoryCardProps["styles"],
  existingSlots?: DirectoryCardProps["slots"]
) => ({
  type: "DirectoryCard",
  props: {
    id,
    index,
    styles: {
      backgroundColor:
        existingCardStyle?.backgroundColor ??
        backgroundColors.background1.value,
    },
    slots: {
      HeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            ...(id && { id: `${id}-heading` }),
            data: {
              text: {
                constantValue: "",
                field: "",
              },
            },
            styles: {
              level: existingSlots?.HeadingSlot?.[0]?.props?.styles?.level ?? 3,
              align:
                existingSlots?.HeadingSlot?.[0]?.props?.styles?.align ?? "left",
            },
            parentData: {
              field: "profile.name",
              text: profile["name"],
            },
          } satisfies HeadingTextProps,
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
                field: "",
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
              phoneNumber: profile["mainPhone"],
            },
          } satisfies PhoneProps,
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
                field: "",
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
              hours: profile["hours"],
              timezone: profile["timezone"],
            },
          } satisfies HoursStatusProps,
        },
      ],
    },
    parentData: {
      profile,
    },
  },
});

export type DirectoryCardProps = {
  /** Styling for all the cards. */
  styles: {
    /** The background color of each directory card */
    backgroundColor?: BackgroundStyle;
  };

  /** @internal */
  slots: {
    HeadingSlot: Slot;
    PhoneSlot: Slot;
    HoursSlot: Slot;
  };

  /** @internal */
  parentData?: {
    profile: any;
  };

  /** @internal */
  index?: number;
};

const DirectoryCardComponent: PuckComponent<DirectoryCardProps> = (props) => {
  const { styles, slots, parentData, index, puck } = props;
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();

  const resolvedUrl = parentData
    ? resolvePageSetUrlOfChild(
        mergeMeta(parentData.profile, streamDocument),
        relativePrefixToRoot,
        puck.metadata?.resolveUrlTemplate
      )
    : undefined;

  const { sharedCardProps, setSharedCardProps } = useCardContext<{
    cardStyles: DirectoryCardProps["styles"];
    slotStyles: Record<string, DirectoryCardProps["styles"]>;
  }>();

  const { slotStyles, getPuck, slotProps } =
    useGetCardSlots<DirectoryCardProps>(props.id);

  // sharedCardProps useEffect
  // When the context changes, dispatch an update to sync the changes to puck
  React.useEffect(() => {
    if (!puck.isEditing || !sharedCardProps || !getPuck) {
      return;
    }

    if (
      JSON.stringify(sharedCardProps?.cardStyles) === JSON.stringify(styles) &&
      JSON.stringify(slotStyles) === JSON.stringify(sharedCardProps?.slotStyles)
    ) {
      return;
    }

    const { dispatch, getSelectorForId } = getPuck();
    const selector = getSelectorForId(props.id);
    if (!selector || !slotProps) {
      return;
    }

    const newSlotData: DirectoryCardProps["slots"] = {
      HeadingSlot: [],
      PhoneSlot: [],
      HoursSlot: [],
    };
    Object.entries(slotProps).forEach(([key, value]) => {
      newSlotData[key as keyof DirectoryCardProps["slots"]] = [
        {
          ...deepMerge(
            { props: { styles: { ...sharedCardProps?.slotStyles?.[key] } } },
            value[0]
          ),
        },
      ];
    });

    // oxlint-disable-next-line no-unused-vars: remove props.puck before dispatching to avoid writing it to the saved data
    const { puck: _, editMode: __, ...otherProps } = props;
    dispatch({
      type: "replace" as const,
      destinationIndex: selector.index,
      destinationZone: selector.zone,
      data: {
        type: "DirectoryCard",
        props: {
          ...otherProps,
          styles: {
            backgroundColor:
              sharedCardProps?.cardStyles.backgroundColor ||
              backgroundColors.background1.value,
          },
          slots: newSlotData,
        } satisfies DirectoryCardProps,
      },
    });
  }, [sharedCardProps]);

  // styles and slotStyles useEffect
  // When the card's shared props or the card's slots' shared props change, update the context
  React.useEffect(() => {
    if (!puck.isEditing || !slotProps) {
      return;
    }

    if (
      JSON.stringify(sharedCardProps?.cardStyles) === JSON.stringify(styles) &&
      JSON.stringify(sharedCardProps?.slotStyles) === JSON.stringify(slotStyles)
    ) {
      return;
    }

    setSharedCardProps({
      cardStyles: styles,
      slotStyles: slotStyles,
    });
  }, [styles, slotStyles]);

  return (
    <Background
      className="h-full flex flex-col p-8 border border-gray-400 rounded gap-4"
      background={styles.backgroundColor}
    >
      <div className="mb-2 max-w-full w-full">
        <MaybeLink
          eventName={`link${index}`}
          alwaysHideCaret={true}
          className="text-wrap break-words block w-full"
          href={resolvedUrl}
          disabled={puck.isEditing}
        >
          <slots.HeadingSlot style={{ height: "auto" }} />
        </MaybeLink>
      </div>
      {parentData?.profile?.hours && (
        <slots.HoursSlot style={{ height: "auto" }} />
      )}
      {parentData?.profile?.mainPhone && (
        <slots.PhoneSlot style={{ height: "auto" }} />
      )}
      {parentData?.profile?.address && (
        <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
          <Address
            address={parentData?.profile?.address}
            lines={[["line1"], ["line2"], ["city", "region", "postalCode"]]}
          />
        </div>
      )}
    </Background>
  );
};

const directoryCardFields: Fields<DirectoryCardProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      HeadingSlot: { type: "slot" },
      PhoneSlot: { type: "slot" },
      HoursSlot: { type: "slot" },
    },
    visible: false,
  },
};

export const DirectoryCard: ComponentConfig<{
  props: DirectoryCardProps;
}> = {
  label: msg("slots.directoryCard", "Directory Card"),
  fields: directoryCardFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    slots: {
      HeadingSlot: [],
      PhoneSlot: [],
      HoursSlot: [],
    },
  },
  render: (props) => <DirectoryCardComponent {...props} />,
};
