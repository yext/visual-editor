import { PuckComponent, Slot, SlotComponent } from "@puckeditor/core";
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
import { FAQStruct } from "../../../types/types.ts";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultFAQCardData, FAQCardProps } from "./FAQCard.tsx";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import { EntityFieldSectionEmptyStateBox } from "../EntityFieldSectionEmptyState.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import { MappedEntityFieldConditionalRender } from "../entityFieldSectionUtils.ts";
import { createSlottedItemSource } from "../../../utils/itemSource/index.ts";

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

export const faqCardsSource = createSlottedItemSource<FAQStruct, FAQCardProps>({
  label: msg("fields.faqs", "FAQs"),
  itemLabel: "FAQ",
  cardName: "FAQCard",
  defaultItemProps: defaultFAQCardData().props,
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
    ...faqCardsSource.defaultWrapperProps,
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
      CardSlot: faqCardsSource.defaultWrapperProps.slots.CardSlot,
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
  resolveData: (data, params) =>
    faqCardsSource.populateSlots(data, params.metadata.streamDocument),
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
