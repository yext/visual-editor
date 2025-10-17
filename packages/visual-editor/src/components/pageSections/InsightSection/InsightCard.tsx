import * as React from "react";
import {
  BackgroundStyle,
  YextField,
  backgroundColors,
  msg,
  Background,
  CTAWrapperProps,
  BodyTextProps,
  HeadingTextProps,
  ImageWrapperProps,
  InsightStruct,
  deepMerge,
  getDefaultRTF,
} from "@yext/visual-editor";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import { useTranslation } from "react-i18next";
import { getDisplayValue } from "../../../utils/resolveComponentData.tsx";
import { useCardContext } from "../../../hooks/useCardContext.tsx";
import { useGetCardSlots } from "../../../hooks/useGetCardSlots.tsx";

export const defaultInsightCardSlotData = (id?: string, index?: number) => {
  return {
    type: "InsightCard",
    props: {
      ...(id && { id }),
      styles: {
        backgroundColor: backgroundColors.background1.value,
      } satisfies InsightCardProps["styles"],
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
                    url: "https://placehold.co/640x360",
                    height: 360,
                    width: 640,
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
                  constantValue: {
                    en: "Article Name",
                    hasLocalizedValue: "true",
                  },
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
                  constantValue: {
                    en: getDefaultRTF("Category"),
                    hasLocalizedValue: "true",
                  },
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
                  constantValue: {
                    en: getDefaultRTF(
                      "Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo.Lorem ipsum dolor sit amet, consectetur adipiscing. Maecenas finibus placerat justo. 300 characters"
                    ),
                    hasLocalizedValue: "true",
                  },
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
                  constantValue: "2022-08-02T14:00:00",
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
                entityField: {
                  field: "",
                  constantValue: {
                    label: "Read More",
                    link: "#",
                    linkType: "URL",
                    ctaType: "textAndLink",
                  },
                  constantValueEnabled: true,
                },
              },
              styles: { variant: "primary" },
              eventName: index !== undefined ? `cta${index}` : undefined,
            } satisfies CTAWrapperProps,
          },
        ],
      },
    } satisfies InsightCardProps,
  };
};

