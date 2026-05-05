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
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultFAQCardData, FAQCardProps } from "./FAQCard.tsx";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import {
  toPuckFields,
  YextComponentConfig,
  type YextFields,
} from "../../../fields/fields.ts";
import { createMappedItems } from "../../../utils/cardSlots/createMappedItems.ts";

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

  /** @internal */
  hasResolvedSource?: boolean;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const faqsBase = createMappedItems<FAQSectionProps>({
  sourceFieldPath: "data.field",
  mappingGroupPath: "faqs",
  sourceLabel: msg("fields.faqs", "FAQs"),
  mappingGroupLabel: msg("fields.faqMapping", "FAQ Mapping"),
  mappings: {
    question: {
      label: msg("fields.question", "Question"),
      types: ["type.string", "type.rich_text_v2"],
      defaultValue: { defaultValue: "" },
    },
    answer: {
      label: msg("fields.answer", "Answer"),
      types: ["type.rich_text_v2"],
      defaultValue: { defaultValue: "" },
    },
  },
}).withConstantValueMode({
  constantValueType: ComponentFields.FAQSection.type,
  defaultConstantValue: [{}, {}, {}],
});

const faqs = faqsBase.withRepeatedSlot({
  slotPath: "slots.CardSlot",
  createItem: (id, index, existingItem) =>
    defaultFAQCardData(
      id,
      index,
      existingItem?.props.styles.questionVariant,
      existingItem?.props.styles.answerVariant,
      existingItem?.props.styles.answerColor
    ) as unknown as ComponentData<FAQCardProps>,
  getParentData: (item, resolvedData) => {
    const locale = i18nComponentsInstance.language || "en";

    return {
      field: resolvedData.props.data.field,
      faq: {
        question: faqsBase.resolveMapping(
          resolvedData.props.faqs?.question,
          item,
          locale
        ) ?? { defaultValue: "" },
        answer: faqsBase.resolveMapping(
          resolvedData.props.faqs?.answer,
          item,
          locale
        ) ?? { defaultValue: "" },
      },
    };
  },
});

const FAQsSectionFields: YextFields<FAQSectionProps> = {
  ...faqs.fields,
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
    ...faqs.defaultProps,
    data: faqs.defaultProps.data!,
    faqs: faqs.defaultProps.faqs!,
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
    const { data: nextData, items } = faqs.resolveItems(data, params);

    return setDeep(
      nextData,
      "props.hasResolvedSource",
      nextData.props.data.constantValueEnabled || items.length > 0
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
