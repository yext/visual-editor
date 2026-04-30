import { ComponentData, PuckComponent, setDeep, Slot } from "@puckeditor/core";
import {
  backgroundColors,
  ThemeColor,
  ThemeOptions,
} from "../../../utils/themeConfigOptions.ts";
import { PageSection } from "../../atoms/pageSection.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { FAQSectionType } from "../../../types/types.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { ComponentFields } from "../../../types/fields.ts";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultFAQCardData, FAQCardProps } from "./FAQCard.tsx";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import {
  toPuckFields,
  YextComponentConfig,
  YextFields,
} from "../../../fields/fields.ts";
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";
import {
  getMappedCardSourceMode,
  resolveLinkedEntityMappedData,
  resolveLinkedEntitySourceItems,
} from "../../../utils/cardSlots/linkedEntityListWrapper.ts";

export interface FAQStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: ThemeColor;

  /**
   * Whether to show the section heading.
   * @defaultValue true
   */
  showSectionHeading: boolean;
}

export interface FAQSectionProps {
  data: Omit<YextEntityField<FAQSectionType>, "constantValue"> & {
    constantValue: {
      id?: string;
    }[];
  };
  faqs?: {
    question: YextEntityField<FAQSectionType["faqs"][number]["question"]>;
    answer: YextEntityField<FAQSectionType["faqs"][number]["answer"]>;
  };

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: FAQStyles;

  slots: {
    HeadingSlot: Slot;
    CardSlot: Slot;
  };

  /** @internal */
  analytics: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const createFAQMappingFields = (sourceField?: string) =>
  YextField(msg("fields.faqMapping", "FAQ Mapping"), {
    type: "object",
    objectFields: {
      question: YextField(msg("fields.question", "Question"), {
        type: "entityField",
        filter: {
          types: ["type.string", "type.rich_text_v2"],
          ...(sourceField ? { descendantsOf: sourceField } : {}),
        },
      }),
      answer: YextField(msg("fields.answer", "Answer"), {
        type: "entityField",
        filter: {
          types: ["type.string", "type.rich_text_v2"],
          ...(sourceField ? { descendantsOf: sourceField } : {}),
        },
      }),
    },
  });

const createFAQsSectionFields = (
  sourceField?: string
): YextFields<FAQSectionProps> => ({
  data: YextField(msg("fields.faqs", "FAQs"), {
    type: "entityField",
    filter: {
      types: [ComponentFields.FAQSection.type],
      requiredDescendantTypes: [["type.string", "type.rich_text_v2"]],
      sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
      sourceRootsOnly: true,
    },
  }),
  faqs: createFAQMappingFields(sourceField) as any,
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
      },
      showSectionHeading: {
        label: msg("fields.showSectionHeading", "Show Section Heading"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      HeadingSlot: { type: "slot", allow: [] },
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: {
        label: msg("fields.scope", "Scope"),
        type: "text",
      },
    },
  }),
  liveVisibility: {
    label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
    type: "radio",
    options: [
      { label: msg("fields.options.show", "Show"), value: true },
      { label: msg("fields.options.hide", "Hide"), value: false },
    ],
  },
});

const FAQsSectionFields = createFAQsSectionFields();

const FAQsSectionComponent: PuckComponent<FAQSectionProps> = ({
  styles,
  slots,
}) => {
  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8 md:gap-12"
    >
      {styles.showSectionHeading && (
        <slots.HeadingSlot style={{ height: "auto" }} />
      )}
      <CardContextProvider>
        <slots.CardSlot />
      </CardContextProvider>
    </PageSection>
  );
};

/**
 * The FAQ Section component displays a list of questions and answers in an organized format.
 * It includes a main heading for the section and typically renders the FAQs as an accordion,
 * where users can click on a question to reveal the answer.
 */
