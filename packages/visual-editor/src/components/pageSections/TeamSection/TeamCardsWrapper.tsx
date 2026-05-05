import { ComponentData, PuckComponent } from "@puckeditor/core";
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
import { YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { createMappedItems } from "../../../utils/cardSlots/createMappedItems.ts";
import { resolveComponentData } from "../../../utils/resolveComponentData.tsx";

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

const teamCardsBase = createMappedItems<TeamCardsWrapperProps>({
  sourceFieldPath: "data.field",
  mappingGroupPath: "cards",
  sourceLabel: msg("components.team", "Team"),
  mappingGroupLabel: msg("fields.cards", "Cards"),
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
}).withConstantValueMode({
  constantValueType: ComponentFields.TeamSection.type,
});

const teamCards = teamCardsBase.withRepeatedSlot({
  slotPath: "slots.CardSlot",
  createItem: (id, index, existingItem) =>
    defaultTeamCardSlotData(
      id,
      index,
      existingItem?.props.styles.backgroundColor,
      existingItem ? gatherSlotStyles(existingItem.props.slots) : undefined
    ) as unknown as ComponentData<TeamCardProps>,
  getParentData: (item, resolvedData) => {
    const locale = i18nComponentsInstance.language || "en";
    const name = teamCardsBase.resolveMapping<PersonStruct["name"]>(
      resolvedData.props.cards?.name,
      item,
      locale
    );

    return {
      field: resolvedData.props.data.field,
      person: {
        headshot: teamCardsBase.resolveMapping<PersonStruct["headshot"]>(
          resolvedData.props.cards?.headshot,
          item,
          locale
        ),
        name: name ? resolveComponentData(name, locale, item) : undefined,
        title: teamCardsBase.resolveMapping<PersonStruct["title"]>(
          resolvedData.props.cards?.title,
          item,
          locale
        ),
        phoneNumber: teamCardsBase.resolveMapping<PersonStruct["phoneNumber"]>(
          resolvedData.props.cards?.phoneNumber,
          item,
          locale
        ),
        email: teamCardsBase.resolveMapping<PersonStruct["email"]>(
          resolvedData.props.cards?.email,
          item,
          locale
        ),
        cta:
          teamCardsBase.resolveMapping<PersonStruct["cta"]>(
            resolvedData.props.cards?.cta,
            item,
            locale
          ) ?? defaultPersonCta,
      },
    };
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
  fields: teamCardsWrapperFields,
  defaultProps: {
    ...teamCards.defaultProps,
    data: teamCards.defaultProps.data!,
    cards: teamCards.defaultProps.cards!,
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
      ...teamCards.resolveFields(data),
    }),
  resolveData: (data, params) => teamCards.resolveItems(data, params).data,
  render: (props) => <TeamCardsWrapperComponent {...props} />,
};
