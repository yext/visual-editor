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
  TestimonialStruct,
  msg,
  HeadingTextProps,
  BodyTextProps,
  deepMerge,
  resolveYextEntityField,
  i18nComponentsInstance,
  getDefaultRTF,
} from "@yext/visual-editor";
import { useCardContext } from "../../../hooks/useCardContext.tsx";
import { useGetCardSlots } from "../../../hooks/useGetCardSlots.tsx";
import { defaultTestimonial } from "../../../internal/puck/constant-value-fields/TestimonialSection.tsx";

export const defaultTestimonialCardSlotData = (
  id?: string,
  index?: number
) => ({
  type: "TestimonialCard",
  props: {
    ...(id && { id }),
    ...(index !== undefined && { index }),
    styles: {
      backgroundColor: backgroundColors.background1.value,
    } satisfies TestimonialCardProps["styles"],
    slots: {
      DescriptionSlot: [
        {
          type: "BodyTextSlot",
          props: {
            ...(id && { id: `${id}-description` }),
            data: {
              text: {
                field: "",
                constantValue: defaultTestimonial.description || {
                  en: getDefaultRTF(
                    "This is an amazing product! Highly recommend to everyone."
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
      ContributorNameSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            ...(id && { id: `${id}-contributorName` }),
            data: {
              text: {
                field: "",
                constantValue: defaultTestimonial.contributorName || {
                  en: "John Doe",
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
      ContributionDateSlot: [
        {
          type: "Timestamp",
          props: {
            ...(id && { id: `${id}-contributionDate` }),
            data: {
              date: {
                field: "",
                constantValue:
                  defaultTestimonial.contributionDate || "2024-01-01",
                constantValueEnabled: true,
              },
            },
            styles: {
              option: "DATE",
              hideTimeZone: true,
            },
          },
        },
      ],
    },
  },
});

export type TestimonialCardProps = {
  /** Styling for all the cards. */
  styles: {
    /** The background color of each testimonial card */
    backgroundColor?: BackgroundStyle;
  };
  /** @internal */
  slots: {
    DescriptionSlot: Slot;
    ContributorNameSlot: Slot;
    ContributionDateSlot: Slot;
  };

  /** @internal */
  parentData?: {
    field: string;
    testimonial: TestimonialStruct;
  };

  /** @internal */
  conditionalRender?: {
    description: boolean;
    contributorName: boolean;
    contributionDate?: boolean;
  };

  /** @internal */
  index?: number;
};

const testimonialCardFields: Fields<TestimonialCardProps> = {
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
      DescriptionSlot: { type: "slot" },
      ContributorNameSlot: { type: "slot" },
      ContributionDateSlot: { type: "slot" },
    },
    visible: false,
  },
};

const TestimonialCardComponent: PuckComponent<TestimonialCardProps> = (
  props
) => {
  const { styles, slots, puck, conditionalRender } = props;

  const { sharedCardProps, setSharedCardProps } = useCardContext<{
    cardStyles: TestimonialCardProps["styles"];
    slotStyles: Record<string, TestimonialCardProps["styles"]>;
  }>();

  const { slotStyles, getPuck, slotProps } =
    useGetCardSlots<TestimonialCardProps>(props.id);

  const showDescription = Boolean(
    conditionalRender?.description || puck.isEditing
  );
  const showContributorName = Boolean(
    conditionalRender?.contributorName || puck.isEditing
  );
  const showContributionDate = Boolean(
    conditionalRender?.contributionDate || puck.isEditing
  );

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

    const newSlotData: TestimonialCardProps["slots"] = {
      DescriptionSlot: [],
      ContributorNameSlot: [],
      ContributionDateSlot: [],
    };
    Object.entries(slotProps).forEach(([key, value]) => {
      newSlotData[key as keyof TestimonialCardProps["slots"]] = [
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
        type: "TestimonialCard",
        props: {
          ...otherProps,
          styles: {
            ...otherProps.styles,
            backgroundColor:
              sharedCardProps?.cardStyles.backgroundColor ||
              backgroundColors.background1.value,
          },
          slots: newSlotData,
        } satisfies TestimonialCardProps,
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
    <div className="flex flex-col rounded-lg overflow-hidden border bg-white h-full">
      <Background
        background={backgroundColors.background1.value}
        className="p-8 grow"
      >
        {showDescription && (
          <slots.DescriptionSlot style={{ height: "auto" }} allow={[]} />
        )}
      </Background>
      <Background background={styles.backgroundColor} className="p-8">
        <div className="flex flex-col gap-1">
          {showContributorName && (
            <slots.ContributorNameSlot style={{ height: "auto" }} allow={[]} />
          )}
          {showContributionDate && (
            <slots.ContributionDateSlot style={{ height: "auto" }} allow={[]} />
          )}
        </div>
      </Background>
    </div>
  );
};

export const TestimonialCard: ComponentConfig<{ props: TestimonialCardProps }> =
  {
    label: msg("components.testimonialCard", "Testimonial Card"),
    fields: testimonialCardFields,
    defaultProps: {
      styles: {
        backgroundColor: backgroundColors.background1.value,
      },
      slots: {
        DescriptionSlot: [],
        ContributorNameSlot: [],
        ContributionDateSlot: [],
      },
    },
    resolveData: (data, params) => {
      // Check card-level parentData first for entity data
      const cardParentData = data.props.parentData;
      const testimonial = cardParentData?.testimonial;

      const descriptionSlotProps = data.props.slots.DescriptionSlot?.[0]
        ?.props as WithId<BodyTextProps> | undefined;
      const contributorNameSlotProps = data.props.slots.ContributorNameSlot?.[0]
        ?.props as WithId<HeadingTextProps> | undefined;
      const contributionDateSlotProps = data.props.slots
        .ContributionDateSlot?.[0]?.props as WithId<any> | undefined;

      const showDescription = Boolean(
        testimonial?.description ||
          descriptionSlotProps?.parentData?.richText ||
          (descriptionSlotProps &&
            resolveYextEntityField(
              params.metadata.streamDocument,
              descriptionSlotProps.data.text,
              i18nComponentsInstance.language || "en"
            ))
      );
      const showContributorName = Boolean(
        testimonial?.contributorName ||
          contributorNameSlotProps?.parentData?.text ||
          (contributorNameSlotProps &&
            resolveYextEntityField(
              params.metadata.streamDocument,
              contributorNameSlotProps.data.text,
              i18nComponentsInstance.language || "en"
            ))
      );
      const showContributionDate = Boolean(
        testimonial?.contributionDate ||
          contributionDateSlotProps?.parentData?.date ||
          contributionDateSlotProps?.data?.date?.constantValue ||
          contributionDateSlotProps?.data?.date?.field
      );

      let updatedData = {
        ...data,
        props: {
          ...data.props,
          conditionalRender: {
            description: showDescription,
            contributorName: showContributorName,
            contributionDate: showContributionDate,
          },
        } satisfies TestimonialCardProps,
      };

      // Set parentData for all slots if parentData is provided
      if (data.props.parentData) {
        const testimonial = data.props.parentData.testimonial;
        const field = data.props.parentData.field;

        updatedData = setDeep(
          updatedData,
          "props.slots.DescriptionSlot[0].props.parentData",
          {
            field: field,
            richText: testimonial.description,
          } satisfies BodyTextProps["parentData"]
        );
        updatedData = setDeep(
          updatedData,
          "props.slots.ContributorNameSlot[0].props.parentData",
          {
            field: field,
            text: testimonial.contributorName as string, // will already be resolved
          } satisfies HeadingTextProps["parentData"]
        );
        updatedData = setDeep(
          updatedData,
          "props.slots.ContributionDateSlot[0].props.parentData",
          {
            field: field,
            date: testimonial.contributionDate,
          }
        );

        return updatedData;
      } else {
        updatedData = setDeep(
          updatedData,
          "props.slots.DescriptionSlot[0].props.parentData",
          undefined
        );
        updatedData = setDeep(
          updatedData,
          "props.slots.ContributorNameSlot[0].props.parentData",
          undefined
        );
        updatedData = setDeep(
          updatedData,
          "props.slots.ContributionDateSlot[0].props.parentData",
          undefined
        );
      }

      return updatedData;
    },
    render: (props) => <TestimonialCardComponent {...props} />,
  };
