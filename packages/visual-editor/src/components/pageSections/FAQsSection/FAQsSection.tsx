import {
  ComponentConfig,
  ComponentData,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
} from "@puckeditor/core";
import {
  backgroundColors,
  BackgroundStyle,
} from "../../../utils/themeConfigOptions";
import { PageSection } from "../../atoms/pageSection";
import { YextField } from "../../../editor/YextField";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper";
import { msg } from "../../../utils/i18n/platform";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics";
import { HeadingTextProps } from "../../contentBlocks/HeadingText";
import { FAQSectionType } from "../../../types/types";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector";
import { ComponentFields } from "../../../types/fields";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField";
import { i18nComponentsInstance } from "../../../utils/i18n/components";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultFAQCardData, FAQCardProps } from "./FAQCard.tsx";
import { CardContextProvider } from "../../../hooks/useCardContext";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary";

export interface FAQStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: BackgroundStyle;
}

export interface FAQSectionProps {
  data: Omit<YextEntityField<FAQSectionType>, "constantValue"> & {
    constantValue: {
      id?: string;
    }[];
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

const FAQsSectionFields: Fields<FAQSectionProps> = {
  data: YextField(msg("fields.faqs", "FAQs"), {
    type: "entityField",
    filter: {
      types: [ComponentFields.FAQSection.type],
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
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
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

const FAQsSectionComponent: PuckComponent<FAQSectionProps> = ({
  styles,
  slots,
}) => {
  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8 md:gap-12"
    >
      <slots.HeadingSlot style={{ height: "auto" }} />
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
export const FAQSection: ComponentConfig<{ props: FAQSectionProps }> = {
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
                constantValue: {
                  en: "Frequently Asked Questions",
                  hasLocalizedValue: "true",
                },
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
    styles: {
      backgroundColor: backgroundColors.background2.value,
    },
    liveVisibility: true,
    analytics: {
      scope: "faqsSection",
    },
  },
  resolveData: (data, params) => {
    const streamDocument = params.metadata.streamDocument;
    const sharedCardProps =
      data.props.slots.CardSlot.length === 0
        ? undefined
        : {
            questionVariant:
              data.props.slots.CardSlot[0].props.styles.questionVariant,
            answerVariant:
              data.props.slots.CardSlot[0].props.styles.answerVariant,
          };

    if (!data.props.data.constantValueEnabled && data.props.data.field) {
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

      const requiredLength = resolvedFAQs.length;
      const currentLength = data.props.slots.CardSlot.length;
      // If CardSlot is shorter, create an array of placeholder cards and append them.
      // If CardSlot is longer or equal, this will just be an empty array.
      const cardsToAdd =
        currentLength < requiredLength
          ? Array(requiredLength - currentLength)
              .fill(null)
              .map(() =>
                defaultFAQCardData(
                  `FAQCard-${crypto.randomUUID()}`,
                  undefined,
                  sharedCardProps?.questionVariant,
                  sharedCardProps?.answerVariant
                )
              )
          : [];
      const updatedCardSlot = [
        ...data.props.slots.CardSlot,
        ...cardsToAdd,
      ].slice(0, requiredLength) as ComponentData<FAQCardProps>[];

      return setDeep(
        data,
        "props.slots.CardSlot",
        updatedCardSlot.map((card, i) => {
          card.props.index = i;
          return setDeep(card, "props.parentData", {
            field: data.props.data.field,
            faq: resolvedFAQs[i],
          } satisfies FAQCardProps["parentData"]);
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
            sharedCardProps?.answerVariant
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
