import {
  type ComponentData,
  PuckComponent,
  type Slot,
  setDeep,
} from "@puckeditor/core";
import { type InsightStruct } from "../../../types/types.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  defaultInsightCardItemData,
  defaultInsightCardSlotData,
  type InsightCardProps,
} from "./InsightCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import {
  toPuckFields,
  type YextComponentConfig,
  type YextFields,
} from "../../../fields/fields.ts";
import { type YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";
import { type StreamDocument, createItemSource } from "../../../utils/index.ts";

type InsightCardItem = {
  image: YextEntityField<InsightStruct["image"]>;
  name: YextEntityField<InsightStruct["name"]>;
  category: YextEntityField<InsightStruct["category"]>;
  publishTime: YextEntityField<InsightStruct["publishTime"]>;
  description: YextEntityField<InsightStruct["description"]>;
  cta: YextEntityField<InsightStruct["cta"]>;
};

export type InsightCardsWrapperProps = {
  data: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: InsightCardItem[];
  };
  cards?: InsightCardItem;
  styles: {
    showImage: boolean;
    showCategory: boolean;
    showPublishTime: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };
  slots: {
    CardSlot: Slot;
  };
};

const defaultInsightCta = {
  label: { defaultValue: "" },
  link: "",
  linkType: "URL",
  ctaType: "textAndLink",
} satisfies InsightStruct["cta"];

const insightCards = createItemSource<
  InsightCardsWrapperProps,
  InsightCardItem
>({
  itemSourcePath: "data",
  itemMappingsPath: "cards",
  itemSourceLabel: msg("fields.insights", "Insights"),
  itemMappingsLabel: msg("fields.cards", "Cards"),
  itemFields: {
    image: {
      type: "entityField",
      label: msg("fields.image", "Image"),
      disableConstantValueToggle: true,
      filter: {
        types: ["type.image"],
      },
    },
    name: {
      type: "entityField",
      label: msg("fields.name", "Name"),
      filter: {
        types: ["type.string"],
      },
    },
    category: {
      type: "entityField",
      label: msg("fields.category", "Category"),
      filter: {
        types: ["type.string", "type.rich_text_v2"],
      },
    },
    publishTime: {
      type: "entityField",
      label: msg("fields.publishTime", "Publish Time"),
      disableConstantValueToggle: true,
      filter: {
        types: ["type.datetime"],
      },
    },
    description: {
      type: "entityField",
      label: msg("fields.description", "Description"),
      filter: {
        types: ["type.string", "type.rich_text_v2"],
      },
    },
    cta: {
      type: "entityField",
      label: msg("fields.cta", "CTA"),
      filter: {
        types: ["type.cta"],
      },
    },
  },
});

const insightCardsWrapperFields: YextFields<InsightCardsWrapperProps> = {
  ...insightCards.fields,
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
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
  },
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
};

/**
 * Creates a new InsightCard shell using the first existing card as the styling
 * template for newly synced cards.
 */
const createInsightCard = (
  currentCards: ComponentData<InsightCardProps>[]
): ComponentData<InsightCardProps> => {
  const existingCard = currentCards[0];

  return defaultInsightCardSlotData(
    `InsightCard-${crypto.randomUUID()}`,
    undefined,
    existingCard?.props.styles.backgroundColor,
    existingCard ? gatherSlotStyles(existingCard.props.slots) : undefined
  ) as unknown as ComponentData<InsightCardProps>;
};

/**
 * Keeps the hidden CardSlot array aligned with the current linked or manual
 * item list while preserving existing card styling where possible.
 */
const syncCards = <TData extends { props: InsightCardsWrapperProps }>(
  data: TData,
  resolvedItems: Record<string, unknown>[]
): TData => {
  const currentCards =
    (data.props.slots
      .CardSlot as unknown as ComponentData<InsightCardProps>[]) ?? [];

  return setDeep(
    data,
    "props.slots.CardSlot",
    buildListSectionCards<InsightCardProps, Record<string, unknown>>({
      currentCards,
      items: resolvedItems,
      createCard: () => createInsightCard(currentCards),
      decorateCard: (card, item, index) => ({
        ...card,
        props: {
          ...card.props,
          index,
          itemData: {
            field: data.props.data.field,
            image: item.image as InsightStruct["image"],
            name: item.name as InsightStruct["name"],
            category: item.category as InsightStruct["category"],
            publishTime: item.publishTime as InsightStruct["publishTime"],
            description: item.description as InsightStruct["description"],
            cta:
              (item.cta as InsightStruct["cta"] | undefined) ??
              defaultInsightCta,
          },
        },
      }),
    })
  ) as TData;
};

const InsightCardsWrapperComponent: PuckComponent<InsightCardsWrapperProps> = ({
  slots,
}) => (
  <CardContextProvider>
    <slots.CardSlot
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 align-stretch"
      allow={[]}
    />
  </CardContextProvider>
);

export const InsightCardsWrapper: YextComponentConfig<InsightCardsWrapperProps> =
  {
    label: msg("slots.insightCards", "Insight Cards"),
    fields: insightCardsWrapperFields,
    defaultProps: {
      ...insightCards.defaultProps,
      data: {
        ...insightCards.defaultProps.data!,
        constantValue: Array.from(
          { length: 3 },
          () =>
            JSON.parse(
              JSON.stringify(defaultInsightCardItemData)
            ) as InsightCardItem
        ),
      },
      cards: {
        ...(insightCards.defaultProps.cards as InsightCardItem),
        cta: {
          field: "",
          constantValueEnabled: false,
          constantValue: defaultInsightCta,
        },
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
    resolveFields: (data) =>
      toPuckFields({
        ...insightCardsWrapperFields,
        ...insightCards.resolveFields(data),
      }),
    resolveData: (data, params) => {
      const normalizedData = insightCards.normalizeData(data, params);
      const resolvedItems = insightCards.resolveItems(
        normalizedData.props.data,
        normalizedData.props.cards,
        (params.metadata?.streamDocument ?? {}) as StreamDocument
      );

      return syncCards(normalizedData, resolvedItems);
    },
    render: (props) => <InsightCardsWrapperComponent {...props} />,
  };
