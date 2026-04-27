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
import { EntityFieldSectionEmptyState } from "../EntityFieldSectionEmptyState.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";

export interface FAQStyles {
  backgroundColor?: ThemeColor;
  showSectionHeading: boolean;
}

export interface FAQSectionProps {
  data: Omit<YextEntityField<FAQSectionType>, "constantValue"> & {
    constantValue: {
      id?: string;
    }[];
  };

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
  conditionalRender?: {
    isMappedContentEmpty?: boolean;
  };

  liveVisibility: boolean;
}

const FAQsSectionFields: YextFields<FAQSectionProps> = {
  data: YextField(msg("fields.faqs", "FAQs"), {
    type: "entityField",
    filter: {
      types: [ComponentFields.FAQSection.type],
    },
  }),
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
    const streamDocument = params.metadata.streamDocument;
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
        const updatedData = setDeep(data, "props.slots.CardSlot", []);
        return {
          ...updatedData,
          props: {
            ...updatedData.props,
            conditionalRender: {
              isMappedContentEmpty: true,
            },
          },
        };
      }

      const requiredLength = resolvedFAQs.length;
      const currentLength = data.props.slots.CardSlot.length;
      const cardsToAdd =
        currentLength < requiredLength
          ? Array(requiredLength - currentLength)
              .fill(null)
              .map(() =>
                defaultFAQCardData(
                  `FAQCard-${crypto.randomUUID()}`,
                  undefined,
                  sharedCardProps?.questionVariant,
                  sharedCardProps?.answerVariant,
                  sharedCardProps?.answerColor
                )
              )
          : [];
      const updatedCardSlot = [
        ...data.props.slots.CardSlot,
        ...cardsToAdd,
      ].slice(0, requiredLength) as ComponentData<FAQCardProps>[];

      const updatedData = setDeep(
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

      return {
        ...updatedData,
        props: {
          ...updatedData.props,
          conditionalRender: undefined,
        },
      };
    }

    let updatedData = data;
    const inUseIds = new Set<string>();
    const newSlots = data.props.data.constantValue.map(({ id }, i) => {
      const existingCard = id
        ? (data.props.slots.CardSlot.find(
            (slot) => slot.props.id === id
          ) as ComponentData<FAQCardProps>)
        : undefined;

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

    return {
      ...updatedData,
      props: {
        ...updatedData.props,
        conditionalRender: undefined,
      },
    };
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
              <EntityFieldSectionEmptyState
                backgroundColor={props.styles.backgroundColor}
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
