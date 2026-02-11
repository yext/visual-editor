import * as React from "react";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Body, BodyProps } from "../../atoms/body.tsx";
import { FAQStruct, TranslatableRichText } from "../../../types/types.ts";
import { getDefaultRTF } from "../../../editor/TranslatableRichTextField.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";
import { resolveDataFromParent } from "../../../editor/ParentData.tsx";
import { useBackground } from "../../../hooks/useBackground.tsx";
import { useDocument } from "../../../hooks/useDocument.tsx";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../atoms/accordion.tsx";
import { useAnalytics } from "@yext/pages-components";
import { useTranslation } from "react-i18next";
import { useCardContext } from "../../../hooks/useCardContext.tsx";
import { useGetCardSlots } from "../../../hooks/useGetCardSlots.tsx";
import { BackgroundStyle } from "../../../utils/themeConfigOptions.ts";

const defaultFAQ = {
  question: {
    en: getDefaultRTF("Question Lorem ipsum dolor sit amet?"),
    hasLocalizedValue: "true",
  },
  answer: {
    en: getDefaultRTF(
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."
    ),
    hasLocalizedValue: "true",
  },
} satisfies FAQStruct;

export const defaultFAQCardData = (
  id?: string,
  index?: number,
  questionVariant?: BodyProps["variant"],
  answerVariant?: BodyProps["variant"],
  answerColor?: BackgroundStyle
) => ({
  type: "FAQCard",
  props: {
    ...(id && { id }),
    ...(index !== undefined && { index }),
    data: {
      question: {
        constantValueEnabled: true,
        constantValue: defaultFAQ.question,
        field: "",
      },
      answer: {
        constantValueEnabled: true,
        constantValue: defaultFAQ.answer,
        field: "",
      },
    },
    styles: {
      questionVariant: questionVariant || "base",
      answerVariant: answerVariant || "base",
      answerColor: answerColor,
    },
  },
});

export type FAQCardProps = {
  data: {
    question: YextEntityField<TranslatableRichText>;
    answer: YextEntityField<TranslatableRichText>;
  };

  /** Styling for all the FAQ cards. */
  styles: {
    questionVariant: BodyProps["variant"];
    answerVariant: BodyProps["variant"];
    answerColor?: BackgroundStyle;
  };

  /** @internal */
  slots: {};

  /** @internal */
  parentData?: {
    field: string;
    faq: FAQStruct;
  };

  /** @internal */
  index?: number;
};

const FAQCardFields: Fields<FAQCardProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      question: YextField(msg("fields.question", "Question"), {
        type: "entityField",
        filter: {
          types: ["type.rich_text_v2"],
        },
      }),
      answer: YextField(msg("fields.answer", "Answer"), {
        type: "entityField",
        filter: {
          types: ["type.rich_text_v2"],
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      questionVariant: YextField(
        msg("fields.questionVariant", "Question Variant"),
        {
          type: "radio",
          options: "BODY_VARIANT",
        }
      ),
      answerVariant: YextField(msg("fields.answerVariant", "Answer Variant"), {
        type: "radio",
        options: "BODY_VARIANT",
      }),
      answerColor: YextField(msg("fields.answerColor", "Answer Color"), {
        type: "select",
        options: "SITE_COLOR",
      }),
    },
  }),
  slots: {
    type: "object",
    objectFields: {},
    visible: false,
  },
};

