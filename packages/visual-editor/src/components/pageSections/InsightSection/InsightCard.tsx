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
import { useCardContext } from "../../../hooks/useCardContext.tsx";

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
  const { slots, styles } = props;
  const { sharedCardProps, setSharedCardProps } = useCardContext<{
    backgroundColor?: BackgroundStyle;
  }>();

  React.useEffect(() => {
    setSharedCardProps(styles);
  }, [styles, setSharedCardProps]);

  const mergedStyles = deepMerge(sharedCardProps || {}, styles);

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
  defaultProps: defaultInsightCardSlotData().props,
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
        text: insight.category,
      };

      data.props.slots.DescriptionSlot[0].props.parentData = {
        field: `${field}.description`,
        text: insight.description,
      };

      data.props.slots.PublishTimeSlot[0].props.parentData = {
        field: `${field}.publishTime`,
        timestamp: insight.publishTime,
      };

      data.props.slots.CTASlot[0].props.parentData = {
        field: `${field}.cta`,
        entityField: insight.cta,
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
