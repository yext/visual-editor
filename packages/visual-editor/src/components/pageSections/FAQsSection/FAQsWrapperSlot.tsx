import {
  ComponentConfig,
  ComponentData,
  Fields,
  PuckComponent,
  setDeep,
} from "@measured/puck";
import {
  ComponentFields,
  FAQSectionType,
  msg,
  resolveYextEntityField,
  YextField,
} from "@yext/visual-editor";
import { Accordion } from "../../atoms/accordion";
import { defaultFAQSlotData, FAQSlotProps } from "./FAQSlot";
import { CardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers";

export type FAQsWrapperSlotProps = CardWrapperType<FAQSectionType>;

const FAQsWrapperSlotFields: Fields<FAQsWrapperSlotProps> = {
  data: YextField(msg("fields.faqs", "FAQs"), {
    type: "entityField",
    filter: {
      types: [ComponentFields.FAQSection.type],
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
};

const FAQsWrapperSlotComponent: PuckComponent<FAQsWrapperSlotProps> = (
  props
) => {
  const { slots } = props;

  return (
    <Accordion>
      <slots.CardSlot style={{ height: "auto" }} />
    </Accordion>
  );
};

export const FAQsWrapperSlot: ComponentConfig<{ props: FAQsWrapperSlotProps }> =
  {
    label: msg("components.faqsSection", "FAQs Section"),
    fields: FAQsWrapperSlotFields,
    resolveData(data, params) {
      const streamDocument = params.metadata.streamDocument;
      const locale = streamDocument?.locale;

      if (!streamDocument || !locale) {
        return data;
      }

      if (!data.props.data.constantValueEnabled && data.props.data.field) {
        const resolvedFAQs = resolveYextEntityField<
          FAQSectionType | { faqs: undefined }
        >(
          streamDocument,
          {
            ...data.props.data,
            constantValue: { faqs: undefined },
          },
          locale
        )?.faqs;

        if (!resolvedFAQs || resolvedFAQs.length === 0) {
          return setDeep(data, "props.slots.CardSlot", []);
        }

        return setDeep(
          data,
          "props.slots.CardSlot",
          data.props.slots.CardSlot.slice(0, resolvedFAQs.length).map(
            (faq, i) => {
              faq.props.index = i;
              return setDeep(faq, "props.parentData", {
                field: data.props.data.field,
                faq: resolvedFAQs[i],
              } satisfies FAQSlotProps["parentData"]);
            }
          )
        );
      } else {
        const inUseIds = new Set<string>();
        const newSlots = data.props.data.constantValue.map(({ id }, i) => {
          const existingCard = id
            ? (data.props.slots.CardSlot.find(
                (slot) => slot.props.id === id
              ) as ComponentData<FAQSlotProps>)
            : undefined;

          let newCard = existingCard
            ? (JSON.parse(JSON.stringify(existingCard)) as typeof existingCard)
            : undefined;

          let newId = newCard?.props.id || `FAQSlot-${crypto.randomUUID()}`;

          if (newCard && inUseIds.has(newId)) {
            newId = `FAQSlot-${crypto.randomUUID()}`;
            Object.entries(newCard.props.slots).forEach(
              ([slotKey, slotArray]) => {
                slotArray[0].props.id = newId + "-" + slotKey;
              }
            );
          }
          inUseIds.add(newId);

          if (!newCard) {
            return defaultFAQSlotData(newId, i);
          }

          newCard = setDeep(newCard, "props.id", newId);
          newCard = setDeep(newCard, "props.index", i);
          newCard = setDeep(newCard, "props.parentData", undefined);
          return newCard;
        });

        data = setDeep(data, "props.slots.CardSlot", newSlots);
        data = setDeep(
          data,
          "props.data.constantValue",
          newSlots.map((card) => ({ id: card.props.id }))
        );
      }

      return data;
    },
    render: (props) => <FAQsWrapperSlotComponent {...props} />,
  };
