import * as React from "react";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  Slot,
  WithId,
  setDeep,
} from "@puckeditor/core";
import {
  BackgroundStyle,
  backgroundColors,
} from "../../../utils/themeConfigOptions.ts";
import { YextField } from "../../../editor/YextField.tsx";
import { Background } from "../../atoms/background.tsx";
import { EventStruct } from "../../../types/types.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { ImageWrapperProps } from "../../contentBlocks/image/Image.tsx";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { BodyTextProps } from "../../contentBlocks/BodyText.tsx";
import { CTAWrapperProps } from "../../contentBlocks/CtaWrapper.tsx";
import { TimestampProps } from "../../contentBlocks/Timestamp.tsx";
import { deepMerge } from "../../../utils/themeResolver.ts";
import { ImgSizesByBreakpoint } from "../../atoms/image.tsx";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import { useCardContext } from "../../../hooks/useCardContext.tsx";
import { useGetCardSlots } from "../../../hooks/useGetCardSlots.tsx";
import { getRandomPlaceholderImageObject } from "../../../utils/imagePlaceholders.ts";
import { syncParentStyles } from "../../../utils/cardSlots/syncParentStyles.ts";
import { defaultText } from "../../../utils/i18n/defaultContent.ts";
import { getDefaultRTF } from "../../../editor/TranslatableRichTextField.tsx";

const defaultEvent = {
  image: {
    url: "https://placehold.co/640x360",
    height: 360,
    width: 640,
  },
  title: defaultText("componentDefaults.eventTitle", "Event Title"),
  dateTime: "2022-12-12T14:00:00",
  description: getDefaultRTF(
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
  ),
  cta: {
    label: defaultText("componentDefaults.learnMore", "Learn More"),
    link: "#",
    linkType: "URL",
    ctaType: "textAndLink",
  },
} satisfies EventStruct;

export const defaultEventCardSlotData = (
  id?: string,
  index?: number,
  backgroundColor?: BackgroundStyle,
  truncateDescription?: boolean,
  sharedSlotStyles?: Record<string, any>
) => {
  const cardData = {
    type: "EventCard",
    props: {
      ...(id && { id }),
      ...(index !== undefined && { index }),
      styles: {
        backgroundColor: backgroundColor ?? backgroundColors.background1.value,
        truncateDescription: truncateDescription ?? true,
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
                  constantValue: {
                    ...getRandomPlaceholderImageObject({
                      width: 640,
                      height: 360,
                    }),
                    width: 640,
                    height: 360,
                    alternateText: defaultText(
                      "componentDefaults.eventImage",
                      "Event Image"
                    ),
                  },
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
                  constantValue: defaultEvent.title,
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
                  constantValue: defaultEvent.dateTime,
                  constantValueEnabled: true,
                },
                endDate: {
                  field: "",
                  constantValue: "",
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
                  constantValue: defaultEvent.description,
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
                actionType: "link",
                buttonText: defaultText("componentDefaults.button", "Button"),
                entityField: {
                  field: "",
                  constantValue: defaultEvent.cta,
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
  };

  Object.entries(cardData.props.slots).forEach(([slotKey, slotArray]) => {
    if (sharedSlotStyles?.[slotKey]) {
      slotArray[0].props.styles = sharedSlotStyles[slotKey];
    }
  });

  return cardData;
};

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

  /** @internal data from parent component */
  parentData?: {
    field: string;
    event: EventStruct;
  };

  /** @internal styles from parent component */
  parentStyles?: {
    showImage: boolean;
    showDateTime: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };

  /** @internal*/
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
  const { styles, slots, puck, conditionalRender, parentStyles } = props;

  const { sharedCardProps, setSharedCardProps } = useCardContext<{
    cardStyles: EventCardProps["styles"];
    slotStyles: Record<string, EventCardProps["styles"]>;
  }>();

  const { slotStyles, getPuck, slotProps } = useGetCardSlots<EventCardProps>(
    props.id
  );

  const showImage =
    parentStyles?.showImage &&
    Boolean(conditionalRender?.image || puck.isEditing);
  const showTitle = Boolean(conditionalRender?.title || puck.isEditing);
  const showDateTime =
    parentStyles?.showDateTime &&
    Boolean(conditionalRender?.dateTime || puck.isEditing);
  const showDescription =
    parentStyles?.showDescription &&
    (Boolean(conditionalRender?.description) || puck.isEditing);
  const showCTA =
    parentStyles?.showCTA && Boolean(conditionalRender?.cta || puck.isEditing);

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
          className:
            sharedCardProps.cardStyles.truncateDescription !== false
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

    const resolvedImage = imageSlotProps?.parentData
      ? imageSlotProps.parentData.image
      : imageSlotProps
        ? resolveYextEntityField(
            params.metadata.streamDocument,
            imageSlotProps.data.image,
            i18nComponentsInstance.language || "en"
          )
        : undefined;

    const showImage = Boolean(
      (resolvedImage as any)?.url ||
      (resolvedImage as any)?.image?.url ||
      ((resolvedImage as any)?.hasLocalizedValue &&
        (resolvedImage as any)?.[i18nComponentsInstance.language || "en"]?.url)
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
      dateTimeSlotProps?.parentData?.date?.trim() ||
      resolveYextEntityField(
        params.metadata.streamDocument,
        dateTimeSlotProps.data.date,
        i18nComponentsInstance.language || "en"
      )?.trim()
    );
    const showCTA = Boolean(
      ctaSlotProps &&
      (ctaSlotProps.parentData
        ? ctaSlotProps.parentData.cta?.label
        : resolveComponentData(
            ctaSlotProps.data.entityField,
            i18nComponentsInstance.language || "en",
            params.metadata.streamDocument
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
      data.props.styles.truncateDescription !== false
        ? "md:line-clamp-2"
        : undefined
    );

    updatedData = syncParentStyles(params, updatedData, [
      "showImage",
      "showDateTime",
      "showDescription",
      "showCTA",
    ]);

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
