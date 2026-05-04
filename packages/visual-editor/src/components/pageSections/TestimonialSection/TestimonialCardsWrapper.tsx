import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import {
  TestimonialSectionType,
  TestimonialStruct,
} from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  cardWrapperFields,
  CardWrapperType,
  createMappedSubfieldFields,
} from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import {
  defaultTestimonialCardSlotData,
  TestimonialCardProps,
} from "./TestimonialCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { YextComponentConfig } from "../../../fields/fields.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import {
  resolveMappedListFields,
  resolveMappedListWrapperData,
} from "../../../utils/cardSlots/mappedListWrapper.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { resolveMappedSourceField } from "../../../utils/cardSlots/mappedSource.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";

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

const createTestimonialCardsMappingFields = (sourceField?: string) =>
  createMappedSubfieldFields(msg("fields.cards", "Cards"), sourceField, {
    description: {
      label: msg("fields.description", "Description"),
      types: ["type.string", "type.rich_text_v2"],
    },
    contributorName: {
      label: msg("fields.contributorName", "Contributor Name"),
      types: ["type.string"],
    },
    contributionDate: {
      label: msg("fields.contributionDate", "Contribution Date"),
      types: ["type.datetime"],
      disableConstantValueToggle: true,
    },
  });

const createTestimonialCardsWrapperFields = (sourceField?: string) => ({
  ...cardWrapperFields<TestimonialCardsWrapperProps>({
    label: msg("components.testimonial", "Testimonial"),
    entityFieldType: ComponentFields.TestimonialSection.type,
    listFieldName: "testimonials",
    sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
    sourceRootsOnly: true,
    requiredDescendantTypes: [["type.string", "type.rich_text_v2"]],
  }),
  cards: createTestimonialCardsMappingFields(sourceField) as any,
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
});

const testimonialCardsWrapperFields = createTestimonialCardsWrapperFields();

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
      cards: {
        description: {
          field: "",
          constantValue: { defaultValue: "" },
          constantValueEnabled: false,
        },
        contributorName: {
          field: "",
          constantValue: { defaultValue: "" },
          constantValueEnabled: false,
        },
        contributionDate: {
          field: "",
          constantValue: "",
          constantValueEnabled: false,
        },
      },
      styles: {
        showName: true,
        showDate: true,
      },
    },
    resolveFields: (data, params) =>
      resolveMappedListFields({
        data: data as ComponentData<TestimonialCardsWrapperProps>,
        streamDocument: params.metadata.streamDocument ?? {},
        listFieldName: "testimonials",
        createFields: createTestimonialCardsWrapperFields,
        mappingFieldName: "cards",
        createMappingFields: createTestimonialCardsMappingFields,
      }),
    resolveData: (data, params) => {
      const locale = i18nComponentsInstance.language || "en";
      return resolveMappedListWrapperData<
        TestimonialCardsWrapperProps,
        TestimonialCardProps,
        Record<string, unknown>,
        TestimonialSectionType["testimonials"][number],
        {
          backgroundColor?: TestimonialCardProps["styles"]["backgroundColor"];
          slotStyles?: Record<string, any>;
        }
      >({
        data: data as ComponentData<TestimonialCardsWrapperProps>,
        streamDocument: params.metadata.streamDocument ?? {},
        listFieldName: "testimonials",
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
            field: data.props.data.field,
            testimonial: {
              description: resolveMappedSourceField<
                TestimonialStruct["description"]
              >(
                item,
                data.props.data.field,
                data.props.cards?.description,
                locale
              ),
              contributorName: resolveMappedSourceField<
                TestimonialStruct["contributorName"]
              >(
                item,
                data.props.data.field,
                data.props.cards?.contributorName,
                locale
              ),
              contributionDate: resolveMappedSourceField<
                TestimonialStruct["contributionDate"]
              >(
                item,
                data.props.data.field,
                data.props.cards?.contributionDate,
                locale
              ),
            },
          } satisfies TestimonialCardProps["parentData"]),
        decorateSectionItemCard: (card, testimonial, index) =>
          setDeep(setDeep(card, "props.index", index), "props.parentData", {
            field: data.props.data.field,
            testimonial,
          } satisfies TestimonialCardProps["parentData"]),
        fallbackToIndex: true,
      });
    },
    render: (props) => <TestimonialCardsWrapperComponent {...props} />,
  };
