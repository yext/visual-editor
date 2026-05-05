import { InsightSectionType, InsightStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { ComponentData, PuckComponent } from "@puckeditor/core";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  defaultInsightCardSlotData,
  InsightCardProps,
} from "./InsightCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { toPuckFields, YextComponentConfig } from "../../../fields/fields.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { createMappedItems } from "../../../utils/cardSlots/createMappedItems.ts";

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

const insightCards = createMappedItems<InsightCardsWrapperProps>({
  sourceFieldPath: "data.field",
  mappingGroupPath: "cards",
  sourceLabel: msg("fields.insights", "Insights"),
  mappingGroupLabel: msg("fields.cards", "Cards"),
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
})
  .withConstantValueMode({
    constantValueType: ComponentFields.InsightSection.type,
  })
  .withRepeatedSlot({
    slotPath: "slots.CardSlot",
    createItem: (id, index, existingItem) =>
      defaultInsightCardSlotData(
        id,
        index,
        existingItem?.props.styles.backgroundColor,
        existingItem ? gatherSlotStyles(existingItem.props.slots) : undefined
      ) as ComponentData<InsightCardProps>,
    getParentData: (item, resolvedData) => {
      const locale = i18nComponentsInstance.language || "en";

      return {
        field: resolvedData.props.data.field,
        insight: {
          image: insightCards.resolveMapping<InsightStruct["image"]>(
            resolvedData.props.cards?.image,
            item,
            locale
          ),
          name: insightCards.resolveMapping<InsightStruct["name"]>(
            resolvedData.props.cards?.name,
            item,
            locale
          ),
          category: insightCards.resolveMapping<InsightStruct["category"]>(
            resolvedData.props.cards?.category,
            item,
            locale
          ),
          publishTime: insightCards.resolveMapping<
            InsightStruct["publishTime"]
          >(resolvedData.props.cards?.publishTime, item, locale),
          description: insightCards.resolveMapping<
            InsightStruct["description"]
          >(resolvedData.props.cards?.description, item, locale),
          cta:
            insightCards.resolveMapping<InsightStruct["cta"]>(
              resolvedData.props.cards?.cta,
              item,
              locale
            ) ?? defaultInsightCta,
        },
      };
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
    fields: insightCardsWrapperFields,
    defaultProps: {
      ...insightCards.defaultProps,
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
    resolveData: (data, params) => insightCards.resolveItems(data, params).data,
    render: (props) => <InsightCardsWrapperComponent {...props} />,
  };
