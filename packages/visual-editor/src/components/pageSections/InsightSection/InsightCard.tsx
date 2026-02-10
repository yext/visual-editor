import * as React from "react";
import {
  BackgroundStyle,
  backgroundColors,
} from "../../../utils/themeConfigOptions.ts";
import { YextField } from "../../../editor/YextField.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { Background } from "../../atoms/background.tsx";
import { CTAWrapperProps } from "../../contentBlocks/CtaWrapper.tsx";
import { BodyTextProps } from "../../contentBlocks/BodyText.tsx";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { ImageWrapperProps } from "../../contentBlocks/image/Image.tsx";
import { InsightStruct, TranslatableRichText } from "../../../types/types.ts";
import { deepMerge } from "../../../utils/themeResolver.ts";
import { getDefaultRTF } from "../../../editor/TranslatableRichTextField.tsx";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
} from "@puckeditor/core";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import { useCardContext } from "../../../hooks/useCardContext.tsx";
import { useGetCardSlots } from "../../../hooks/useGetCardSlots.tsx";
import { getRandomPlaceholderImageObject } from "../../../utils/imagePlaceholders.ts";
import { syncParentStyles } from "../../../utils/cardSlots/syncParentStyles.ts";

const defaultInsight = {
  image: {
    ...getRandomPlaceholderImageObject({ width: 640, height: 360 }),
    width: 640,
    height: 360,
  },
  name: { en: "Article Name", hasLocalizedValue: "true" },
  category: {
    en: getDefaultRTF("Category"),
    hasLocalizedValue: "true",
  },
  description: {
    en: getDefaultRTF(
      "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters"
    ),
    hasLocalizedValue: "true",
  },
  publishTime: "2022-08-02T14:00:00",
  cta: {
    label: { en: "Read More", hasLocalizedValue: "true" },
    link: "#",
    linkType: "URL",
    ctaType: "textAndLink",
  },
} satisfies InsightStruct;

export const defaultInsightCardSlotData = (
  id?: string,
  index?: number,
  backgroundColor?: BackgroundStyle,
  sharedSlotStyles?: Record<string, any>
) => {
  const cardData = {
    type: "InsightCard",
    props: {
      ...(id && { id }),
      styles: {
        backgroundColor: backgroundColor ?? backgroundColors.background1.value,
      } satisfies InsightCardProps["styles"],
      conditionalRender: {
        hasCategory: true,
        hasPublishTime: true,
      },
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
                  },
                  constantValueEnabled: true,
                },
              },
              styles: {
                aspectRatio: 1.78,
                width: 640,
              },
              sizes: {
                base: "calc(100vw - 32px)",
                md: "calc((maxWidth - 32px) / 2)",
                lg: "calc((maxWidth - 32px) / 3)",
              },
            } satisfies ImageWrapperProps,
          },
        ],
        TitleSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  field: "",
                  constantValue: defaultInsight.name,
                  constantValueEnabled: true,
                },
              },
              styles: {
                level: 4,
                align: "left",
              },
            } satisfies HeadingTextProps,
          },
        ],
        CategorySlot: [
          {
            type: "BodyTextSlot",
            props: {
              ...(id && { id: `${id}-category` }),
              data: {
                text: {
                  field: "",
                  constantValue: defaultInsight.category,
                  constantValueEnabled: true,
                },
              },
              styles: {
                variant: "base",
              },
            } satisfies BodyTextProps,
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
                  constantValue: defaultInsight.description,
                  constantValueEnabled: true,
                },
              },
              styles: {
                variant: "base",
              },
            } satisfies BodyTextProps,
          },
        ],
        PublishTimeSlot: [
          {
            type: "Timestamp",
            props: {
              ...(id && { id: `${id}-timestamp` }),
              data: {
                date: {
                  field: "",
                  constantValue: defaultInsight.publishTime,
                  constantValueEnabled: true,
                },
                endDate: {
                  field: "",
                  constantValue: "",
                  constantValueEnabled: true,
                },
              },
              styles: {
                includeTime: false,
                includeRange: false,
              },
            },
          },
        ],
        CTASlot: [
          {
            type: "CTASlot",
            props: {
              ...(id && { id: `${id}-cta` }),
              data: {
                actionType: "link",
                buttonText: { en: "Button", hasLocalizedValue: "true" },
                entityField: {
                  field: "",
                  constantValue: defaultInsight.cta,
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
    } satisfies InsightCardProps,
  };

  Object.entries(cardData.props.slots).forEach(([slotKey, slotArray]) => {
    if (sharedSlotStyles?.[slotKey]) {
      slotArray[0].props.styles = sharedSlotStyles[slotKey];
    }
  });

  return cardData;
};

export type InsightCardProps = {
  /** Styling for all the cards. */
  styles: {
    /** The background color of each insight card */
    backgroundColor?: BackgroundStyle;
  };

  /** @internal */
  slots: {
    ImageSlot: Slot;
    TitleSlot: Slot;
    CategorySlot: Slot;
    DescriptionSlot: Slot;
    PublishTimeSlot: Slot;
    CTASlot: Slot;
  };

  /** @internal */
  parentData?: {
    field: string;
    insight: InsightStruct;
  };

  /** @internal styles from parent component */
  parentStyles?: {
    showImage: boolean;
    showCategory: boolean;
    showPublishTime: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };

  /** @internal */
  conditionalRender?: {
    hasCategory: boolean;
    hasPublishTime: boolean;
  };

  /** @internal */
  index?: number;
};

const insightCardFields: Fields<InsightCardProps> = {
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
      ImageSlot: { type: "slot" },
      TitleSlot: { type: "slot" },
      CategorySlot: { type: "slot" },
      DescriptionSlot: { type: "slot" },
      PublishTimeSlot: { type: "slot" },
      CTASlot: { type: "slot" },
    },
    visible: false,
  },
};

