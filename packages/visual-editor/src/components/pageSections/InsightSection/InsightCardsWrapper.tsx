import { InsightSectionType, InsightStruct } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import {
  cardWrapperFields,
  CardWrapperType,
  createMappedSubfieldFields,
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
import {
  resolveMappedListFields,
  resolveMappedListWrapperData,
} from "../../../utils/cardSlots/mappedListWrapper.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { resolveMappedSourceField } from "../../../utils/cardSlots/mappedSource.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";

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

const createInsightCardsMappingFields = (sourceField?: string) =>
  createMappedSubfieldFields(msg("fields.cards", "Cards"), sourceField, {
    image: {
      label: msg("fields.image", "Image"),
      types: ["type.image"],
      disableConstantValueToggle: true,
    },
    name: {
      label: msg("fields.name", "Name"),
      types: ["type.string"],
    },
    category: {
      label: msg("fields.category", "Category"),
      types: ["type.string", "type.rich_text_v2"],
    },
    publishTime: {
      label: msg("fields.publishTime", "Publish Time"),
      types: ["type.datetime"],
      disableConstantValueToggle: true,
    },
    description: {
      label: msg("fields.description", "Description"),
      types: ["type.string", "type.rich_text_v2"],
    },
    cta: {
      label: msg("fields.cta", "CTA"),
      types: ["type.cta"],
    },
  });

const createInsightCardsWrapperFields = (sourceField?: string) => ({
  ...cardWrapperFields<InsightCardsWrapperProps>({
    label: msg("fields.insights", "Insights"),
    entityFieldType: ComponentFields.InsightSection.type,
    listFieldName: "insights",
    sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
    sourceRootsOnly: true,
    requiredDescendantTypes: [["type.string"]],
  }),
  cards: createInsightCardsMappingFields(sourceField) as any,
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
});

const insightCardsWrapperFields = createInsightCardsWrapperFields();

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
      cards: {
        image: {
          field: "",
          constantValue: undefined,
          constantValueEnabled: false,
        },
        name: {
          field: "",
          constantValue: { defaultValue: "" },
          constantValueEnabled: false,
        },
        category: {
          field: "",
          constantValue: { defaultValue: "" },
          constantValueEnabled: false,
        },
        publishTime: {
          field: "",
          constantValue: "",
          constantValueEnabled: false,
        },
        description: {
          field: "",
          constantValue: { defaultValue: "" },
          constantValueEnabled: false,
        },
        cta: {
          field: "",
          constantValue: defaultInsightCta,
          constantValueEnabled: false,
        },
      },
      slots: {
        CardSlot: [],
      },
    },
    resolveFields: (data, params) =>
      resolveMappedListFields({
        data: data as ComponentData<InsightCardsWrapperProps>,
        streamDocument: params.metadata.streamDocument ?? {},
        listFieldName: "insights",
        createFields: createInsightCardsWrapperFields,
        mappingFieldName: "cards",
        createMappingFields: createInsightCardsMappingFields,
      }),
    resolveData: (data, params) => {
      const locale = i18nComponentsInstance.language || "en";
      return resolveMappedListWrapperData<
        InsightCardsWrapperProps,
        InsightCardProps,
        Record<string, unknown>,
        InsightSectionType["insights"][number],
        {
          backgroundColor?: InsightCardProps["styles"]["backgroundColor"];
          slotStyles?: Record<string, any>;
        }
      >({
        data: data as ComponentData<InsightCardsWrapperProps>,
        streamDocument: params.metadata.streamDocument ?? {},
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
        decorateMappedItemCard: (card, item, index) =>
          setDeep(setDeep(card, "props.index", index), "props.parentData", {
            field: data.props.data.field,
            insight: {
              image: resolveMappedSourceField<InsightStruct["image"]>(
                item,
                data.props.data.field,
                data.props.cards?.image,
                locale
              ),
              name: resolveMappedSourceField<InsightStruct["name"]>(
                item,
                data.props.data.field,
                data.props.cards?.name,
                locale
              ),
              category: resolveMappedSourceField<InsightStruct["category"]>(
                item,
                data.props.data.field,
                data.props.cards?.category,
                locale
              ),
              publishTime: resolveMappedSourceField<
                InsightStruct["publishTime"]
              >(
                item,
                data.props.data.field,
                data.props.cards?.publishTime,
                locale
              ),
              description: resolveMappedSourceField<
                InsightStruct["description"]
              >(
                item,
                data.props.data.field,
                data.props.cards?.description,
                locale
              ),
              cta:
                resolveMappedSourceField<InsightStruct["cta"]>(
                  item,
                  data.props.data.field,
                  data.props.cards?.cta,
                  locale
                ) ?? defaultInsightCta,
            },
          } satisfies InsightCardProps["parentData"]),
        decorateSectionItemCard: (card, insight, index) =>
          setDeep(setDeep(card, "props.index", index), "props.parentData", {
            field: data.props.data.field,
            insight,
          } satisfies InsightCardProps["parentData"]),
      });
    },
    render: (props) => <InsightCardsWrapperComponent {...props} />,
  };
