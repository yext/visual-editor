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
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  Slot,
  createUsePuck,
  useGetPuck,
} from "@measured/puck";
import { useCardContext } from "../../../hooks/useCardContext.tsx";

const usePuck = createUsePuck();

export const defaultInsightCardSlotData = (id?: string) => {
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
            type: "BodyTextSlot",
            props: {
              data: {
                text: {
                  field: "",
                  constantValue: {
                    en: getDefaultRTF("2022-08-02"),
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
        CTASlot: [
          {
            type: "CTASlot",
            props: {
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
  const { styles, slots } = props;
  const { sharedCardProps, setSharedCardProps } = useCardContext<{
    cardBackground: BackgroundStyle | undefined;
    slotStyles: Record<string, InsightCardProps["styles"]>;
  }>();

  let slotsData: InsightCardProps["slots"] | undefined = undefined;
  let getPuck: ReturnType<typeof useGetPuck> | undefined = undefined;
  try {
    slotsData = usePuck((s) => s.getItemById(props.id)?.props.slots);
    getPuck = useGetPuck();
  } catch {}

  // Process the slot props into just the shared styles
  const slotStyles = React.useMemo(() => {
    const slotNameToStyles = {} as Record<string, any>;
    Object.entries(slotsData || {}).forEach(([key, value]) => {
      slotNameToStyles[key] = value[0].props.styles || {};
    });
    return slotNameToStyles;
  }, [slotsData]);

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

  return (
    <Background
      className="rounded flex flex-col"
      background={mergedStyles.backgroundColor}
    >
      <div className="flex flex-col gap-4 p-6 h-full">
        <slots.ImageSlot style={{ height: "auto" }} allow={[]} />
        <div className="flex flex-col gap-2 flex-grow">
          <slots.TitleSlot style={{ height: "auto" }} allow={[]} />
          <slots.CategorySlot style={{ height: "auto" }} allow={[]} />
          <slots.PublishTimeSlot style={{ height: "auto" }} allow={[]} />
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
        text: insight.publishTime
          ? getDefaultRTF(insight.publishTime)
          : undefined,
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