export type InsightCardProps = {
  styles: {
    backgroundColor?: BackgroundStyle;
  };
  slots: {
    ImageSlot: Slot;
    TitleSlot: Slot;
    CategorySlot: Slot;
    DescriptionSlot: Slot;
    PublishTimeSlot: Slot;
    CTASlot: Slot;
  };
  parentData?: {
    field: string;
    insight: InsightStruct;
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

// Helper component to wrap slots and show separator only if both have content
const SlotsWithSeparator: React.FC<{
  categorySlot: React.ReactNode;
  dateSlot: React.ReactNode;
}> = ({ categorySlot, dateSlot }) => {
  const categoryRef = React.useRef<HTMLDivElement>(null);
  const dateRef = React.useRef<HTMLDivElement>(null);
  const [showSeparator, setShowSeparator] = React.useState(false);

  React.useEffect(() => {
    // Check if both slots have rendered content
    const categoryHasContent =
      categoryRef.current && categoryRef.current.textContent?.trim() !== "";
    const dateHasContent =
      dateRef.current && dateRef.current.textContent?.trim() !== "";
    setShowSeparator(Boolean(categoryHasContent && dateHasContent));
  });

  return (
    <div className="flex items-center">
      <div ref={categoryRef} className="flex items-center">
        {categorySlot}
      </div>
      {showSeparator && <span className="px-3">|</span>}
      <div ref={dateRef} className="flex items-center">
        {dateSlot}
      </div>
    </div>
  );
};

const InsightCardComponent: PuckComponent<InsightCardProps> = (props) => {
  const { styles, slots } = props;
  const { i18n } = useTranslation();
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
    if (!props.puck.isEditing || !sharedCardProps) {
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
  }, [
    sharedCardProps,
    styles.backgroundColor,
    slotStyles,
    props.puck.isEditing,
    getPuck,
    props.id,
    slotsData,
    props,
  ]);

  // When the card's shared props or the card's slots' shared props change, update the context
  React.useEffect(() => {
    if (!props.puck.isEditing || !slotsData) {
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
  }, [styles, slotStyles]);

  const mergedStyles = deepMerge(
    { backgroundColor: sharedCardProps?.cardBackground },
    styles
  );

  const getCategoryValue = () => {
    // If not in editor (slotsData unavailable), assume slot should be shown
    // and let the BodyText component handle its own empty state
    if (!slotsData) {
      return true;
    }

    const slot = slotsData?.CategorySlot?.[0];
    if (!slot) {
      return false;
    }

    // Check parent data (from entity)
    if (slot.props?.parentData?.richText) {
      const displayValue = getDisplayValue(
        slot.props.parentData.richText,
        i18n.language
      );
      return displayValue.trim() !== "";
    }

    // Check constant value (can be string or object with localized values)
    const constantValue = slot.props?.data?.text?.constantValue;
    if (constantValue) {
      const displayValue = getDisplayValue(constantValue, i18n.language);
      return displayValue.trim() !== "";
    }

    return false;
  };

  const getPublishTimeValue = () => {
    // If not in editor (slotsData unavailable), assume slot should be shown
    // and let the Timestamp component handle its own empty state
    if (!slotsData) {
      return "placeholder"; // Return non-empty value to show the slot container
    }

    const slot = slotsData?.PublishTimeSlot?.[0];
    if (!slot) return "";

    // Check parent data (from entity)
    if (slot.props?.parentData?.date) {
      return slot.props.parentData.date;
    }

    // Check constant value or field
    return (
      slot.props?.data?.date?.constantValue ||
      slot.props?.data?.date?.field ||
      ""
    );
  };

  const hasCategory = getCategoryValue();
  const hasPublishTime = Boolean(getPublishTimeValue());

  // When not in editor (slotsData unavailable), we can't determine if slots will render content
  // before they render, so we use a dynamic component that checks after render
  const isInEditor = props.puck.isEditing;
  const canDetermineSlotContent = Boolean(slotsData);

  return (
    <Background
      className="rounded flex flex-col"
      background={mergedStyles.backgroundColor}
    >
      <slots.ImageSlot style={{ height: "auto" }} allow={[]} />
      <div className="flex flex-col gap-4 p-6 flex-grow">
        <div className="flex flex-col gap-2 flex-grow">
          {canDetermineSlotContent ? (
            // In editor: use conditional rendering with separator based on slot state
            (hasCategory || hasPublishTime || isInEditor) && (
              <div className="flex items-center">
                {(hasCategory || isInEditor) && (
                  <div className="flex items-center">
                    <slots.CategorySlot style={{ height: "auto" }} allow={[]} />
                  </div>
                )}
                {hasCategory && hasPublishTime && (
                  <span className="px-3">|</span>
                )}
                {(hasPublishTime || isInEditor) && (
                  <div className="flex items-center">
                    <slots.PublishTimeSlot
                      style={{ height: "auto" }}
                      allow={[]}
                    />
                  </div>
                )}
              </div>
            )
          ) : (
            // On live page/tests: use dynamic separator component that checks rendered content
            <SlotsWithSeparator
              categorySlot={
                <slots.CategorySlot style={{ height: "auto" }} allow={[]} />
              }
              dateSlot={
                <slots.PublishTimeSlot style={{ height: "auto" }} allow={[]} />
              }
            />
          )}
          <slots.TitleSlot style={{ height: "auto" }} allow={[]} />
          <slots.DescriptionSlot style={{ height: "auto" }} allow={[]} />
        </div>
        <div className="mt-auto">
          <slots.CTASlot style={{ height: "auto" }} allow={[]} />
        </div>
      </div>
    </Background>
  );
};

export const InsightCard: ComponentConfig<{ props: InsightCardProps }> = {
  label: msg("slots.insightCard", "Insight Card"),
  fields: insightCardFields,
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
  resolveData: (data) => {
    if (data.props.parentData) {
      const { field, insight } = data.props.parentData;

      data.props.slots.ImageSlot[0].props.parentData = {
        field: `${field}.image`,
        image: insight.image,
      };

      data.props.slots.TitleSlot[0].props.parentData = {
        field: `${field}.name`,
        text: insight.name,
      };

      data.props.slots.CategorySlot[0].props.parentData = {
        field: `${field}.category`,
        richText: insight.category,
      };

      data.props.slots.DescriptionSlot[0].props.parentData = {
        field: `${field}.description`,
        richText: insight.description,
      };

      data.props.slots.PublishTimeSlot[0].props.parentData = {
        field: `${field}.publishTime`,
        date: insight.publishTime || undefined,
      };

      data.props.slots.CTASlot[0].props.parentData = {
        field: `${field}.cta`,
        cta: insight.cta,
      };
    } else {
      data.props.slots.ImageSlot[0].props.parentData = undefined;
      data.props.slots.TitleSlot[0].props.parentData = undefined;
      data.props.slots.CategorySlot[0].props.parentData = undefined;
      data.props.slots.DescriptionSlot[0].props.parentData = undefined;
      data.props.slots.PublishTimeSlot[0].props.parentData = undefined;
      data.props.slots.CTASlot[0].props.parentData = undefined;
    }

    return data;
  },
  render: (props) => <InsightCardComponent {...props} />,
};
