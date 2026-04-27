import { ComponentData, PuckComponent, setDeep, Slot } from "@puckeditor/core";
import {
  TestimonialSectionType,
  TestimonialStruct,
} from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { resolveYextEntityField } from "../../../utils/resolveYextEntityField.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  defaultTestimonialCardSlotData,
  TestimonialCardProps,
} from "./TestimonialCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  createListSourceField,
  type ListSourceFieldValue,
} from "../../../editor/ListSourceField.tsx";
import { TESTIMONIAL_SECTION_CONSTANT_CONFIG } from "../../../internal/puck/constant-value-fields/TestimonialSection.tsx";
import {
  buildListSectionCards,
  resolveListSectionItems,
} from "../../../utils/cardSlots/listSectionData.ts";

export type TestimonialCardsWrapperProps = {
  data: ListSourceFieldValue;
  slots: {
    CardSlot: Slot;
  };
  styles: {
    /**
     * Whether to show the name slot in the testimonial cards.
     * @defaultValue true
     */
    showName: boolean;

    /**
     * Whether to show the date slot in the testimonial cards.
     * @defaultValue true
     */
    showDate: boolean;
  };
};

const testimonialCardsWrapperFields: YextFields<TestimonialCardsWrapperProps> =
  {
    data: createListSourceField({
      label: msg("components.testimonial", "Testimonial"),
      legacySourceFilter: {
        types: [ComponentFields.TestimonialSection.type],
      },
      constantField: TESTIMONIAL_SECTION_CONSTANT_CONFIG,
      mappingConfigs: [
        {
          key: "description",
          label: msg("fields.showDescription", "Description"),
          preferredFieldNames: ["description", "quote"],
          types: ["type.rich_text_v2"],
        },
        {
          key: "contributorName",
          label: msg("fields.showName", "Show Name"),
          preferredFieldNames: ["contributorName", "name"],
          required: false,
          types: ["type.string"],
        },
        {
          key: "contributionDate",
          label: msg("fields.showDate", "Show Date"),
          preferredFieldNames: ["contributionDate", "date"],
          required: false,
          types: ["type.datetime"],
        },
      ],
    }),
    styles: YextField(msg("fields.styles", "Styles"), {
      type: "object",
      objectFields: {
        showName: {
          label: msg("fields.showName", "Show Name"),
          type: "radio",
          options: ThemeOptions.SHOW_HIDE,
        },
        showDate: {
          label: msg("fields.showDate", "Show Date"),
          type: "radio",
          options: ThemeOptions.SHOW_HIDE,
        },
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

const TestimonialCardsWrapperComponent: PuckComponent<
  TestimonialCardsWrapperProps
> = (props) => {
  const { slots } = props;

  return (
    <CardContextProvider>
      <slots.CardSlot
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center"
        allow={[]}
      />
    </CardContextProvider>
  );
};

export const TestimonialCardsWrapper: YextComponentConfig<TestimonialCardsWrapperProps> =
  {
    label: msg("components.testimonialCardsWrapper", "Testimonial Cards"),
    fields: testimonialCardsWrapperFields,
    defaultProps: {
      data: {
        field: "",
        constantValueEnabled: true,
        constantValue: [],
      },
      slots: {
        CardSlot: [],
      },
      styles: {
        showName: true,
        showDate: true,
      },
    },
    resolveData: (data, params) => {
      const streamDocument = params.metadata.streamDocument;
      if (!streamDocument) {
        return data;
      }
      const sharedCardProps =
        data.props.slots.CardSlot.length === 0
          ? undefined
          : {
              backgroundColor:
                data.props.slots.CardSlot[0].props.styles.backgroundColor,
              slotStyles: gatherSlotStyles(
                data.props.slots.CardSlot[0].props.slots
              ),
            };

      if (!data?.props?.data) {
        return data;
      }

      if (!data.props.data.constantValueEnabled && data.props.data.field) {
        const { items: resolvedTestimonials, requiredLength } =
          resolveListSectionItems<TestimonialStruct>({
            buildMappedItem: (resolvedItemFields) => ({
              description:
                resolvedItemFields.description as TestimonialStruct["description"],
              contributorName:
                typeof resolvedItemFields.contributorName === "string"
                  ? resolvedItemFields.contributorName
                  : undefined,
              contributionDate:
                typeof resolvedItemFields.contributionDate === "string"
                  ? resolvedItemFields.contributionDate
                  : undefined,
            }),
            data: data.props.data,
            isValidItem: (testimonial) => Boolean(testimonial.description),
            resolveLegacyItems: () =>
              resolveYextEntityField<Partial<TestimonialSectionType>>(
                streamDocument,
                {
                  ...data.props.data,
                  constantValue: { testimonials: undefined },
                },
                i18nComponentsInstance.language || "en"
              )?.testimonials,
            streamDocument,
          });

        if (!requiredLength || !resolvedTestimonials) {
          return setDeep(data, "props.slots.CardSlot", []);
        }

        return setDeep(
          data,
          "props.slots.CardSlot",
          buildListSectionCards<TestimonialCardProps, TestimonialStruct>({
            currentCards: data.props.slots
              .CardSlot as ComponentData<TestimonialCardProps>[],
            createCard: () =>
              defaultTestimonialCardSlotData(
                `TestimonialCard-${crypto.randomUUID()}`,
                undefined,
                sharedCardProps?.backgroundColor,
                sharedCardProps?.slotStyles
              ) as ComponentData<TestimonialCardProps>,
            decorateCard: (card, testimonial, index) =>
              setDeep(setDeep(card, "props.index", index), "props.parentData", {
                field: data.props.data.field,
                testimonial,
              } satisfies TestimonialCardProps["parentData"]) as ComponentData<TestimonialCardProps>,
            items: resolvedTestimonials,
          })
        );
      } else {
        let updatedData = data;

        if (!Array.isArray(data.props.data.constantValue)) {
          updatedData = setDeep(updatedData, "props.data.constantValue", []);
          return updatedData;
        }

        const inUseIds = new Set<string>();
        const newSlots = data.props.data.constantValue.map(({ id }, i) => {
          const existingCard = id
            ? (data.props.slots.CardSlot.find(
                (slot) => slot.props.id === id
              ) as ComponentData<TestimonialCardProps>)
            : (data.props.slots.CardSlot[i] as
                | ComponentData<TestimonialCardProps>
                | undefined);

          let newCard = existingCard
            ? (JSON.parse(JSON.stringify(existingCard)) as typeof existingCard)
            : undefined;

          let newId =
            newCard?.props.id || `TestimonialCard-${crypto.randomUUID()}`;

          if (newCard && inUseIds.has(newId)) {
            newId = `TestimonialCard-${crypto.randomUUID()}`;
            Object.entries(newCard.props.slots).forEach(
              ([slotKey, slotArray]) => {
                slotArray[0].props.id = newId + "-" + slotKey;
              }
            );
          }
          inUseIds.add(newId);

          if (!newCard) {
            return defaultTestimonialCardSlotData(
              newId,
              i,
              sharedCardProps?.backgroundColor,
              sharedCardProps?.slotStyles
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
        return updatedData;
      }
    },
    render: (props) => <TestimonialCardsWrapperComponent {...props} />,
  };
