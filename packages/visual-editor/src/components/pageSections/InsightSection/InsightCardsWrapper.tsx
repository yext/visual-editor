import { InsightSectionType } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
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
import { resolveMappedListWrapperData } from "../../../utils/cardSlots/mappedListWrapper.ts";

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
      return resolveMappedListWrapperData<
        InsightCardsWrapperProps,
        InsightCardProps,
        never,
        InsightSectionType["insights"][number],
        {
          backgroundColor?: InsightCardProps["styles"]["backgroundColor"];
          slotStyles?: Record<string, any>;
        }
      >({
        data: data as ComponentData<InsightCardsWrapperProps>,
        streamDocument: params.metadata.streamDocument ?? {},
        locale: i18nComponentsInstance.language || "en",
        listFieldName: "insights",
        cardIdPrefix: "InsightCard",
        getSharedCardProps: (card) =>
          !card
            ? undefined
            : {
                backgroundColor: card.props.styles.backgroundColor,
                slotStyles: gatherSlotStyles(card.props.slots),
              },
        createCard: (id, index, sharedCardProps) =>
          defaultInsightCardSlotData(
            id,
            index,
            sharedCardProps?.backgroundColor,
            sharedCardProps?.slotStyles
          ) as any,
        decorateMappedItemCard: (card, _item, _index) => card,
        decorateSectionItemCard: (card, insight, index) =>
          setDeep(setDeep(card, "props.index", index), "props.parentData", {
            field: data.props.data.field,
            insight,
          } satisfies InsightCardProps["parentData"]),
      });
    },
    render: (props) => <InsightCardsWrapperComponent {...props} />,
  };
