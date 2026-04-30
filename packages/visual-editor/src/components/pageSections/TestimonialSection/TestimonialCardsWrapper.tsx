import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { TestimonialSectionType } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
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
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";
import { syncManualListCards } from "../../../utils/cardSlots/mappedListWrapper.ts";

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
      const streamDocument = params.metadata.streamDocument;
      const sharedCardProps =
        data.props.slots.CardSlot.length === 0
          ? undefined
          : {
              backgroundColor:
                data.props.slots.CardSlot[0].props.styles.backgroundColor,
              slotStyles: gatherSlotStyles(
                data.props.slots.CardSlot[0].props.slots
              ),
            };

      if (!data?.props?.data) {
        return data;
      }

      if (!data.props.data.constantValueEnabled && data.props.data.field) {
        const resolvedTestimonials = resolveYextEntityField<
          TestimonialSectionType | { testimonials: undefined }
        >(
          streamDocument,
          {
            ...data.props.data,
            constantValue: { testimonials: undefined },
          },
          i18nComponentsInstance.language || "en"
        )?.testimonials;

        if (!resolvedTestimonials?.length) {
          return setDeep(data, "props.slots.CardSlot", []);
        }

        return setDeep(
          data,
          "props.slots.CardSlot",
          buildListSectionCards<
            TestimonialCardProps,
            TestimonialSectionType["testimonials"][number]
          >({
            currentCards: data.props.slots
              .CardSlot as ComponentData<TestimonialCardProps>[],
            createCard: () =>
              defaultTestimonialCardSlotData(
                `TestimonialCard-${crypto.randomUUID()}`,
                undefined,
                sharedCardProps?.backgroundColor,
                sharedCardProps?.slotStyles
              ) as ComponentData<TestimonialCardProps>,
            decorateCard: (card, testimonial, index) =>
              setDeep(setDeep(card, "props.index", index), "props.parentData", {
                field: data.props.data.field,
                testimonial,
              } satisfies TestimonialCardProps["parentData"]),
            items: resolvedTestimonials,
          })
        );
      } else {
        if (!Array.isArray(data.props.data.constantValue)) {
          return setDeep(data, "props.data.constantValue", []);
        }

        const syncedCards = syncManualListCards<TestimonialCardProps>({
          currentCards: data.props.slots
            .CardSlot as ComponentData<TestimonialCardProps>[],
          constantValue: data.props.data.constantValue,
          createId: () => `TestimonialCard-${crypto.randomUUID()}`,
          createCard: (id, index) =>
            defaultTestimonialCardSlotData(
              id,
              index,
              sharedCardProps?.backgroundColor,
              sharedCardProps?.slotStyles
            ) as ComponentData<TestimonialCardProps>,
          fallbackToIndex: true,
          rewriteChildSlotIds: (card, newId) => {
            Object.entries(card.props.slots).forEach(([slotKey, slotArray]) => {
              slotArray[0].props.id = `${newId}-${slotKey}`;
            });
          },
        });
        return setDeep(
          setDeep(data, "props.slots.CardSlot", syncedCards.slots),
          "props.data.constantValue",
          syncedCards.constantValue
        );
      }
    },
    render: (props) => <TestimonialCardsWrapperComponent {...props} />,
  };
