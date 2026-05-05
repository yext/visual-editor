import { ComponentData, PuckComponent } from "@puckeditor/core";
import {
  TestimonialSectionType,
  TestimonialStruct,
} from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { CardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import {
  defaultTestimonialCardSlotData,
  TestimonialCardProps,
} from "./TestimonialCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { toPuckFields, YextComponentConfig } from "../../../fields/fields.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { createMappedItems } from "../../../utils/cardSlots/createMappedItems.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";

export type TestimonialCardsWrapperProps =
  CardWrapperType<TestimonialSectionType> & {
    cards?: {
      description: YextEntityField<TestimonialStruct["description"]>;
      contributorName: YextEntityField<TestimonialStruct["contributorName"]>;
      contributionDate: YextEntityField<TestimonialStruct["contributionDate"]>;
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

const testimonialCardsBase = createMappedItems<TestimonialCardsWrapperProps>({
  sourceFieldPath: "data.field",
  mappingGroupPath: "cards",
  sourceLabel: msg("components.testimonial", "Testimonial"),
  mappingGroupLabel: msg("fields.cards", "Cards"),
  mappings: {
    description: {
      label: msg("fields.description", "Description"),
      types: ["type.string", "type.rich_text_v2"],
      defaultValue: { defaultValue: "" },
    },
    contributorName: {
      label: msg("fields.contributorName", "Contributor Name"),
      types: ["type.string"],
      defaultValue: { defaultValue: "" },
    },
    contributionDate: {
      label: msg("fields.contributionDate", "Contribution Date"),
      types: ["type.datetime"],
      defaultValue: "",
      disableConstantValueToggle: true,
    },
  },
}).withConstantValueMode({
  constantValueType: ComponentFields.TestimonialSection.type,
});

const testimonialCards = testimonialCardsBase.withRepeatedSlot({
  slotPath: "slots.CardSlot",
  createItem: (id, index, existingItem) =>
    defaultTestimonialCardSlotData(
      id,
      index,
      existingItem?.props.styles.backgroundColor,
      existingItem ? gatherSlotStyles(existingItem.props.slots) : undefined
    ) as unknown as ComponentData<TestimonialCardProps>,
  getParentData: (item, resolvedData) => {
    const locale = i18nComponentsInstance.language || "en";
    const contributorName = testimonialCardsBase.resolveMapping<
      TestimonialStruct["contributorName"]
    >(resolvedData.props.cards?.contributorName, item, locale);

    return {
      field: resolvedData.props.data.field,
      testimonial: {
        description: testimonialCardsBase.resolveMapping<
          TestimonialStruct["description"]
        >(resolvedData.props.cards?.description, item, locale),
        contributorName: contributorName
          ? resolveComponentData(contributorName, locale, item)
          : undefined,
        contributionDate: testimonialCardsBase.resolveMapping<
          TestimonialStruct["contributionDate"]
        >(resolvedData.props.cards?.contributionDate, item, locale),
      },
    };
  },
});

const testimonialCardsWrapperFields = {
  ...testimonialCards.fields,
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
};

const TestimonialCardsWrapperComponent: PuckComponent<
  TestimonialCardsWrapperProps
> = ({ slots }) => {
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
      ...testimonialCards.defaultProps,
      data: testimonialCards.defaultProps.data!,
      cards: testimonialCards.defaultProps.cards!,
      slots: {
        CardSlot: [],
      },
      styles: {
        showName: true,
        showDate: true,
      },
    },
    resolveFields: (data) =>
      toPuckFields({
        ...testimonialCardsWrapperFields,
        ...testimonialCards.resolveFields(data),
      }),
    resolveData: (data, params) =>
      testimonialCards.resolveItems(data, params).data,
    render: (props) => <TestimonialCardsWrapperComponent {...props} />,
  };
