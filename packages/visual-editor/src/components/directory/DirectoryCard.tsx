import { PuckComponent, setDeep, Slot } from "@puckeditor/core";
import React from "react";
import { useCardContext } from "../../hooks/useCardContext.tsx";
import {
  TemplatePropsContext,
  useTemplateProps,
} from "../../hooks/useDocument.tsx";
import { useGetCardSlots } from "../../hooks/useGetCardSlots.tsx";
import { msg, pt } from "../../utils/i18n/platform.ts";
import {
  backgroundColors,
  ThemeColor,
} from "../../utils/themeConfigOptions.ts";
import { deepMerge } from "../../utils/themeResolver.ts";
import {
  mergeMeta,
  resolveUrlTemplateOfChild,
} from "../../utils/urls/resolveUrlTemplate.ts";
import { TranslatableString } from "../../types/types.ts";
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
import { YextComponentConfig, YextFields } from "../../fields/fields.ts";

const defaultCardTitle: TranslatableString = { defaultValue: "[[name]]" };

export const defaultDirectoryCardSlotData = (
  id: string,
  index: number,
  childRef: DirectoryChildReference,
  existingCardData?: DirectoryCardProps["data"],
  existingCardStyle?: DirectoryCardProps["styles"],
  existingSlots?: DirectoryCardProps["slots"]
) => ({
  type: "DirectoryCard",
  props: {
    id,
    index,
    data: {
      cardTitle: existingCardData?.cardTitle ?? defaultCardTitle,
    },
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
                field: "",
                constantValue: existingCardData?.cardTitle ?? defaultCardTitle,
                constantValueEnabled: true,
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
  data: {
    /** The title for each card */
    cardTitle: TranslatableString;
  };

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
  const { data, styles, slots, parentData, index, puck } = props;
  const { document: streamDocument, relativePrefixToRoot } = useTemplateProps();
  const directoryChildrenFromContext = useDirectoryChildren();
  const sortedDirectoryChildren = React.useMemo(
    () =>
      directoryChildrenFromContext.length
        ? directoryChildrenFromContext
        : getSortedDirectoryChildren(streamDocument.dm_directoryChildren),
    [directoryChildrenFromContext, streamDocument.dm_directoryChildren]
  );
  const resolvedChild = React.useMemo(
    () =>
      resolveDirectoryChildFromReference(
        sortedDirectoryChildren,
        parentData?.childRef
      ),
    [parentData?.childRef, sortedDirectoryChildren]
  );
  // Give nested slots a child-scoped document context instead of duplicating
  // child values into each slot's parentData.
  const childDocumentContext = React.useMemo(
    () =>
      resolvedChild
        ? {
            document: {
              ...streamDocument,
              ...mergeMeta(resolvedChild, streamDocument),
            },
            relativePrefixToRoot,
          }
        : {
            document: streamDocument,
            relativePrefixToRoot,
          },
    [resolvedChild, relativePrefixToRoot, streamDocument]
  );

  const resolvedUrl = resolvedChild
    ? resolveUrlTemplateOfChild(
        resolvedChild,
        streamDocument,
        relativePrefixToRoot
      )
    : undefined;

  const { sharedCardProps, setSharedCardProps } = useCardContext<{
    cardData: DirectoryCardProps["data"];
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
      JSON.stringify(sharedCardProps?.cardData) === JSON.stringify(data) &&
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
      const nextSlotValue = deepMerge(
        { props: { styles: { ...sharedCardProps?.slotStyles?.[key] } } },
        value[0]
      );
      if (key === "HeadingSlot") {
        nextSlotValue.props = {
          ...nextSlotValue.props,
          data: {
            ...nextSlotValue.props?.data,
            text: {
              field: "",
              constantValue: sharedCardProps.cardData.cardTitle,
              constantValueEnabled: true,
            },
          },
        };
      }
      newSlotData[key as keyof DirectoryCardProps["slots"]] = [
        {
          ...nextSlotValue,
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
          data: sharedCardProps.cardData,
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
      JSON.stringify(sharedCardProps?.cardData) === JSON.stringify(data) &&
      JSON.stringify(sharedCardProps?.cardStyles) === JSON.stringify(styles) &&
      JSON.stringify(sharedCardProps?.slotStyles) === JSON.stringify(slotStyles)
    ) {
      return;
    }

    setSharedCardProps({
      cardData: data,
      cardStyles: styles,
      slotStyles: slotStyles,
    });
  }, [data, styles, slotStyles]);

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
        {resolvedChild?.hours && <slots.HoursSlot style={{ height: "auto" }} />}
        {resolvedChild?.mainPhone && (
          <slots.PhoneSlot style={{ height: "auto" }} />
        )}
        {resolvedChild?.address && (
          <div className="font-body-fontFamily font-body-fontWeight text-body-fontSize">
            <slots.AddressSlot style={{ height: "auto" }} />
          </div>
        )}
      </TemplatePropsContext.Provider>
    </Background>
  );
};

const directoryCardFields: YextFields<DirectoryCardProps> = {
  data: {
    type: "object",
    label: msg("fields.data", "Data"),
    objectFields: {
      cardTitle: {
        type: "translatableString",
        label: msg("fields.title", "Title"),
        filter: {
          types: ["type.string"],
        },
        showApplyAllOption: true,
        getOptions: () => {
          return [
            { label: pt("name", "Name"), value: "name" },
            { label: pt("slug", "Slug"), value: "slug" },
            { label: pt("geomodifier", "Geomodifier"), value: "geomodifier" },
            { label: pt("id", "ID"), value: "id" },
            {
              label: pt("addressLine1", "Address > Line 1"),
              value: "address.line1",
            },
            {
              label: pt("addressLine2", "Address > Line 2"),
              value: "address.line2",
            },

            {
              label: pt("city", "Address > City"),
              value: "address.city",
            },
            {
              label: pt("region", "Address > Region"),
              value: "address.region",
            },
            {
              label: pt("country", "Address > Country"),
              value: "address.country",
            },
            {
              label: pt("postalCode", "Address > Postal Code"),
              value: "address.postalCode",
            },
          ];
        },
      },
    },
  },
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
      },
    },
  },
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

export const DirectoryCard: YextComponentConfig<DirectoryCardProps> = {
  label: msg("slots.directoryCard", "Directory Card"),
  fields: directoryCardFields,
  defaultProps: {
    data: {
      cardTitle: defaultCardTitle,
    },
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
  resolveData: (data) => {
    const headingSlot = data.props.slots.HeadingSlot?.[0];
    if (!headingSlot) {
      return data;
    }

    return setDeep(data, "props.slots.HeadingSlot[0].props.data.text", {
      field: "",
      constantValue: data.props.data.cardTitle,
      constantValueEnabled: true,
    } satisfies HeadingTextProps["data"]["text"]);
  },
  render: (props) => <DirectoryCardComponent {...props} />,
};
