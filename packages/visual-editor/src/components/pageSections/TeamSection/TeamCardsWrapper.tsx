import { ComponentData, PuckComponent, setDeep } from "@puckeditor/core";
import { TeamSectionType } from "../../../types/types.ts";
import { ComponentFields } from "../../../types/fields.ts";
import { msg } from "../../../utils/i18n/platform.ts";
import { i18nComponentsInstance } from "../../../utils/i18n/components.ts";
import { CardContextProvider } from "../../../hooks/useCardContext.tsx";
import {
  cardWrapperFields,
  CardWrapperType,
} from "../../../utils/cardSlots/cardWrapperHelpers.ts";
import { defaultTeamCardSlotData, TeamCardProps } from "./TeamCard.tsx";
import { gatherSlotStyles } from "../../../hooks/useGetCardSlots.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { YextComponentConfig } from "../../../fields/fields.ts";
import { ThemeOptions } from "../../../utils/themeConfigOptions.ts";
import { resolveMappedListWrapperData } from "../../../utils/cardSlots/mappedListWrapper.ts";

export type TeamCardsWrapperProps = CardWrapperType<TeamSectionType> & {
  styles: {
    showImage: boolean;
    showTitle: boolean;
    showPhone: boolean;
    showEmail: boolean;
    showCTA: boolean;
  };
};

const teamCardsWrapperFields = {
  ...cardWrapperFields<TeamCardsWrapperProps>(
    msg("components.team", "Team"),
    ComponentFields.TeamSection.type
  ),
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
    slots: {
      CardSlot: [],
    },
  },
  resolveData: (data, params) => {
    return resolveMappedListWrapperData<
      TeamCardsWrapperProps,
      TeamCardProps,
      never,
      TeamSectionType["people"][number],
      {
        backgroundColor?: TeamCardProps["styles"]["backgroundColor"];
        slotStyles?: Record<string, any>;
      }
    >({
      data: data as ComponentData<TeamCardsWrapperProps>,
      streamDocument: params.metadata.streamDocument ?? {},
      locale: i18nComponentsInstance.language || "en",
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
      decorateMappedItemCard: (card, _item, _index) => card,
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
