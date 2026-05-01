import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { TestimonialSectionType } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  cardWrapperFields,
  CardWrapperType,
} from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import {
  defaultTestimonialCardSlotData,
  TestimonialCardProps,
} from "./TestimonialCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { YextComponentConfig } from "../../../fields/fields.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { resolveMappedListWrapperData } from "../../../utils/cardSlots/mappedListWrapper.ts";

export type TestimonialCardsWrapperProps =
  CardWrapperType<TestimonialSectionType> & {
    styles: {
      /**
       * Whether to show the name slot in the testimonial cards.
       * @defaultValue true
       */
      showName: boolean;

      /**
       * Whether to show the date slot in the testimonial cards.
       * @defaultValue true
       */
      showDate: boolean;
    };
  };

const testimonialCardsWrapperFields = {
  ...cardWrapperFields<TestimonialCardsWrapperProps>(
    msg("components.testimonial", "Testimonial"),
    ComponentFields.TestimonialSection.type
  ),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      showName: {
        label: msg("fields.showName", "Show Name"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showDate: {
        label: msg("fields.showDate", "Show Date"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
    },
  }),
};

const TestimonialCardsWrapperComponent: PuckComponent<
  TestimonialCardsWrapperProps
> = (props) => {
  const { slots } = props;

  return (
    <CardContextProvider>
      <slots.CardSlot
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center"
        allow={[]}
      />
    </CardContextProvider>
  );
};

export const TestimonialCardsWrapper: YextComponentConfig<TestimonialCardsWrapperProps> =
  {
    label: msg("components.testimonialCardsWrapper", "Testimonial Cards"),
    fields: testimonialCardsWrapperFields,
    defaultProps: {
      data: {
        field: "",
        constantValueEnabled: true,
        constantValue: [],
      },
      slots: {
        CardSlot: [],
      },
      styles: {
        showName: true,
        showDate: true,
      },
    },
    resolveData: (data, params) => {
      return resolveMappedListWrapperData<
        TestimonialCardsWrapperProps,
        TestimonialCardProps,
        never,
        TestimonialSectionType["testimonials"][number],
        {
          backgroundColor?: TestimonialCardProps["styles"]["backgroundColor"];
          slotStyles?: Record<string, any>;
        }
      >({
        data: data as ComponentData<TestimonialCardsWrapperProps>,
        streamDocument: params.metadata.streamDocument ?? {},
        listFieldName: "testimonials",
        cardIdPrefix: "TestimonialCard",
        getSharedCardProps: (card) =>
          !card
            ? undefined
            : {
                backgroundColor: card.props.styles.backgroundColor,
                slotStyles: gatherSlotStyles(card.props.slots),
              },
        createCard: (id, index, sharedCardProps) =>
          defaultTestimonialCardSlotData(
            id,
            index,
            sharedCardProps?.backgroundColor,
            sharedCardProps?.slotStyles
          ) as ComponentData<TestimonialCardProps>,
        decorateMappedItemCard: (card, _item, _index) => card,
        decorateSectionItemCard: (card, testimonial, index) =>
          setDeep(setDeep(card, "props.index", index), "props.parentData", {
            field: data.props.data.field,
            testimonial,
          } satisfies TestimonialCardProps["parentData"]),
        fallbackToIndex: true,
      });
    },
    render: (props) => <TestimonialCardsWrapperComponent {...props} />,
  };