const InsightCardComponent: PuckComponent<InsightCardProps> = (props) => {
  const { styles, slots, puck, conditionalRender, parentStyles } = props;
  const { sharedCardProps, setSharedCardProps } = useCardContext<{
    cardBackground: BackgroundStyle | undefined;
    slotStyles: Record<string, InsightCardProps["styles"]>;
  }>();

  const {
    slotStyles,
    getPuck,
    slotProps: slotsData,
  } = useGetCardSlots<InsightCardProps>(props.id);

  React.useEffect(() => {
    if (!puck.isEditing || !sharedCardProps) {
      return;
    }

    if (
      JSON.stringify(sharedCardProps?.cardBackground) ===
        JSON.stringify(styles.backgroundColor) &&
      JSON.stringify(slotStyles) === JSON.stringify(sharedCardProps?.slotStyles)
    ) {
      return;
    }

    const { dispatch, getSelectorForId } = getPuck!();
    const selector = getSelectorForId(props.id);
    if (!selector || !slotsData) {
      return;
    }

    const newSlotData: InsightCardProps["slots"] = {
      ImageSlot: [],
      TitleSlot: [],
      CategorySlot: [],
      DescriptionSlot: [],
      PublishTimeSlot: [],
      CTASlot: [],
    };
    Object.entries(slotsData).forEach(([key, value]) => {
      newSlotData[key as keyof InsightCardProps["slots"]] = [
        {
          ...deepMerge(
            { props: { styles: { ...sharedCardProps?.slotStyles?.[key] } } },
            value[0]
          ),
        },
      ];
    });

    // oxlint-disable-next-line no-unused-vars: remove props.puck and editMode before dispatching to avoid writing them to the saved data
    const { puck: _, editMode: __, ...otherProps } = props;
    dispatch({
      type: "replace" as const,
      destinationIndex: selector.index,
      destinationZone: selector.zone,
      data: {
        type: "InsightCard",
        props: {
          ...otherProps,
          styles: {
            backgroundColor:
              sharedCardProps.cardBackground || styles.backgroundColor,
          },
          slots: newSlotData,
        },
      },
    });
  }, [sharedCardProps, puck.isEditing]);

  // When the card's shared props or the card's slots' shared props change, update the context
  React.useEffect(() => {
    if (!puck.isEditing || !slotsData) {
      return;
    }

    if (
      JSON.stringify(sharedCardProps?.cardBackground) ===
        JSON.stringify(styles.backgroundColor) &&
      JSON.stringify(sharedCardProps?.slotStyles) === JSON.stringify(slotStyles)
    ) {
      return;
    }

    setSharedCardProps({
      cardBackground: styles.backgroundColor,
      slotStyles: slotStyles,
    });
  }, [styles, slotStyles, puck.isEditing]);

  const mergedStyles = deepMerge(
    { backgroundColor: sharedCardProps?.cardBackground },
    styles
  );

  const isInEditor = puck.isEditing;

  const showCategory =
    parentStyles?.showCategory &&
    (conditionalRender?.hasCategory || isInEditor);
  const showPublishTime =
    parentStyles?.showPublishTime &&
    (conditionalRender?.hasPublishTime || isInEditor);

  return (
    <Background
      className="rounded flex flex-col"
      background={mergedStyles.backgroundColor}
      ref={puck.dragRef}
    >
      {parentStyles?.showImage && (
        <slots.ImageSlot style={{ height: "auto" }} allow={[]} />
      )}
      <div className="flex flex-col gap-4 p-6 flex-grow">
        <div className="flex flex-col gap-2 flex-grow">
          {(showCategory || showPublishTime) && (
            <div className="flex items-center">
              {showCategory && (
                <div className="flex items-center">
                  <slots.CategorySlot style={{ height: "auto" }} allow={[]} />
                </div>
              )}
              {showCategory && showPublishTime && (
                <span className="px-3">|</span>
              )}
              {showPublishTime && (
                <div className="flex items-center">
                  <slots.PublishTimeSlot
                    style={{ height: "auto" }}
                    allow={[]}
                  />
                </div>
              )}
            </div>
          )}
          <slots.TitleSlot style={{ height: "auto" }} allow={[]} />
          {parentStyles?.showDescription && (
            <slots.DescriptionSlot style={{ height: "auto" }} allow={[]} />
          )}
        </div>
        <div className="mt-auto">
          {parentStyles?.showCTA && (
            <slots.CTASlot style={{ height: "auto" }} allow={[]} />
          )}
        </div>
      </div>
    </Background>
  );
};

