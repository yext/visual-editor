import { ComponentData, PuckComponent, setDeep, Slot } from "@puckeditor/core";
import { InsightSectionType, InsightStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  defaultInsightCardSlotData,
  InsightCardProps,
} from "./InsightCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import {
  createListSourceField,
  type ListSourceFieldValue,
} from "../../../editor/ListSourceField.tsx";
import { INSIGHT_SECTION_CONSTANT_CONFIG } from "../../../internal/puck/constant-value-fields/InsightSection.tsx";
import {
  buildListSectionCards,
  resolveListSectionItems,
} from "../../../utils/cardSlots/listSectionData.ts";

export type InsightCardsWrapperProps = {
  data: ListSourceFieldValue;
  slots: {
    CardSlot: Slot;
  };
  styles: {
    showImage: boolean;
    showCategory: boolean;
    showPublishTime: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };
};

const insightCardsWrapperFields: YextFields<InsightCardsWrapperProps> = {
  data: createListSourceField({
    label: msg("fields.insights", "Insights"),
    legacySourceFilter: {
      types: [ComponentFields.InsightSection.type],
    },
    constantField: INSIGHT_SECTION_CONSTANT_CONFIG,
    mappingConfigs: [
      {
        key: "image",
        label: msg("fields.options.image", "Image"),
        preferredFieldNames: ["image"],
        required: false,
        types: ["type.image"],
      },
      {
        key: "name",
        label: msg("fields.showTitle", "Title"),
        preferredFieldNames: ["name", "title"],
        types: ["type.string"],
      },
      {
        key: "category",
        label: msg("fields.showCategory", "Category"),
        preferredFieldNames: ["category"],
        required: false,
        types: ["type.string", "type.rich_text_v2"],
      },
      {
        key: "description",
        label: msg("fields.showDescription", "Description"),
        preferredFieldNames: ["description"],
        required: false,
        types: ["type.rich_text_v2"],
      },
      {
        key: "publishTime",
        label: msg("fields.showPublishTime", "Publish Time"),
        preferredFieldNames: ["publishTime"],
        required: false,
        types: ["type.datetime"],
      },
      {
        key: "cta",
        label: msg("fields.showCTA", "CTA"),
        preferredFieldNames: ["cta"],
        required: false,
        types: ["type.cta"],
      },
    ],
  }),
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
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
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
      if (!streamDocument) {
        return data;
      }
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
        const { items: resolvedInsights, requiredLength } =
          resolveListSectionItems<InsightStruct>({
            buildMappedItem: (resolvedItemFields) => ({
              image: resolvedItemFields.image as InsightStruct["image"],
              name:
                typeof resolvedItemFields.name === "string"
                  ? resolvedItemFields.name
                  : undefined,
              category:
                resolvedItemFields.category as InsightStruct["category"],
              description:
                resolvedItemFields.description as InsightStruct["description"],
              publishTime:
                typeof resolvedItemFields.publishTime === "string"
                  ? resolvedItemFields.publishTime
                  : undefined,
              cta: resolvedItemFields.cta as InsightStruct["cta"],
            }),
            data: data.props.data,
            isValidItem: (insight) => Boolean(insight.name),
            resolveLegacyItems: () =>
              resolveYextEntityField<Partial<InsightSectionType>>(
                streamDocument,
                {
                  ...data.props.data,
                  constantValue: { insights: undefined },
                },
                i18nComponentsInstance.language || "en"
              )?.insights,
            streamDocument,
          });

        if (!requiredLength || !resolvedInsights) {
          return setDeep(data, "props.slots.CardSlot", []);
        }

        return setDeep(
          data,
          "props.slots.CardSlot",
          buildListSectionCards<InsightCardProps, InsightStruct>({
            currentCards: data.props.slots
              .CardSlot as ComponentData<InsightCardProps>[],
            createCard: () =>
              defaultInsightCardSlotData(
                `InsightCard-${crypto.randomUUID()}`,
                undefined,
                sharedCardProps?.backgroundColor,
                sharedCardProps?.slotStyles
              ) as unknown as ComponentData<InsightCardProps>,
            decorateCard: (card, insight, index) =>
              setDeep(setDeep(card, "props.index", index), "props.parentData", {
                field: data.props.data.field,
                insight,
              } satisfies InsightCardProps["parentData"]) as ComponentData<InsightCardProps>,
            items: resolvedInsights,
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
        return updatedData;
      }
    },
    render: (props) => <InsightCardsWrapperComponent {...props} />,
  };
