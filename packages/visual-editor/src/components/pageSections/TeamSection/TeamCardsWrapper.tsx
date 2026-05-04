import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { PersonStruct, TeamSectionType } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  cardWrapperFields,
  CardWrapperType,
  createMappedSubfieldFields,
} from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { defaultTeamCardSlotData, TeamCardProps } from "./TeamCard.tsx";
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

export type TeamCardsWrapperProps = CardWrapperType<TeamSectionType> & {
  cards?: {
    headshot: YextEntityField<PersonStruct["headshot"]>;
    name: YextEntityField<PersonStruct["name"]>;
    title: YextEntityField<PersonStruct["title"]>;
    phoneNumber: YextEntityField<PersonStruct["phoneNumber"]>;
    email: YextEntityField<PersonStruct["email"]>;
    cta: YextEntityField<PersonStruct["cta"]>;
  };
  styles: {
    showImage: boolean;
    showTitle: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showCTA: boolean;
  };
};

const defaultPersonCta = {
  label: { defaultValue: "" },
  link: "",
  linkType: "URL",
  ctaType: "textAndLink",
} satisfies PersonStruct["cta"];

const createTeamCardsMappingFields = (sourceField?: string) =>
  createMappedSubfieldFields(msg("fields.cards", "Cards"), sourceField, {
    headshot: {
      label: msg("fields.headshot", "Headshot"),
      types: ["type.image"],
      disableConstantValueToggle: true,
    },
    name: {
      label: msg("fields.name", "Name"),
      types: ["type.string"],
    },
    title: {
      label: msg("fields.title", "Title"),
      types: ["type.string", "type.rich_text_v2"],
    },
    phoneNumber: {
      label: msg("fields.phone", "Phone"),
      types: ["type.phone", "type.string"],
    },
    email: {
      label: msg("fields.email", "Email"),
      types: ["type.string"],
    },
    cta: {
      label: msg("fields.cta", "CTA"),
      types: ["type.cta"],
    },
  });

const createTeamCardsWrapperFields = (sourceField?: string) => ({
  ...cardWrapperFields<TeamCardsWrapperProps>({
    label: msg("components.team", "Team"),
    entityFieldType: ComponentFields.TeamSection.type,
    listFieldName: "people",
    sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
    sourceRootsOnly: true,
    requiredDescendantTypes: [["type.string"]],
  }),
  cards: createTeamCardsMappingFields(sourceField) as any,
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      showImage: {
        label: msg("fields.showImage", "Show Image"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showTitle: {
        label: msg("fields.showTitle", "Show Title"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showPhone: {
        label: msg("fields.showPhone", "Show Phone"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showEmail: {
        label: msg("fields.showEmail", "Show Email"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
      showCTA: {
        label: msg("fields.showCTA", "Show CTA"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
    },
  }),
});

const teamCardsWrapperFields = createTeamCardsWrapperFields();

const TeamCardsWrapperComponent: PuckComponent<TeamCardsWrapperProps> = (
  props
) => {
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

export const TeamCardsWrapper: YextComponentConfig<TeamCardsWrapperProps> = {
  label: msg("components.teamCardsWrapper", "Team Cards"),
  fields: teamCardsWrapperFields,
  defaultProps: {
    data: {
      field: "",
      constantValueEnabled: true,
      constantValue: [],
    },
    styles: {
      showImage: true,
      showTitle: true,
      showPhone: true,
      showEmail: true,
      showCTA: true,
    },
    cards: {
      headshot: {
        field: "",
        constantValue: undefined,
        constantValueEnabled: false,
      },
      name: {
        field: "",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      title: {
        field: "",
        constantValue: { defaultValue: "" },
        constantValueEnabled: false,
      },
      phoneNumber: {
        field: "",
        constantValue: "",
        constantValueEnabled: false,
      },
      email: {
        field: "",
        constantValue: "",
        constantValueEnabled: false,
      },
      cta: {
        field: "",
        constantValue: defaultPersonCta,
        constantValueEnabled: false,
      },
    },
    slots: {
      CardSlot: [],
    },
  },
  resolveFields: (data, params) =>
    resolveMappedListFields({
      data: data as ComponentData<TeamCardsWrapperProps>,
      streamDocument: params.metadata.streamDocument ?? {},
      listFieldName: "people",
      createFields: createTeamCardsWrapperFields,
      mappingFieldName: "cards",
      createMappingFields: createTeamCardsMappingFields,
    }),
  resolveData: (data, params) => {
    const locale = i18nComponentsInstance.language || "en";
    return resolveMappedListWrapperData<
      TeamCardsWrapperProps,
      TeamCardProps,
      Record<string, unknown>,
      TeamSectionType["people"][number],
      {
        backgroundColor?: TeamCardProps["styles"]["backgroundColor"];
        slotStyles?: Record<string, any>;
      }
    >({
      data: data as ComponentData<TeamCardsWrapperProps>,
      streamDocument: params.metadata.streamDocument ?? {},
      listFieldName: "people",
      cardIdPrefix: "TeamCard",
      getSharedCardProps: (card) =>
        !card
          ? undefined
          : {
              backgroundColor: card.props.styles.backgroundColor,
              slotStyles: gatherSlotStyles(card.props.slots),
            },
      createCard: (id, index, sharedCardProps) =>
        defaultTeamCardSlotData(
          id,
          index,
          sharedCardProps?.backgroundColor,
          sharedCardProps?.slotStyles
        ) as ComponentData<TeamCardProps>,
      decorateMappedItemCard: (card, item, index) =>
        setDeep(setDeep(card, "props.index", index), "props.parentData", {
          field: data.props.data.field,
          person: {
            headshot: resolveMappedSourceField<PersonStruct["headshot"]>(
              item,
              data.props.data.field,
              data.props.cards?.headshot,
              locale
            ),
            name: resolveMappedSourceField<PersonStruct["name"]>(
              item,
              data.props.data.field,
              data.props.cards?.name,
              locale
            ),
            title: resolveMappedSourceField<PersonStruct["title"]>(
              item,
              data.props.data.field,
              data.props.cards?.title,
              locale
            ),
            phoneNumber: resolveMappedSourceField<PersonStruct["phoneNumber"]>(
              item,
              data.props.data.field,
              data.props.cards?.phoneNumber,
              locale
            ),
            email: resolveMappedSourceField<PersonStruct["email"]>(
              item,
              data.props.data.field,
              data.props.cards?.email,
              locale
            ),
            cta:
              resolveMappedSourceField<PersonStruct["cta"]>(
                item,
                data.props.data.field,
                data.props.cards?.cta,
                locale
              ) ?? defaultPersonCta,
          },
        } satisfies TeamCardProps["parentData"]),
      decorateSectionItemCard: (card, person, index) =>
        setDeep(setDeep(card, "props.index", index), "props.parentData", {
          field: data.props.data.field,
          person,
        } satisfies TeamCardProps["parentData"]),
      fallbackToIndex: true,
    });
  },
  render: (props) => <TeamCardsWrapperComponent {...props} />,
};