const FAQCardComponent: PuckComponent<FAQCardProps> = (props) => {
  const { data, styles, parentData, index, puck } = props;
  const analytics = useAnalytics();
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const background = useBackground();

  const { sharedCardProps, setSharedCardProps } = useCardContext<{
    questionVariant: BodyProps["variant"];
    answerVariant: BodyProps["variant"];
    answerColor?: BackgroundStyle;
  }>();

  const { getPuck } = useGetCardSlots<FAQCardProps>(props.id);

  // When the context changes, dispatch an update to sync the changes to puck
  React.useEffect(() => {
    if (!puck.isEditing || !sharedCardProps || !getPuck) {
      return;
    }

    if (
      sharedCardProps.questionVariant === styles.questionVariant &&
      sharedCardProps.answerVariant === styles.answerVariant &&
      sharedCardProps.answerColor === styles.answerColor
    ) {
      return;
    }

    const { dispatch, getSelectorForId } = getPuck();
    const selector = getSelectorForId(props.id);
    if (!selector) {
      return;
    }

    // oxlint-disable-next-line no-unused-vars: remove props.puck before dispatching to avoid writing it to the saved data
    const { puck: _, editMode: __, ...otherProps } = props;
    dispatch({
      type: "replace" as const,
      destinationIndex: selector.index,
      destinationZone: selector.zone,
      data: {
        type: "FAQCard",
        props: {
          ...otherProps,
          styles: {
            questionVariant: sharedCardProps.questionVariant,
            answerVariant: sharedCardProps.answerVariant,
            answerColor: sharedCardProps.answerColor,
          },
        } satisfies FAQCardProps,
      },
    });
  }, [
    sharedCardProps?.answerVariant,
    sharedCardProps?.questionVariant,
    sharedCardProps?.answerColor,
  ]);

  // When the card's shared props change, update the context
  React.useEffect(() => {
    if (!puck.isEditing) {
      return;
    }

    if (
      sharedCardProps?.questionVariant === styles.questionVariant &&
      sharedCardProps?.answerVariant === styles.answerVariant &&
      sharedCardProps?.answerColor === styles.answerColor
    ) {
      return;
    }

    setSharedCardProps({
      questionVariant: styles.questionVariant,
      answerVariant: styles.answerVariant,
      answerColor: styles.answerColor,
    });
  }, [styles]);

  const sourceQuestion = parentData ? parentData?.faq.question : data.question;
  const resolvedQuestion = sourceQuestion
    ? resolveComponentData(sourceQuestion, i18n.language, streamDocument, {
        variant: styles.questionVariant,
        isDarkBackground: background?.isDarkBackground,
      })
    : undefined;

  const sourceAnswer = parentData ? parentData?.faq.answer : data.answer;
  const resolvedAnswer = sourceAnswer
    ? resolveComponentData(sourceAnswer, i18n.language, streamDocument, {
        variant: styles.answerVariant,
        isDarkBackground: background?.isDarkBackground,
        color: styles.answerColor,
      })
    : undefined;

  return (
    <AccordionItem
      key={index}
      data-ya-action={
        analytics?.getDebugEnabled() ? "EXPAND/COLLAPSE" : undefined
      }
      data-ya-eventname={
        analytics?.getDebugEnabled() ? `toggleFAQ${index}` : undefined
      }
      onToggle={(e) =>
        e.currentTarget.open // the updated state after toggling
          ? analytics?.track({
              action: "EXPAND",
              eventName: `toggleFAQ${index}`,
            })
          : analytics?.track({
              action: "COLLAPSE",
              eventName: `toggleFAQ${index}`,
            })
      }
    >
      <AccordionTrigger>
        <Body variant={styles.questionVariant}>{resolvedQuestion}</Body>
      </AccordionTrigger>
      <AccordionContent>
        <Body variant={styles.answerVariant}>{resolvedAnswer}</Body>
      </AccordionContent>
    </AccordionItem>
  );
};

export const FAQCard: ComponentConfig<{ props: FAQCardProps }> = {
  label: msg("faq", "FAQ"),
  fields: FAQCardFields,
  defaultProps: {
    data: {
      question: {
        constantValueEnabled: true,
        constantValue: defaultFAQ.question,
        field: "",
      },
      answer: {
        constantValueEnabled: true,
        constantValue: defaultFAQ.answer,
        field: "",
      },
    },
    styles: {
      questionVariant: "base",
      answerVariant: "base",
    },
    slots: {},
  },
  resolveFields: (data) => resolveDataFromParent(FAQCardFields, data),
  render: (props) => <FAQCardComponent {...props} />,
};
