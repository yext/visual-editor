import { InsightSectionType, InsightStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  defaultInsightCardSlotData,
  InsightCardProps,
} from "./InsightCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { toPuckFields, YextComponentConfig } from "../../../fields/fields.ts";
import { resolveMappedListWrapperData } from "../../../utils/cardSlots/mappedListWrapper.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { createMappedItemsConfig } from "../../../utils/cardSlots/createMappedItemsConfig.ts";

export type InsightCardsWrapperProps = CardWrapperType<InsightSectionType> & {
  cards?: {
    image: YextEntityField<InsightStruct["image"]>;
    name: YextEntityField<InsightStruct["name"]>;
    category: YextEntityField<InsightStruct["category"]>;
    publishTime: YextEntityField<InsightStruct["publishTime"]>;
    description: YextEntityField<InsightStruct["description"]>;
    cta: YextEntityField<InsightStruct["cta"]>;
  };
  styles: {
    showImage: boolean;
    showCategory: boolean;
    showPublishTime: boolean;
    showDescription: boolean;
    showCTA: boolean;
  };
};

const defaultInsightCta = {
  label: { defaultValue: "" },
  link: "",
  linkType: "URL",
  ctaType: "textAndLink",
} satisfies InsightStruct["cta"];

const insightCards = createMappedItemsConfig<InsightCardsWrapperProps>({
  sourceFieldPath: "data.field",
  mappingGroupPath: "cards",
  sourceLabel: msg("fields.insights", "Insights"),
  mappingGroupLabel: msg("fields.cards", "Cards"),
  constantValueType: ComponentFields.InsightSection.type,
  listFieldName: "insights",
  sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
  sourceRootsOnly: true,
  requiredDescendantTypes: [["type.string"]],
  mappings: {
    image: {
      label: msg("fields.image", "Image"),
      types: ["type.image"],
      defaultValue: undefined,
      disableConstantValueToggle: true,
    },
    name: {
      label: msg("fields.name", "Name"),
      types: ["type.string"],
      defaultValue: { defaultValue: "" },
    },
    category: {
      label: msg("fields.category", "Category"),
      types: ["type.string", "type.rich_text_v2"],
      defaultValue: { defaultValue: "" },
    },
    publishTime: {
      label: msg("fields.publishTime", "Publish Time"),
      types: ["type.datetime"],
      defaultValue: "",
      disableConstantValueToggle: true,
    },
    description: {
      label: msg("fields.description", "Description"),
      types: ["type.string", "type.rich_text_v2"],
      defaultValue: { defaultValue: "" },
    },
    cta: {
      label: msg("fields.cta", "CTA"),
      types: ["type.cta"],
      defaultValue: defaultInsightCta,
    },
  },
});

const insightCardsWrapperFields = {
  ...insightCards.fields,
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

const InsightCardsWrapperComponent: PuckComponent<InsightCardsWrapperProps> = ({
  slots,
}) => {
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
    fields: insightCardsWrapperFields as any,
    defaultProps: {
      ...(insightCards.defaultProps as Pick<
        InsightCardsWrapperProps,
        "data" | "cards"
      >),
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
        ...(insightCards.resolveFields(
          data as ComponentData<InsightCardsWrapperProps>
        ) as any),
      }),
    resolveData: (data, params) => {
      const locale = i18nComponentsInstance.language || "en";
      const { data: nextData } = insightCards.resolve(
        data as ComponentData<InsightCardsWrapperProps>,
        params
      );

      return resolveMappedListWrapperData<
        InsightCardsWrapperProps,
        InsightCardProps,
        Record<string, unknown>,
        {
          backgroundColor?: InsightCardProps["styles"]["backgroundColor"];
          slotStyles?: Record<string, any>;
        }
      >({
        data: nextData,
        streamDocument: params.metadata.streamDocument ?? {},
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
        decorateMappedItemCard: (card, item, index) =>
          setDeep(setDeep(card, "props.index", index), "props.parentData", {
            field: nextData.props.data.field,
            insight: {
              image: insightCards.resolveMapping<InsightStruct["image"]>(
                nextData.props.cards?.image,
                item,
                locale
              ),
              name: insightCards.resolveMapping<InsightStruct["name"]>(
                nextData.props.cards?.name,
                item,
                locale
              ),
              category: insightCards.resolveMapping<InsightStruct["category"]>(
                nextData.props.cards?.category,
                item,
                locale
              ),
              publishTime: insightCards.resolveMapping<
                InsightStruct["publishTime"]
              >(nextData.props.cards?.publishTime, item, locale),
              description: insightCards.resolveMapping<
                InsightStruct["description"]
              >(nextData.props.cards?.description, item, locale),
              cta:
                insightCards.resolveMapping<InsightStruct["cta"]>(
                  nextData.props.cards?.cta,
                  item,
                  locale
                ) ?? defaultInsightCta,
            },
          } satisfies InsightCardProps["parentData"]),
      });
    },
    render: (props) => <InsightCardsWrapperComponent {...props} />,
  };
