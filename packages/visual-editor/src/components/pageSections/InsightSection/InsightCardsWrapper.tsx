import { InsightSectionType } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import {
  cardWrapperFields,
  CardWrapperType,
} from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  defaultInsightCardSlotData,
  InsightCardProps,
} from "./InsightCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { EntityFieldSectionEmptyStateBox } from "../EntityFieldSectionEmptyState.tsx";
import { YextComponentConfig } from "../../../fields/fields.ts";
import {
  MappedEntityFieldConditionalRender,
  withMappedEntityFieldConditionalRender,
} from "../entityFieldSectionUtils.ts";
import { EmptyStateMarker } from "../emptyStateMarker.tsx";

export type InsightCardsWrapperProps = CardWrapperType<InsightSectionType> & {
  styles: {
    showImage: boolean;
    showCategory: boolean;
    showPublishTime: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };

  /** @internal */
  conditionalRender?: MappedEntityFieldConditionalRender;
};

const insightCardsWrapperFields = {
  ...cardWrapperFields<InsightCardsWrapperProps>(
    msg("fields.insights", "Insights"),
    ComponentFields.InsightSection.type
  ),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      showImage: {
        label: msg("fields.showImage", "Show Image"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showCategory: {
        label: msg("fields.showCategory", "Show Category"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showPublishTime: {
        label: msg("fields.showPublishTime", "Show Publish Time"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showDescription: {
        label: msg("fields.showDescription", "Show Description"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showCTA: {
        label: msg("fields.showCTA", "Show CTA"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
    },
  }),
};

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

export const InsightCardsWrapper: YextComponentConfig<InsightCardsWrapperProps> =
  {
    label: msg("slots.insightCards", "Insight Cards"),
    fields: insightCardsWrapperFields,
    defaultProps: {
      data: {
        field: "",
        constantValueEnabled: true,
        constantValue: [],
      },
      styles: {
        showImage: true,
        showCategory: true,
        showPublishTime: true,
        showDescription: true,
        showCTA: true,
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
          const updatedData = setDeep(data, "props.slots.CardSlot", []);
          return withMappedEntityFieldConditionalRender(updatedData, true);
        }

        const requiredLength = resolvedInsights.length;
        const currentLength = data.props.slots.CardSlot.length;
        const cardsToAdd =
          currentLength < requiredLength
            ? Array(requiredLength - currentLength)
                .fill(null)
                .map(() =>
                  defaultInsightCardSlotData(
                    `InsightCard-${crypto.randomUUID()}`,
                    undefined,
                    sharedCardProps?.backgroundColor,
                    sharedCardProps?.slotStyles
                  )
                )
            : [];
        const updatedCardSlot = [
          ...data.props.slots.CardSlot,
          ...cardsToAdd,
        ].slice(0, requiredLength);

        const updatedData = setDeep(
          data,
          "props.slots.CardSlot",
          updatedCardSlot
            .map((card, i) => setDeep(card, "props.index", i))
            .map((card, i) =>
              setDeep(card, "props.parentData", {
                field: data.props.data.field,
                insight: resolvedInsights[i],
              } satisfies InsightCardProps["parentData"])
            )
        );

        return withMappedEntityFieldConditionalRender(updatedData, false);
      }

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
          return defaultInsightCardSlotData(
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
        return props.puck.isEditing ? (
          <EntityFieldSectionEmptyStateBox showEmptyStateMarker />
        ) : (
          <EmptyStateMarker />
        );
      }

      return <InsightCardsWrapperComponent {...props} />;
    },
  };
