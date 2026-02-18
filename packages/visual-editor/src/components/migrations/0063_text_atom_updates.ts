import { Migration } from "../../utils/migrate.ts";
import { translatableToPlainText } from "../../utils/plainText.ts";

const toPlainTextEntityField = (entityField: any) => {
  if (!entityField || typeof entityField !== "object") {
    return entityField;
  }

  return {
    ...entityField,
    constantValue: translatableToPlainText(entityField.constantValue),
  };
};

const toPlainTextParentData = (parentData: any) => {
  if (!parentData || typeof parentData !== "object") {
    return parentData;
  }

  const sourceText = parentData.text ?? parentData.richText;
  const otherParentData = { ...parentData };
  delete otherParentData.richText;

  return {
    ...otherParentData,
    text: translatableToPlainText(sourceText),
  };
};

const convertToTextSlot = (
  slot: any,
  defaultFontStyle: "regular" | "bold" | "italic"
) => {
  if (!slot || typeof slot !== "object") {
    return slot;
  }

  return {
    ...slot,
    type: "TextSlot",
    props: {
      ...slot.props,
      data: {
        ...slot.props?.data,
        text: toPlainTextEntityField(slot.props?.data?.text),
      },
      styles: {
        ...slot.props?.styles,
        fontStyle: slot.props?.styles?.fontStyle ?? defaultFontStyle,
      },
      parentData: toPlainTextParentData(slot.props?.parentData),
    },
  };
};

export const textAtomUpdates: Migration = {
  InsightCard: {
    action: "updated",
    propTransformation: (props) => {
      const categorySlot = props.slots?.CategorySlot?.[0];

      return {
        ...props,
        slots: {
          ...props.slots,
          CategorySlot: categorySlot
            ? [convertToTextSlot(categorySlot, "regular")]
            : props.slots?.CategorySlot,
        },
      };
    },
  },
  ProductCard: {
    action: "updated",
    propTransformation: (props) => {
      const browSlot = props.slots?.BrowSlot?.[0];
      const priceSlot = props.slots?.PriceSlot?.[0];

      return {
        ...props,
        slots: {
          ...props.slots,
          BrowSlot: browSlot
            ? [convertToTextSlot(browSlot, "bold")]
            : props.slots?.BrowSlot,
          PriceSlot: priceSlot
            ? [convertToTextSlot(priceSlot, "bold")]
            : props.slots?.PriceSlot,
        },
      };
    },
  },
  TeamCard: {
    action: "updated",
    propTransformation: (props) => {
      const titleSlot = props.slots?.TitleSlot?.[0];

      return {
        ...props,
        slots: {
          ...props.slots,
          TitleSlot: titleSlot
            ? [convertToTextSlot(titleSlot, "regular")]
            : props.slots?.TitleSlot,
        },
      };
    },
  },
  FAQCard: {
    action: "updated",
    propTransformation: (props) => {
      return {
        ...props,
        data: {
          ...props.data,
          question: toPlainTextEntityField(props.data?.question),
        },
        parentData: props.parentData
          ? {
              ...props.parentData,
              faq: props.parentData.faq
                ? {
                    ...props.parentData.faq,
                    question:
                      translatableToPlainText(props.parentData.faq.question) ??
                      "",
                  }
                : props.parentData.faq,
            }
          : props.parentData,
      };
    },
  },
};
