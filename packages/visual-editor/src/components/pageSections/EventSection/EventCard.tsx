import * as React from "react";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  Slot,
  WithId,
  setDeep,
} from "@measured/puck";
import {
  BackgroundStyle,
  YextField,
  Background,
  backgroundColors,
  EventStruct,
  msg,
  ImageWrapperProps,
  HeadingTextProps,
  BodyTextProps,
  CTAWrapperProps,
  TimestampProps,
  deepMerge,
  ImgSizesByBreakpoint,
  resolveYextEntityField,
  i18nComponentsInstance,
} from "@yext/visual-editor";
import { getDefaultRTF } from "../../../editor/TranslatableRichTextField.tsx";
import { useCardContext } from "../../../hooks/useCardContext.tsx";
import { useGetCardSlots } from "../../../hooks/useGetCardSlots.tsx";
import { getRandomPlaceholderImageObject } from "../../../utils/imagePlaceholders";

export const defaultEventCardSlotData = (id?: string, index?: number) => ({
  type: "EventCard",
  props: {
    ...(id && { id }),
    ...(index !== undefined && { index }),
    styles: {
      backgroundColor: backgroundColors.background1.value,
      truncateDescription: true,
    } satisfies EventCardProps["styles"],
    slots: {
      ImageSlot: [
        {
          type: "ImageSlot",
          props: {
            ...(id && { id: `${id}-image` }),
            data: {
              image: {
                field: "",
                constantValue: getRandomPlaceholderImageObject(),
                constantValueEnabled: true,
              },
            },
            styles: {
              aspectRatio: 1.78,
              width: 640,
            },
            hideWidthProp: true,
          } satisfies ImageWrapperProps,
        },
      ],
      TitleSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            ...(id && { id: `${id}-title` }),
            data: {
              text: {
                field: "",
                constantValue: {
                  en: "Event Title",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              level: 3,
              align: "left",
            },
          } satisfies HeadingTextProps,
        },
      ],
      DateTimeSlot: [
        {
          type: "Timestamp",
          props: {
            ...(id && { id: `${id}-timestamp` }),
            data: {
              date: {
                field: "",
                constantValue: "2022-12-12T14:00:00",
                constantValueEnabled: true,
              },
              endDate: {
                field: "",
                constantValue: "2022-12-12T15:00:00",
                constantValueEnabled: true,
              },
            },
            styles: {
              includeTime: true,
              includeRange: false,
            },
          } satisfies TimestampProps,
        },
      ],
      DescriptionSlot: [
        {
          type: "BodyTextSlot",
          props: {
            ...(id && { id: `${id}-description` }),
            data: {
              text: {
                field: "",
                constantValue: {
                  en: getDefaultRTF(
                    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam."
                  ),
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              variant: "base",
            },
            parentStyles: {
              className: "md:line-clamp-2",
            },
          } satisfies BodyTextProps,
        },
      ],
      CTASlot: [
        {
          type: "CTASlot",
          props: {
            ...(id && { id: `${id}-cta` }),
            data: {
              entityField: {
                field: "",
                constantValue: {
                  label: "Learn More",
                  link: "#",
                  linkType: "URL",
                  ctaType: "textAndLink",
                },
                constantValueEnabled: true,
              },
            },
            styles: {
              variant: "primary",
              presetImage: "app-store",
            },
            eventName: index !== undefined ? `cta${index}` : undefined,
          } satisfies CTAWrapperProps,
        },
      ],
    },
  },
});

export type EventCardProps = {
  /** Styling for all the cards. */
  styles: {
    /** The background color of each event card */
    backgroundColor?: BackgroundStyle;
    /** Whether to truncate the event description text */
    truncateDescription: boolean;
  };
  /** @internal */
  slots: {
    ImageSlot: Slot;
    TitleSlot: Slot;
    DateTimeSlot: Slot;
    DescriptionSlot: Slot;
    CTASlot: Slot;
  };

  /** @internal */
  parentData?: {
    field: string;
    event: EventStruct;
  };

  /** @internal */
  conditionalRender?: {
    image?: boolean;
    title: boolean;
    dateTime: boolean;
    description?: boolean;
    cta?: boolean;
  };

  /** @internal */
  index?: number;
};

const eventCardFields: Fields<EventCardProps> = {
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
      truncateDescription: YextField(
        msg("fields.truncateDescription", "Truncate Description"),
        {
          type: "radio",
          options: [
            { label: msg("fields.options.yes", "Yes"), value: true },
            { label: msg("fields.options.no", "No"), value: false },
          ],
        }
      ),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      ImageSlot: { type: "slot" },
      TitleSlot: { type: "slot" },
      DateTimeSlot: { type: "slot" },
      DescriptionSlot: { type: "slot" },
      CTASlot: { type: "slot" },
    },
    visible: false,
  },
};

