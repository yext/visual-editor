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
import { YextComponentConfig } from "../../../fields/fields.ts";
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";
import { syncManualListCards } from "../../../utils/cardSlots/mappedListWrapper.ts";

export type InsightCardsWrapperProps = CardWrapperType<InsightSectionType> & {
  styles: {
    showImage: boolean;
    showCategory: boolean;
    showPublishTime: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };
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
          return setDeep(data, "props.slots.CardSlot", []);
        }

        return setDeep(
          data,
          "props.slots.CardSlot",
          buildListSectionCards<
            InsightCardProps,
            InsightSectionType["insights"][number]
          >({
            currentCards: data.props.slots
              .CardSlot as ComponentData<InsightCardProps>[],
            createCard: () =>
              defaultInsightCardSlotData(
                `InsightCard-${crypto.randomUUID()}`,
                undefined,
                sharedCardProps?.backgroundColor,
                sharedCardProps?.slotStyles
              ) as any,
            decorateCard: (card, insight, index) =>
              setDeep(setDeep(card, "props.index", index), "props.parentData", {
                field: data.props.data.field,
                insight,
              } satisfies InsightCardProps["parentData"]),
            items: resolvedInsights,
          })
        );
      } else {
        const syncedCards = syncManualListCards<InsightCardProps>({
          currentCards: data.props.slots
            .CardSlot as ComponentData<InsightCardProps>[],
          constantValue: data.props.data.constantValue,
          createId: () => `InsightCard-${crypto.randomUUID()}`,
          createCard: (id, index) =>
            defaultInsightCardSlotData(
              id,
              index,
              sharedCardProps?.backgroundColor,
              sharedCardProps?.slotStyles
            ) as any,
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
    render: (props) => <InsightCardsWrapperComponent {...props} />,
  };
