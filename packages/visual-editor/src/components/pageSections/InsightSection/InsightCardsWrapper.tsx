import * as React from "react";
import {
  InsightSectionType,
  ComponentFields,
  msg,
  resolveYextEntityField,
  i18nComponentsInstance,
} from "@yext/visual-editor";
import {
  cardWrapperFields,
  CardWrapperType,
} from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import {
  ComponentConfig,
  ComponentData,
  PuckComponent,
  setDeep,
} from "@measured/puck";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  defaultInsightCardSlotData,
  InsightCardProps,
} from "./InsightCard.tsx";

export type InsightCardsWrapperProps = CardWrapperType<InsightSectionType>;

const insightCardsWrapperFields = cardWrapperFields<InsightCardsWrapperProps>(
  msg("fields.insights", "Insights"),
  ComponentFields.InsightSection.type
);

const InsightCardsWrapperComponent: PuckComponent<InsightCardsWrapperProps> = (
  props
) => {
  const { slots } = props;

  return (
    <CardContextProvider>
      <slots.CardSlot
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 align-stretch"
        allow={[]}
      />
    </CardContextProvider>
  );
};

export const InsightCardsWrapper: ComponentConfig<{
  props: InsightCardsWrapperProps;
}> = {
  label: msg("slots.insightCards", "Insight Cards"),
  fields: insightCardsWrapperFields,
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

    if (!data.props.data.constantValueEnabled && data.props.data.field) {
      const resolvedInsights = resolveYextEntityField<
        InsightSectionType | { insights: undefined }
      >(
        streamDocument,
        {
          ...data.props.data,
          constantValue: { insights: undefined },
        },
        i18nComponentsInstance.language || "en"
      )?.insights;

      if (!resolvedInsights?.length) {
        return setDeep(data, "props.slots.CardSlot", []);
      }

      const requiredLength = resolvedInsights.length;
      const currentLength = data.props.slots.CardSlot.length;
      const cardsToAdd =
        currentLength < requiredLength
          ? Array(requiredLength - currentLength)
              .fill(null)
              .map((_, i) =>
                defaultInsightCardSlotData(
                  `InsightCard-${crypto.randomUUID()}`,
                  i + currentLength
                )
              )
          : [];
      const updatedCardSlot = [
        ...data.props.slots.CardSlot,
        ...cardsToAdd,
      ].slice(0, requiredLength);

      return setDeep(
        data,
        "props.slots.CardSlot",
        updatedCardSlot
          .map((card, i) => {
            return setDeep(card, "props.index", i);
          })
          .map((card, i) => {
            return setDeep(card, "props.parentData", {
              field: data.props.data.field,
              insight: resolvedInsights[i],
            } satisfies InsightCardProps["parentData"]);
          })
      );
    } else {
      let updatedData = data;
      const inUseIds = new Set<string>();
      const newSlots = data.props.data.constantValue.map(({ id }, i) => {
        const existingCard = id
          ? (data.props.slots.CardSlot.find(
              (slot) => slot.props.id === id
            ) as ComponentData<InsightCardProps>)
          : undefined;

        let newCard = existingCard
          ? (JSON.parse(JSON.stringify(existingCard)) as typeof existingCard)
          : undefined;

        let newId = newCard?.props.id || `InsightCard-${crypto.randomUUID()}`;

        if (newCard && inUseIds.has(newId)) {
          newId = `InsightCard-${crypto.randomUUID()}`;
          Object.entries(newCard.props.slots).forEach(
            ([slotKey, slotArray]) => {
              slotArray[0].props.id = newId + "-" + slotKey;
            }
          );
        }
        inUseIds.add(newId);

        if (!newCard) {
          const newCardData = defaultInsightCardSlotData(newId, i);
          return newCardData;
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
  render: (props) => <InsightCardsWrapperComponent {...props} />,
};