const EventCardComponent: PuckComponent<EventCardProps> = (props) => {
  const { styles, slots, puck, conditionalRender } = props;

  const { sharedCardProps, setSharedCardProps } = useCardContext<{
    cardStyles: EventCardProps["styles"];
    slotStyles: Record<string, EventCardProps["styles"]>;
  }>();

  const { slotStyles, getPuck, slotProps } = useGetCardSlots<EventCardProps>(
    props.id
  );

  const showImage = Boolean(conditionalRender?.image || puck.isEditing);
  const showTitle = Boolean(conditionalRender?.title || puck.isEditing);
  const showDateTime = Boolean(conditionalRender?.dateTime || puck.isEditing);
  const showDescription =
    Boolean(conditionalRender?.description) || puck.isEditing;
  const showCTA = Boolean(conditionalRender?.cta || puck.isEditing);

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

    const newSlotData: EventCardProps["slots"] = {
      ImageSlot: [],
      TitleSlot: [],
      DateTimeSlot: [],
      DescriptionSlot: [],
      CTASlot: [],
    };
    Object.entries(slotProps).forEach(([key, value]) => {
      newSlotData[key as keyof EventCardProps["slots"]] = [
        {
          ...deepMerge(
            { props: { styles: { ...sharedCardProps?.slotStyles?.[key] } } },
            value[0]
          ),
        },
      ];
      if (key === "DescriptionSlot") {
        newSlotData.DescriptionSlot[0].props.parentStyles = {
          className: sharedCardProps.cardStyles.truncateDescription
            ? "md:line-clamp-2"
            : undefined,
        };
      }
    });

    // oxlint-disable-next-line no-unused-vars: remove props.puck before dispatching to avoid writing it to the saved data
    const { puck: _, editMode: __, ...otherProps } = props;
    dispatch({
      type: "replace" as const,
      destinationIndex: selector.index,
      destinationZone: selector.zone,
      data: {
        type: "EventCard",
        props: {
          ...otherProps,
          styles: {
            ...otherProps.styles,
            backgroundColor:
              sharedCardProps?.cardStyles.backgroundColor ||
              backgroundColors.background1.value,
            truncateDescription:
              sharedCardProps?.cardStyles.truncateDescription,
          },
          slots: newSlotData,
        } satisfies EventCardProps,
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
      background={styles.backgroundColor}
      className="flex flex-col md:flex-row rounded-lg overflow-hidden md:items-start"
    >
      {showImage && (
        <div className="lg:w-[45%] w-full">
          <slots.ImageSlot style={{ height: "auto" }} allow={[]} />
        </div>
      )}
      <div className="flex flex-col gap-4 p-6 w-full md:w-[55%] justify-between flex-grow">
        <div className="flex flex-col gap-2">
          {showTitle && (
            <slots.TitleSlot style={{ height: "auto" }} allow={[]} />
          )}
          {showDateTime && (
            <slots.DateTimeSlot
              style={{ height: "auto" }}
              allow={[]}
              minEmptyHeight={20}
            />
          )}
          {showDescription && (
            <slots.DescriptionSlot style={{ height: "auto" }} allow={[]} />
          )}
        </div>
        {showCTA && <slots.CTASlot style={{ height: "auto" }} allow={[]} />}
      </div>
    </Background>
  );
};

export const EventCard: ComponentConfig<{ props: EventCardProps }> = {
  label: msg("components.eventCard", "Event Card"),
  fields: eventCardFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
      truncateDescription: true,
    },
    slots: {
      ImageSlot: [],
      TitleSlot: [],
      DateTimeSlot: [],
      DescriptionSlot: [],
      CTASlot: [],
    },
  },
  resolveData: (data, params) => {
    const imageSlotProps = data.props.slots.ImageSlot?.[0]?.props as
      | WithId<ImageWrapperProps>
      | undefined;
    const titleSlotProps = data.props.slots.TitleSlot?.[0]?.props as
      | WithId<HeadingTextProps>
      | undefined;
    const dateTimeSlotProps = data.props.slots.DateTimeSlot?.[0]
      ?.props as WithId<TimestampProps | undefined>;
    const descriptionSlotProps = data.props.slots.DescriptionSlot?.[0]
      ?.props as WithId<BodyTextProps | undefined>;
    const ctaSlotProps = data.props.slots.CTASlot?.[0]?.props as
      | WithId<CTAWrapperProps>
      | undefined;

    const showImage = Boolean(
      imageSlotProps?.parentData
        ? imageSlotProps.parentData.image
        : imageSlotProps &&
            (imageSlotProps?.data.image.field ||
              ("url" in imageSlotProps.data.image.constantValue &&
                imageSlotProps.data.image.constantValue.url) ||
              ("image" in imageSlotProps.data.image.constantValue &&
                imageSlotProps.data.image.constantValue.image.url))
    );
    const showDescription = Boolean(
      descriptionSlotProps &&
        (descriptionSlotProps.parentData
          ? descriptionSlotProps.parentData.richText
          : resolveYextEntityField(
              params.metadata.streamDocument,
              descriptionSlotProps.data.text,
              i18nComponentsInstance.language || "en"
            ))
    );
    const showTitle = Boolean(
      titleSlotProps &&
        (titleSlotProps.parentData
          ? titleSlotProps.parentData.text
          : resolveYextEntityField(
              params.metadata.streamDocument,
              titleSlotProps.data.text,
              i18nComponentsInstance.language || "en"
            ))
    );
    const showDateTime = Boolean(
      dateTimeSlotProps?.parentData?.date || dateTimeSlotProps?.data?.date
    );
    const showCTA = Boolean(
      ctaSlotProps &&
        (ctaSlotProps.parentData
          ? ctaSlotProps.parentData.cta?.label
          : resolveYextEntityField(
              params.metadata.streamDocument,
              ctaSlotProps.data.entityField
            )?.label)
    );

    let updatedData = {
      ...data,
      props: {
        ...data.props,
        conditionalRender: {
          image: showImage,
          title: showTitle,
          dateTime: showDateTime,
          description: showDescription,
          cta: showCTA,
        },
      } satisfies EventCardProps,
    };

    // Set constant values for ImageSlot sizes and className props
    updatedData = setDeep(
      updatedData,
      "props.slots.ImageSlot[0].props.className",
      "max-w-full h-full object-cover"
    );
    updatedData = setDeep(updatedData, "props.slots.ImageSlot[0].props.sizes", {
      base: "calc(100vw - 32px)",
      lg: "calc(maxWidth * 0.45)",
    } satisfies ImgSizesByBreakpoint);

    // Set the CTA's event name
    updatedData = setDeep(
      updatedData,
      "props.slots.CTASlot[0].props.eventName",
      `cta${data.props.index}`
    );

    // Set truncateDescription for the DescriptionSlot
    updatedData = setDeep(
      updatedData,
      "props.slots.DescriptionSlot[0].props.parentStyles.className",
      data.props.styles.truncateDescription ? "md:line-clamp-2" : undefined
    );

    // Set parentData for all slots if parentData is provided
    if (data.props.parentData) {
      const event = data.props.parentData.event;
      const field = data.props.parentData.field;

      updatedData = setDeep(
        updatedData,
        "props.slots.ImageSlot[0].props.parentData",
        {
          field: field,
          image: event.image,
        } satisfies ImageWrapperProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.TitleSlot[0].props.parentData",
        {
          field: field,
          text: event.title as string, // will already be resolved
        } satisfies HeadingTextProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.DateTimeSlot[0].props.parentData",
        {
          field: field,
          date: event.dateTime,
        } satisfies TimestampProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.DescriptionSlot[0].props.parentData",
        {
          field: field,
          richText: event.description,
        } satisfies BodyTextProps["parentData"]
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.CTASlot[0].props.parentData",
        {
          field: field,
          cta: event.cta,
        } satisfies CTAWrapperProps["parentData"]
      );

      return updatedData;
    } else {
      updatedData = setDeep(
        updatedData,
        "props.slots.ImageSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.TitleSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.DateTimeSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.DescriptionSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.CTASlot[0].props.parentData",
        undefined
      );
    }

    return updatedData;
  },
  render: (props) => <EventCardComponent {...props} />,
};
