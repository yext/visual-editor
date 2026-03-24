import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import React from "react";
import { YextField } from "../../editor/YextField.tsx";
import { useCardContext } from "../../hooks/useCardContext.tsx";
import {
  TemplatePropsContext,
  useTemplateProps,
} from "../../hooks/useDocument.tsx";
import { useGetCardSlots } from "../../hooks/useGetCardSlots.tsx";
import { msg } from "../../utils/i18n/platform.ts";
import {
  backgroundColors,
  ThemeColor,
} from "../../utils/themeConfigOptions.ts";
import { deepMerge } from "../../utils/themeResolver.ts";
import {
  mergeMeta,
  resolveUrlTemplateOfChild,
} from "../../utils/urls/resolveUrlTemplate.ts";
import { Background } from "../atoms/background.tsx";
import { MaybeLink } from "../atoms/maybeLink.tsx";
import { AddressProps } from "../contentBlocks/Address.tsx";
import { HeadingTextProps } from "../contentBlocks/HeadingText.tsx";
import { HoursStatusProps } from "../contentBlocks/HoursStatus.tsx";
import { PhoneProps } from "../contentBlocks/Phone.tsx";
import {
  DirectoryChildReference,
  getSortedDirectoryChildren,
  resolveDirectoryChildFromReference,
  useDirectoryChildren,
} from "./directoryChildReference.tsx";

export const defaultDirectoryCardSlotData = (
  id: string,
  index: number,
  childRef: DirectoryChildReference,
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
                field: "name",
              },
            },
            styles: {
              level: existingSlots?.HeadingSlot?.[0]?.props?.styles?.level ?? 3,
              align:
                existingSlots?.HeadingSlot?.[0]?.props?.styles?.align ?? "left",
            },
            parentData: {
              field: "profile.name",
            },
          } satisfies HeadingTextProps,
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
          } satisfies AddressProps,
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
          } satisfies HoursStatusProps,
        },
      ],
    },
    parentData: {
      childRef,
    },
  },
});

export type DirectoryCardProps = {
  /** Styling for all the cards. */
  styles: {
    /** The background color of each directory card */
    backgroundColor?: ThemeColor;
  };

  /** @internal */
  slots: {
    HeadingSlot: Slot;
    AddressSlot: Slot;
    PhoneSlot: Slot;
    HoursSlot: Slot;
  };

  /** @internal */
  parentData?: {
    childRef: DirectoryChildReference;
  };

  /** @internal */
  index?: number;
};

const DirectoryCardComponent: PuckComponent<DirectoryCardProps> = (props) => {
  const { styles, slots, parentData, index, puck } = props;
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();
  const directoryChildrenFromContext = useDirectoryChildren();
  const sortedDirectoryChildren = React.useMemo(
    () =>
      directoryChildrenFromContext.length
        ? directoryChildrenFromContext
        : getSortedDirectoryChildren(streamDocument.dm_directoryChildren),
    [directoryChildrenFromContext, streamDocument.dm_directoryChildren]
  );
  const profile = React.useMemo(
    () =>
      resolveDirectoryChildFromReference(
        sortedDirectoryChildren,
        parentData?.childRef
      ),
    [parentData?.childRef, sortedDirectoryChildren]
  );
  const childDocumentContext = React.useMemo(
    () =>
      profile
        ? {
            document: {
              ...streamDocument,
              ...mergeMeta(profile, streamDocument),
            },
            relativePrefixToRoot,
          }
        : {
            document: streamDocument,
            relativePrefixToRoot,
          },
    [profile, relativePrefixToRoot, streamDocument]
  );

  const resolvedUrl = profile
    ? resolveUrlTemplateOfChild(profile, streamDocument, relativePrefixToRoot)
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
      AddressSlot: [],
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
      <TemplatePropsContext.Provider value={childDocumentContext}>
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
        {profile?.hours && <slots.HoursSlot style={{ height: "auto" }} />}
        {profile?.mainPhone && <slots.PhoneSlot style={{ height: "auto" }} />}
        {profile?.address && (
          <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
            <slots.AddressSlot style={{ height: "auto" }} />
          </div>
        )}
      </TemplatePropsContext.Provider>
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
      AddressSlot: { type: "slot" },
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
      AddressSlot: [],
    },
  },
  render: (props) => <DirectoryCardComponent {...props} />,
};
