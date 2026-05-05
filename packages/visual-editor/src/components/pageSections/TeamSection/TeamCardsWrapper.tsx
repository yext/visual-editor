import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { PersonStruct, TeamSectionType } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { CardWrapperType } from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { defaultTeamCardSlotData, TeamCardProps } from "./TeamCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { toPuckFields, YextComponentConfig } from "../../../fields/fields.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { resolveMappedListWrapperData } from "../../../utils/cardSlots/mappedListWrapper.ts";
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { createMappedItemsConfig } from "../../../utils/cardSlots/createMappedItemsConfig.ts";

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

const teamCards = createMappedItemsConfig<TeamCardsWrapperProps>({
  sourceFieldPath: "data.field",
  mappingGroupPath: "cards",
  sourceLabel: msg("components.team", "Team"),
  mappingGroupLabel: msg("fields.cards", "Cards"),
  constantValueType: ComponentFields.TeamSection.type,
  listFieldName: "people",
  sourceRootKinds: ["linkedEntityRoot", "baseListRoot"],
  sourceRootsOnly: true,
  requiredDescendantTypes: [["type.string"]],
  mappings: {
    headshot: {
      label: msg("fields.headshot", "Headshot"),
      types: ["type.image"],
      defaultValue: undefined,
      disableConstantValueToggle: true,
    },
    name: {
      label: msg("fields.name", "Name"),
      types: ["type.string"],
      defaultValue: { defaultValue: "" },
    },
    title: {
      label: msg("fields.title", "Title"),
      types: ["type.string", "type.rich_text_v2"],
      defaultValue: { defaultValue: "" },
    },
    phoneNumber: {
      label: msg("fields.phone", "Phone"),
      types: ["type.phone", "type.string"],
      defaultValue: "",
    },
    email: {
      label: msg("fields.email", "Email"),
      types: ["type.string"],
      defaultValue: "",
    },
    cta: {
      label: msg("fields.cta", "CTA"),
      types: ["type.cta"],
      defaultValue: defaultPersonCta,
    },
  },
});

const teamCardsWrapperFields = {
  ...teamCards.fields,
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
};

const TeamCardsWrapperComponent: PuckComponent<TeamCardsWrapperProps> = ({
  slots,
}) => {
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
  fields: teamCardsWrapperFields as any,
  defaultProps: {
    ...(teamCards.defaultProps as Pick<
      TeamCardsWrapperProps,
      "data" | "cards"
    >),
    styles: {
      showImage: true,
      showTitle: true,
      showPhone: true,
      showEmail: true,
      showCTA: true,
    },
    slots: {
      CardSlot: [],
    },
  },
  resolveFields: (data) =>
    toPuckFields({
      ...teamCardsWrapperFields,
      ...(teamCards.resolveFields(
        data as ComponentData<TeamCardsWrapperProps>
      ) as any),
    }),
  resolveData: (data, params) => {
    const locale = i18nComponentsInstance.language || "en";
    const { data: nextData } = teamCards.resolve(
      data as ComponentData<TeamCardsWrapperProps>,
      params
    );

    return resolveMappedListWrapperData<
      TeamCardsWrapperProps,
      TeamCardProps,
      Record<string, unknown>,
      {
        backgroundColor?: TeamCardProps["styles"]["backgroundColor"];
        slotStyles?: Record<string, any>;
      }
    >({
      data: nextData,
      streamDocument: params.metadata.streamDocument ?? {},
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
          field: nextData.props.data.field,
          person: {
            headshot: teamCards.resolveMapping<PersonStruct["headshot"]>(
              nextData.props.cards?.headshot,
              item,
              locale
            ),
            name: teamCards.resolveMapping<PersonStruct["name"]>(
              nextData.props.cards?.name,
              item,
              locale
            ),
            title: teamCards.resolveMapping<PersonStruct["title"]>(
              nextData.props.cards?.title,
              item,
              locale
            ),
            phoneNumber: teamCards.resolveMapping<PersonStruct["phoneNumber"]>(
              nextData.props.cards?.phoneNumber,
              item,
              locale
            ),
            email: teamCards.resolveMapping<PersonStruct["email"]>(
              nextData.props.cards?.email,
              item,
              locale
            ),
            cta:
              teamCards.resolveMapping<PersonStruct["cta"]>(
                nextData.props.cards?.cta,
                item,
                locale
              ) ?? defaultPersonCta,
          },
        } satisfies TeamCardProps["parentData"]),
      fallbackToIndex: true,
    });
  },
  render: (props) => <TeamCardsWrapperComponent {...props} />,
};
