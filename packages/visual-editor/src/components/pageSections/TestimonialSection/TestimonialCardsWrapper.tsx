import * as React from "react";
import {
  ComponentConfig,
  ComponentData,
  PuckComponent,
  setDeep,
} from "@puckeditor/core";
import {
  TestimonialSectionType,
  ComponentFields,
  msg,
  i18nComponentsInstance,
  resolveYextEntityField,
} from "@yext/visual-editor";
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

export type TestimonialCardsWrapperProps =
  CardWrapperType<TestimonialSectionType>;

const testimonialCardsWrapperFields =
  cardWrapperFields<TestimonialCardsWrapperProps>(
    msg("components.testimonial", "Testimonial"),
    ComponentFields.TestimonialSection.type
  );

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

export const TestimonialCardsWrapper: ComponentConfig<{
  props: TestimonialCardsWrapperProps;
}> = {
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

      return setDeep(
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
    } else {
      let updatedData = data;

      if (!Array.isArray(data.props.data.constantValue)) {
        updatedData = setDeep(updatedData, "props.data.constantValue", []);
        return updatedData;
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
      return updatedData;
    }
  },
  render: (props) => <TestimonialCardsWrapperComponent {...props} />,
};
