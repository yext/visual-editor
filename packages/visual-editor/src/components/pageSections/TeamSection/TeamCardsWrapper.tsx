import {
  type ComponentData,
  PuckComponent,
  type Slot,
  setDeep,
} from "@puckeditor/core";
import { type PersonStruct } from "../../../types/types.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import { defaultTeamCardSlotData, type TeamCardProps } from "./TeamCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import {
  toPuckFields,
  type YextComponentConfig,
  type YextFields,
} from "../../../fields/fields.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { type YextEntityField } from "../../../editor/YextEntityFieldSelector.tsx";
import { type StreamDocument, createItemSource } from "../../../utils/index.ts";
import { buildListSectionCards } from "../../../utils/cardSlots/listSectionData.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";

type TeamCardItem = {
  headshot: YextEntityField<PersonStruct["headshot"]>;
  name: YextEntityField<PersonStruct["name"]>;
  title: YextEntityField<PersonStruct["title"]>;
  phoneNumber: YextEntityField<PersonStruct["phoneNumber"]>;
  email: YextEntityField<PersonStruct["email"]>;
  cta: YextEntityField<PersonStruct["cta"]>;
};

export type TeamCardsWrapperProps = {
  data: {
    field: string;
    constantValueEnabled?: boolean;
    constantValue: TeamCardItem[];
  };
  cards?: TeamCardItem;
  styles: {
    showImage: boolean;
    showTitle: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showCTA: boolean;
  };
  slots: {
    CardSlot: Slot;
  };
};

const defaultPersonCta = {
  label: { defaultValue: "" },
  link: "",
  linkType: "URL",
  ctaType: "textAndLink",
} satisfies PersonStruct["cta"];

const teamCards = createItemSource<TeamCardsWrapperProps, TeamCardItem>({
  itemSourcePath: "data",
  itemMappingsPath: "cards",
  itemSourceLabel: msg("components.team", "Team"),
  itemMappingsLabel: msg("fields.cards", "Cards"),
  itemFields: {
    headshot: YextField(msg("fields.headshot", "Headshot"), {
      type: "entityField",
      disableConstantValueToggle: true,
      filter: {
        types: ["type.image"],
      },
    }),
    name: YextField(msg("fields.name", "Name"), {
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
    }),
    title: YextField(msg("fields.title", "Title"), {
      type: "entityField",
      filter: {
        types: ["type.string", "type.rich_text_v2"],
      },
    }),
    phoneNumber: YextField(msg("fields.phone", "Phone"), {
      type: "entityField",
      filter: {
        types: ["type.phone", "type.string"],
      },
    }),
    email: YextField(msg("fields.email", "Email"), {
      type: "entityField",
      filter: {
        types: ["type.string"],
      },
    }),
    cta: YextField(msg("fields.cta", "CTA"), {
      type: "entityField",
      filter: {
        types: ["type.cta"],
      },
    }),
  },
});

const teamCardsWrapperFields: YextFields<TeamCardsWrapperProps> = {
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
  slots: {
    type: "object",
    objectFields: {
      CardSlot: { type: "slot", allow: [] },
    },
    visible: false,
  },
};

const createTeamCard = (
  currentCards: ComponentData<TeamCardProps>[]
): ComponentData<TeamCardProps> => {
  const existingCard = currentCards[0];

  return defaultTeamCardSlotData(
    `TeamCard-${crypto.randomUUID()}`,
    undefined,
    existingCard?.props.styles.backgroundColor,
    existingCard ? gatherSlotStyles(existingCard.props.slots) : undefined
  ) as unknown as ComponentData<TeamCardProps>;
};

const syncCards = (
  data: ComponentData<TeamCardsWrapperProps>,
  resolvedItems: Record<string, unknown>[]
): ComponentData<TeamCardsWrapperProps> => {
  const currentCards =
    (data.props.slots.CardSlot as unknown as ComponentData<TeamCardProps>[]) ??
    [];

  return setDeep(
    data,
    "props.slots.CardSlot",
    buildListSectionCards<TeamCardProps, Record<string, unknown>>({
      currentCards,
      items: resolvedItems,
      createCard: () => createTeamCard(currentCards),
      decorateCard: (card, item, index) => ({
        ...card,
        props: {
          ...card.props,
          index,
          itemData: {
            field: data.props.data.field,
            headshot: item.headshot as PersonStruct["headshot"],
            name: item.name as PersonStruct["name"],
            title: item.title as PersonStruct["title"],
            phoneNumber: item.phoneNumber as PersonStruct["phoneNumber"],
            email: item.email as PersonStruct["email"],
            cta:
              (item.cta as PersonStruct["cta"] | undefined) ?? defaultPersonCta,
          },
        },
      }),
    })
  );
};

const TeamCardsWrapperComponent: PuckComponent<TeamCardsWrapperProps> = ({
  slots,
}) => (
  <CardContextProvider>
    <slots.CardSlot
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center"
      allow={[]}
    />
  </CardContextProvider>
);

export const TeamCardsWrapper: YextComponentConfig<TeamCardsWrapperProps> = {
  label: msg("components.teamCardsWrapper", "Team Cards"),
  fields: teamCardsWrapperFields,
  defaultProps: {
    ...teamCards.defaultProps,
    data: {
      ...teamCards.defaultProps.data!,
      constantValue: [{}, {}, {}] as TeamCardItem[],
    },
    cards: {
      ...(teamCards.defaultProps.cards as TeamCardItem),
      cta: {
        field: "",
        constantValueEnabled: false,
        constantValue: defaultPersonCta,
      },
    },
    styles: {
      showImage: true,
      showTitle: true,
      showPhone: true,
      showEmail: true,
      showCTA: true,
    },
    slots: {
      CardSlot: [
        defaultTeamCardSlotData(
          undefined,
          0
        ) as unknown as ComponentData<TeamCardProps>,
        defaultTeamCardSlotData(
          undefined,
          1
        ) as unknown as ComponentData<TeamCardProps>,
        defaultTeamCardSlotData(
          undefined,
          2
        ) as unknown as ComponentData<TeamCardProps>,
      ],
    },
  },
  resolveFields: (data) =>
    toPuckFields({
      ...teamCardsWrapperFields,
      ...teamCards.resolveFields(data),
    }),
  resolveData: (data, params) => {
    const normalizedData = teamCards.normalizeData(data, params);
    const resolvedItems = teamCards.resolveItems(
      normalizedData.props.data,
      normalizedData.props.cards,
      (params.metadata?.streamDocument ?? {}) as StreamDocument,
      i18nComponentsInstance.language || "en"
    );

    return syncCards(normalizedData, resolvedItems);
  },
  render: (props) => <TeamCardsWrapperComponent {...props} />,
};