export const FAQSection: YextComponentConfig<FAQSectionProps> = {
  label: msg("components.faqsSection", "FAQs Section"),
  fields: FAQsSectionFields,
  defaultProps: {
    slots: {
      HeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: { defaultValue: "Frequently Asked Questions" },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 2, align: "left" },
          } satisfies HeadingTextProps,
        },
      ],
      CardSlot: [
        defaultFAQCardData(undefined, 0),
        defaultFAQCardData(undefined, 1),
        defaultFAQCardData(undefined, 2),
      ],
    },
    data: {
      constantValue: [{}, {}, {}],
      constantValueEnabled: true,
      field: "",
    },
    faqs: {
      question: {
        field: "",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      answer: {
        field: "",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background2.value,
      showSectionHeading: true,
    },
    liveVisibility: true,
    analytics: {
      scope: "faqsSection",
    },
  },
  resolveFields: (data, params) => {
    const streamDocument = params.metadata.streamDocument ?? {};
    const isMappedItemListMode =
      !data.props.data.constantValueEnabled &&
      !!data.props.data.field &&
      getMappedCardSourceMode(streamDocument, data.props.data.field, "faqs") ===
        "itemList";

    return toPuckFields({
      ...(createFAQsSectionFields(
        isMappedItemListMode ? data.props.data.field : undefined
      ) as any),
      faqs: {
        ...(createFAQMappingFields(
          isMappedItemListMode ? data.props.data.field : undefined
        ) as any),
        visible: isMappedItemListMode,
      },
    });
  },
  resolveData: (data, params) => {
    const streamDocument = params.metadata.streamDocument ?? {};
    const locale = i18nComponentsInstance.language || "en";
    const sharedCardProps =
      data.props.slots.CardSlot.length === 0
        ? undefined
        : {
            questionVariant:
              data.props.slots.CardSlot[0].props.styles.questionVariant,
            answerVariant:
              data.props.slots.CardSlot[0].props.styles.answerVariant,
            answerColor: data.props.slots.CardSlot[0].props.styles.answerColor,
          };

    if (!data.props.data.constantValueEnabled && data.props.data.field) {
      const sourceMode = getMappedCardSourceMode(
        streamDocument,
        data.props.data.field,
        "faqs"
      );

      if (sourceMode === "itemList") {
        const resolvedLinkedEntities = resolveLinkedEntitySourceItems<
          Record<string, unknown>
        >(streamDocument, data.props.data.field);

        if (!resolvedLinkedEntities.length) {
          return setDeep(data, "props.slots.CardSlot", []);
        }

        return setDeep(
          data,
          "props.slots.CardSlot",
          buildListSectionCards<FAQCardProps, Record<string, unknown>>({
            currentCards: data.props.slots
              .CardSlot as ComponentData<FAQCardProps>[],
            createCard: () =>
              defaultFAQCardData(
                `FAQCard-${crypto.randomUUID()}`,
                undefined,
                sharedCardProps?.questionVariant,
                sharedCardProps?.answerVariant,
                sharedCardProps?.answerColor
              ) as ComponentData<FAQCardProps>,
            decorateCard: (card, linkedEntity, index) =>
              setDeep(setDeep(card, "props.index", index), "props.parentData", {
                field: data.props.data.field,
                faq: {
                  question: resolveLinkedEntityMappedData(
                    linkedEntity,
                    data.props.data.field,
                    data.props.faqs?.question,
                    locale
                  ) ?? { defaultValue: "" },
                  answer: resolveLinkedEntityMappedData(
                    linkedEntity,
                    data.props.data.field,
                    data.props.faqs?.answer,
                    locale
                  ) ?? { defaultValue: "" },
                },
              } satisfies FAQCardProps["parentData"]),
            items: resolvedLinkedEntities,
          })
        );
      }

      // ENTITY VALUES
      const resolvedFAQs = resolveYextEntityField<
        FAQSectionType | { faqs: undefined }
      >(
        streamDocument,
        {
          ...data.props.data,
          constantValue: { faqs: undefined },
        },
        i18nComponentsInstance.language || "en"
      )?.faqs;

      if (!resolvedFAQs?.length) {
        return setDeep(data, "props.slots.CardSlot", []);
      }

      return setDeep(
        data,
        "props.slots.CardSlot",
        buildListSectionCards<FAQCardProps, FAQSectionType["faqs"][number]>({
          currentCards: data.props.slots
            .CardSlot as ComponentData<FAQCardProps>[],
          createCard: () =>
            defaultFAQCardData(
              `FAQCard-${crypto.randomUUID()}`,
              undefined,
              sharedCardProps?.questionVariant,
              sharedCardProps?.answerVariant,
              sharedCardProps?.answerColor
            ) as ComponentData<FAQCardProps>,
          decorateCard: (card, faq, index) =>
            setDeep(setDeep(card, "props.index", index), "props.parentData", {
              field: data.props.data.field,
              faq,
            } satisfies FAQCardProps["parentData"]),
          items: resolvedFAQs,
        })
      );
    } else {
      // STATIC VALUES
      let updatedData = data;

      // For each id in constantValue, check if there's already an existing card.
      // If not, add a new default card.
      // Also, de-duplicate ids to avoid conflicts.
      // Finally, update the card slot and the constantValue object.
      const inUseIds = new Set<string>();
      const newSlots = data.props.data.constantValue.map(({ id }, i) => {
        const existingCard = id
          ? (data.props.slots.CardSlot.find(
              (slot) => slot.props.id === id
            ) as ComponentData<FAQCardProps>)
          : undefined;

        // Make a deep copy of existingCard to avoid mutating multiple cards
        let newCard = existingCard
          ? (JSON.parse(JSON.stringify(existingCard)) as typeof existingCard)
          : undefined;

        let newId = newCard?.props.id || `FAQCard-${crypto.randomUUID()}`;

        if (newCard && inUseIds.has(newId)) {
          newId = `FAQCard-${crypto.randomUUID()}`;
        }
        inUseIds.add(newId);

        if (!newCard) {
          return defaultFAQCardData(
            newId,
            i,
            sharedCardProps?.questionVariant,
            sharedCardProps?.answerVariant,
            sharedCardProps?.answerColor
          );
        }

        newCard = setDeep(newCard, "props.id", newId); // update the id
        newCard = setDeep(newCard, "props.index", i); // update the index
        newCard = setDeep(newCard, "props.parentData", undefined); // set to constant values

        return newCard;
      });

      // update the  cards
      updatedData = setDeep(updatedData, "props.slots.CardSlot", newSlots);
      // update the constantValue for the sidebar
      updatedData = setDeep(
        updatedData,
        "props.data.constantValue",
        newSlots.map((card) => ({ id: card.props.id }))
      );
      return updatedData;
    }
  },
  render: (props) => (
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
      <AnalyticsScopeProvider
        name={`${props.analytics?.scope ?? "faqsSection"}${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          <FAQsSectionComponent {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    </ComponentErrorBoundary>
  ),
};
