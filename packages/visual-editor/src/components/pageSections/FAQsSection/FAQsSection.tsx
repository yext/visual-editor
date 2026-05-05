import {
  type ComponentData,
  PuckComponent,
  setDeep,
  type Slot,
} from "@puckeditor/core";
import {
  backgroundColors,
  type ThemeColor,
  ThemeOptions,
} from "../../../utils/themeConfigOptions.ts";
import { PageSection } from "../../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { type HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import {
  type FAQSectionType,
  type TranslatableRichText,
  type TranslatableString,
} from "../../../types/types.ts";
import { type YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultFAQCardData, type FAQCardProps } from "./FAQCard.tsx";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import {
  toPuckFields,
  type YextComponentConfig,
  type YextFields,
} from "../../../fields/fields.ts";
import { type StreamDocument, createItemSource } from "../../../utils/index.ts";
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";

type FAQItem = {
  question: YextEntityField<TranslatableString | TranslatableRichText>;
  answer: YextEntityField<TranslatableRichText>;
};

export interface FAQStyles {
  backgroundColor?: ThemeColor;
  showSectionHeading: boolean;
}

export interface FAQSectionProps {
  data: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: FAQItem[];
  };
  faqs?: FAQItem;
  styles: FAQStyles;
  slots: {
    HeadingSlot: Slot;
    CardSlot: Slot;
  };
  analytics: {
    scope?: string;
  };
  hasResolvedSource?: boolean;
  liveVisibility: boolean;
}

const faqs = createItemSource<FAQSectionProps, FAQItem>({
  itemSourcePath: "data",
  itemMappingsPath: "faqs",
  itemSourceLabel: msg("fields.faqs", "FAQs"),
  itemMappingsLabel: msg("fields.faqMapping", "FAQ Mapping"),
  itemFields: {
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
  ...faqs.fields,
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

const syncCards = (
  data: ComponentData<FAQSectionProps>,
  resolvedItems: Record<string, unknown>[]
): ComponentData<FAQSectionProps> => {
  const currentCards =
    (data.props.slots.CardSlot as unknown as ComponentData<FAQCardProps>[]) ??
    [];
  const existingCard = currentCards[0];

  return setDeep(
    data,
    "props.slots.CardSlot",
    buildListSectionCards<FAQCardProps, Record<string, unknown>>({
      currentCards,
      items: resolvedItems,
      createCard: () =>
        defaultFAQCardData(
          `FAQCard-${crypto.randomUUID()}`,
          undefined,
          existingCard?.props.styles.questionVariant,
          existingCard?.props.styles.answerVariant,
          existingCard?.props.styles.answerColor
        ) as unknown as ComponentData<FAQCardProps>,
      decorateCard: (card, item, index) => ({
        ...card,
        props: {
          ...card.props,
          index,
          itemData: {
            field: data.props.data.field,
            question:
              (item.question as FAQSectionType["faqs"][number]["question"]) ?? {
                defaultValue: "",
              },
            answer:
              (item.answer as FAQSectionType["faqs"][number]["answer"]) ?? {
                defaultValue: "",
              },
          },
        },
      }),
    })
  );
};

const FAQsSectionComponent: PuckComponent<FAQSectionProps> = ({
  styles,
  slots,
  hasResolvedSource,
  puck,
}) => {
  if (!puck.isEditing && hasResolvedSource === false) {
    return <></>;
  }

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
        defaultFAQCardData(
          undefined,
          0
        ) as unknown as ComponentData<FAQCardProps>,
        defaultFAQCardData(
          undefined,
          1
        ) as unknown as ComponentData<FAQCardProps>,
        defaultFAQCardData(
          undefined,
          2
        ) as unknown as ComponentData<FAQCardProps>,
      ],
    },
    ...faqs.defaultProps,
    data: {
      ...faqs.defaultProps.data!,
      constantValue: [{}, {}, {}] as FAQItem[],
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
  resolveFields: (data) =>
    toPuckFields({
      ...FAQsSectionFields,
      ...faqs.resolveFields(data),
    }),
  resolveData: (data, params) => {
    const normalizedData = faqs.normalizeData(data, params);
    const resolvedItems = faqs.resolveItems(
      normalizedData.props.data,
      normalizedData.props.faqs,
      (params.metadata?.streamDocument ?? {}) as StreamDocument
    );
    const syncedData = syncCards(normalizedData, resolvedItems);

    return setDeep(
      syncedData,
      "props.hasResolvedSource",
      syncedData.props.data.constantValueEnabled || resolvedItems.length > 0
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
          <FAQsSectionComponent {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    </ComponentErrorBoundary>
  ),
};
