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
import { renderMappedEntityFieldEmptyState } from "../EntityFieldSectionEmptyState.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import {
  MappedEntityFieldConditionalRender,
  withMappedEntityFieldConditionalRender,
} from "../entityFieldSectionUtils.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";

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

    /** @internal */
    conditionalRender?: MappedEntityFieldConditionalRender;
  };

const testimonialCardsWrapperFields: YextFields<TestimonialCardsWrapperProps> =
  {
    ...cardWrapperFields<TestimonialCardsWrapperProps>(
      msg("components.testimonial", "Testimonial"),
      ComponentFields.TestimonialSection.type
    ),
    styles: {
      type: "object",
      label: msg("fields.styles", "Styles"),
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
    },
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
          const updatedData = setDeep(data, "props.slots.CardSlot", []);
          return withMappedEntityFieldConditionalRender(updatedData, true);
        }

        const requiredLength = resolvedTestimonials.length;
        const currentLength = data.props.slots.CardSlot.length;
        const cardsToAdd =
          currentLength < requiredLength
            ? Array(requiredLength - currentLength)
                .fill(null)
                .map(() =>
                  defaultTestimonialCardSlotData(
                    `TestimonialCard-${crypto.randomUUID()}`,
                    undefined,
                    sharedCardProps?.backgroundColor,
                    sharedCardProps?.slotStyles
                  )
                )
            : [];
        const updatedCardSlot = [
          ...data.props.slots.CardSlot,
          ...cardsToAdd,
        ].slice(0, requiredLength) as ComponentData<TestimonialCardProps>[];

        const updatedData = setDeep(
          data,
          "props.slots.CardSlot",
          updatedCardSlot.map((card, i) => {
            card.props.index = i;
            return setDeep(card, "props.parentData", {
              field: data.props.data.field,
              testimonial: resolvedTestimonials[i],
            } satisfies TestimonialCardProps["parentData"]);
          })
        );

        return withMappedEntityFieldConditionalRender(updatedData, false);
      }

      let updatedData = data;

      if (!Array.isArray(data.props.data.constantValue)) {
        updatedData = setDeep(updatedData, "props.data.constantValue", []);
        return withMappedEntityFieldConditionalRender(updatedData, false);
      }

      const inUseIds = new Set<string>();
      const newSlots = data.props.data.constantValue.map(({ id }, i) => {
        const existingCard = id
          ? (data.props.slots.CardSlot.find(
              (slot) => slot.props.id === id
            ) as ComponentData<TestimonialCardProps>)
          : (data.props.slots.CardSlot[i] as
              | ComponentData<TestimonialCardProps>
              | undefined);

        let newCard = existingCard
          ? (JSON.parse(JSON.stringify(existingCard)) as typeof existingCard)
          : undefined;

        let newId =
          newCard?.props.id || `TestimonialCard-${crypto.randomUUID()}`;

        if (newCard && inUseIds.has(newId)) {
          newId = `TestimonialCard-${crypto.randomUUID()}`;
          Object.entries(newCard.props.slots).forEach(
            ([slotKey, slotArray]) => {
              slotArray[0].props.id = newId + "-" + slotKey;
            }
          );
        }
        inUseIds.add(newId);

        if (!newCard) {
          return defaultTestimonialCardSlotData(
            newId,
            i,
            sharedCardProps?.backgroundColor,
            sharedCardProps?.slotStyles
          );
        }

        newCard = setDeep(newCard, "props.id", newId);
        newCard = setDeep(newCard, "props.index", i);
        newCard = setDeep(newCard, "props.parentData", undefined);

        return newCard;
      });

      updatedData = setDeep(updatedData, "props.slots.CardSlot", newSlots);
      updatedData = setDeep(
        updatedData,
        "props.data.constantValue",
        newSlots.map((card) => ({ id: card.props.id }))
      );

      return withMappedEntityFieldConditionalRender(updatedData, false);
    },
    render: (props) => {
      if (props.conditionalRender?.isMappedContentEmpty) {
        return renderMappedEntityFieldEmptyState(props.puck.isEditing);
      }

      return <TestimonialCardsWrapperComponent {...props} />;
    },
  };
