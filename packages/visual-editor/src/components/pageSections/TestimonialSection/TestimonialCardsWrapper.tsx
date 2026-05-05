import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
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
import { resolveMappedListWrapperData } from "../../../utils/cardSlots/mappedListWrapper.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { createMappedItemsConfig } from "../../../utils/cardSlots/createMappedItemsConfig.ts";

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

const testimonialCards = createMappedItemsConfig<TestimonialCardsWrapperProps>({
  sourceFieldPath: "data.field",
  mappingGroupPath: "cards",
  sourceLabel: msg("components.testimonial", "Testimonial"),
  mappingGroupLabel: msg("fields.cards", "Cards"),
  constantValueType: ComponentFields.TestimonialSection.type,
  listFieldName: "testimonials",
  sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
  sourceRootsOnly: true,
  requiredDescendantTypes: [["type.string", "type.rich_text_v2"]],
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
    fields: testimonialCardsWrapperFields as any,
    defaultProps: {
      ...(testimonialCards.defaultProps as Pick<
        TestimonialCardsWrapperProps,
        "data" | "cards"
      >),
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
        ...(testimonialCards.resolveFields(
          data as ComponentData<TestimonialCardsWrapperProps>
        ) as any),
      }),
    resolveData: (data, params) => {
      const locale = i18nComponentsInstance.language || "en";
      const { data: nextData } = testimonialCards.resolve(
        data as ComponentData<TestimonialCardsWrapperProps>,
        params
      );

      return resolveMappedListWrapperData<
        TestimonialCardsWrapperProps,
        TestimonialCardProps,
        Record<string, unknown>,
        {
          backgroundColor?: TestimonialCardProps["styles"]["backgroundColor"];
          slotStyles?: Record<string, any>;
        }
      >({
        data: nextData,
        streamDocument: params.metadata.streamDocument ?? {},
        cardIdPrefix: "TestimonialCard",
        getSharedCardProps: (card) =>
          !card
            ? undefined
            : {
                backgroundColor: card.props.styles.backgroundColor,
                slotStyles: gatherSlotStyles(card.props.slots),
              },
        createCard: (id, index, sharedCardProps) =>
          defaultTestimonialCardSlotData(
            id,
            index,
            sharedCardProps?.backgroundColor,
            sharedCardProps?.slotStyles
          ) as ComponentData<TestimonialCardProps>,
        decorateMappedItemCard: (card, item, index) =>
          setDeep(setDeep(card, "props.index", index), "props.parentData", {
            field: nextData.props.data.field,
            testimonial: {
              description: testimonialCards.resolveMapping<
                TestimonialStruct["description"]
              >(nextData.props.cards?.description, item, locale),
              contributorName: testimonialCards.resolveMapping<
                TestimonialStruct["contributorName"]
              >(nextData.props.cards?.contributorName, item, locale),
              contributionDate: testimonialCards.resolveMapping<
                TestimonialStruct["contributionDate"]
              >(nextData.props.cards?.contributionDate, item, locale),
            },
          } satisfies TestimonialCardProps["parentData"]),
        fallbackToIndex: true,
      });
    },
    render: (props) => <TestimonialCardsWrapperComponent {...props} />,
  };