export const InsightCard: ComponentConfig<{ props: InsightCardProps }> = {
  label: msg("slots.insightCard", "Insight Card"),
  fields: insightCardFields,
  inline: true,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    slots: {
      ImageSlot: [],
      TitleSlot: [],
      CategorySlot: [],
      DescriptionSlot: [],
      PublishTimeSlot: [],
      CTASlot: [],
    },
  },
  resolveData: (data, params) => {
    const streamDocument = params.metadata?.streamDocument;
    const locale = streamDocument?.locale ?? "en";

    if (!streamDocument || !locale) {
      return data;
    }

    let updatedData = data;

    if (updatedData.props.parentData) {
      const { field, insight } = updatedData.props.parentData;

      updatedData = setDeep(
        updatedData,
        "props.slots.ImageSlot[0].props.parentData",
        {
          field: `${field}.image`,
          image: insight.image,
        }
      );

      updatedData = setDeep(
        updatedData,
        "props.slots.TitleSlot[0].props.parentData",
        {
          field: `${field}.name`,
          text: insight.name,
        }
      );

      updatedData = setDeep(
        updatedData,
        "props.slots.CategorySlot[0].props.parentData",
        {
          field: `${field}.category`,
          richText: insight.category,
        }
      );

      updatedData = setDeep(
        updatedData,
        "props.slots.DescriptionSlot[0].props.parentData",
        {
          field: `${field}.description`,
          richText: insight.description,
        }
      );

      updatedData = setDeep(
        updatedData,
        "props.slots.PublishTimeSlot[0].props.parentData",
        {
          field: `${field}.publishTime`,
          date: insight.publishTime || undefined,
        }
      );

      updatedData = setDeep(
        updatedData,
        "props.slots.CTASlot[0].props.parentData",
        {
          field: `${field}.cta`,
          cta: insight.cta,
        }
      );

      const category = resolveComponentData(
        insight.category as TranslatableRichText,
        locale,
        streamDocument
      );

      updatedData = {
        ...updatedData,
        props: {
          ...updatedData.props,
          conditionalRender: {
            hasCategory: !!category,
            hasPublishTime: !!insight.publishTime,
          },
        },
      };
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
        "props.slots.CategorySlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.DescriptionSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.PublishTimeSlot[0].props.parentData",
        undefined
      );
      updatedData = setDeep(
        updatedData,
        "props.slots.CTASlot[0].props.parentData",
        undefined
      );

      const category = resolveComponentData(
        updatedData.props.slots.CategorySlot[0]?.props.data
          .text as YextEntityField<TranslatableRichText>,
        locale,
        streamDocument
      );

      const publishTime = resolveComponentData(
        updatedData.props.slots.PublishTimeSlot[0]?.props.data.date,
        locale,
        streamDocument
      );

      updatedData = {
        ...updatedData,
        props: {
          ...updatedData.props,
          conditionalRender: {
            hasCategory: !!category,
            hasPublishTime: !!publishTime,
          },
        },
      };
    }

    updatedData = syncParentStyles(params, updatedData, [
      "showImage",
      "showCategory",
      "showPublishTime",
      "showDescription",
      "showCTA",
    ]);

    return updatedData;
  },
  render: (props) => <InsightCardComponent {...props} />,
};
