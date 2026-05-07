import {
  ComponentData,
  PuckComponent,
  setDeep,
  Slot,
  SlotComponent,
} from "@puckeditor/core";
import {
  backgroundColors,
  ThemeColor,
  ThemeOptions,
} from "../../../utils/themeConfigOptions.ts";
import { PageSection } from "../../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { FAQSectionType, FAQStruct } from "../../../types/types.ts";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultFAQCardData, FAQCardProps } from "./FAQCard.tsx";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import { EntityFieldSectionEmptyStateBox } from "../EntityFieldSectionEmptyState.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import {
  MappedEntityFieldConditionalRender,
  withMappedEntityFieldConditionalRender,
} from "../entityFieldSectionUtils.ts";
import { createSlotMappedCardsSource } from "../../../utils/itemSource/index.ts";
import {
  syncLinkedSlotMappedCards,
  syncManualSlotMappedCards,
} from "../../../utils/cardSlots/slotMappedCards.ts";

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
  data: typeof faqCardsSource.value;

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

  /** @internal */
  conditionalRender?: MappedEntityFieldConditionalRender;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

type FAQCardMappings = {
  question: FAQStruct["question"];
  answer: FAQStruct["answer"];
};

export const faqCardsSource = createSlotMappedCardsSource<FAQCardMappings>({
  label: msg("fields.faqs", "FAQs"),
  manualItemLabel: "FAQ",
  mappingFields: {
    question: {
      type: "entityField",
      label: msg("fields.question", "Question"),
      filter: {
        types: ["type.string", "type.rich_text_v2"],
      },
    },
    answer: {
      type: "entityField",
      label: msg("fields.answer", "Answer"),
      filter: {
        types: ["type.rich_text_v2"],
      },
    },
  },
});

const FAQsSectionFields: YextFields<FAQSectionProps> = {
  data: faqCardsSource.field,
  styles: {
    type: "object",
    label: msg("fields.styles", "Styles"),
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
  },
  slots: {
    type: "object",
    objectFields: {
      HeadingSlot: { type: "slot", allow: [] },
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
  analytics: {
    type: "object",
    label: msg("fields.analytics", "Analytics"),
    visible: false,
    objectFields: {
      scope: {
        label: msg("fields.scope", "Scope"),
        type: "text",
      },
    },
  },
  liveVisibility: {
    label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
    type: "radio",
    options: [
      { label: msg("fields.options.show", "Show"), value: true },
      { label: msg("fields.options.hide", "Hide"), value: false },
    ],
  },
};

const FAQsSectionLayout = ({
  styles,
  slots,
  cardsContent,
}: {
  styles: FAQSectionProps["styles"];
  slots: {
    HeadingSlot: SlotComponent;
    CardSlot: SlotComponent;
  };
  cardsContent?: React.ReactNode;
}) => {
  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8 md:gap-12"
    >
      {styles.showSectionHeading && (
        <slots.HeadingSlot style={{ height: "auto" }} />
      )}
      {cardsContent ?? (
        <CardContextProvider>
          <slots.CardSlot />
        </CardContextProvider>
      )}
    </PageSection>
  );
};

const FAQsSectionComponent: PuckComponent<FAQSectionProps> = ({
  styles,
  slots,
}) => <FAQsSectionLayout styles={styles} slots={slots} />;

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
      ...faqCardsSource.defaultValue,
      constantValue: [{}, {}, {}],
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
  resolveData: (data, params) => {
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
      const resolvedFAQs = faqCardsSource.resolveMappedItems(
        data.props.data,
        params.metadata.streamDocument!
      );

      if (!resolvedFAQs?.length) {
        // Clear the rendered cards when the mapped FAQ field resolves empty.
        const updatedData = setDeep(data, "props.slots.CardSlot", []);
        return withMappedEntityFieldConditionalRender(updatedData, true);
      }

      const updatedData = setDeep(
        data,
        "props.slots.CardSlot",
        syncLinkedSlotMappedCards({
          items: resolvedFAQs,
          currentCards: data.props.slots
            .CardSlot as ComponentData<FAQCardProps>[],
          createCard: (id, index) =>
            defaultFAQCardData(
              id,
              index,
              sharedCardProps?.questionVariant,
              sharedCardProps?.answerVariant,
              sharedCardProps?.answerColor
            ) as ComponentData<FAQCardProps>,
          toParentData: (faq) => ({
            field: data.props.data.field,
            faq: faq as FAQSectionType["faqs"][number],
          }),
          normalizeId: (id) => `FAQCard-${id}`,
        })
      );

      return withMappedEntityFieldConditionalRender(updatedData, false);
    }

    const normalizedCards = syncManualSlotMappedCards({
      cardReferences: data.props.data.constantValue,
      currentCards: data.props.slots.CardSlot as ComponentData<FAQCardProps>[],
      createCard: (id, index) =>
        defaultFAQCardData(
          id,
          index,
          sharedCardProps?.questionVariant,
          sharedCardProps?.answerVariant,
          sharedCardProps?.answerColor
        ) as ComponentData<FAQCardProps>,
      normalizeId: (id) => `FAQCard-${id}`,
    });

    return withMappedEntityFieldConditionalRender(
      setDeep(
        setDeep(data, "props.slots.CardSlot", normalizedCards.cards),
        "props.data.constantValue",
        normalizedCards.cardReferences
      ),
      false
    );
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
          {props.conditionalRender?.isMappedContentEmpty ? (
            props.puck.isEditing ? (
              <FAQsSectionLayout
                styles={props.styles}
                slots={props.slots}
                cardsContent={<EntityFieldSectionEmptyStateBox />}
              />
            ) : (
              <></>
            )
          ) : (
            <FAQsSectionComponent {...props} />
          )}
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    </ComponentErrorBoundary>
  ),
};
