import * as React from "react";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import {
  BackgroundStyle,
  YextField,
  PageSection,
  backgroundColors,
  VisibilityWrapper,
  msg,
  getAnalyticsScopeHash,
  HeadingTextProps,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultTeamCardSlotData } from "./TeamCard.tsx";
import { TeamCardsWrapperProps } from "./TeamCardsWrapper.tsx";
import { forwardHeadingLevel } from "../../../utils/cardSlots/forwardHeadingLevel.ts";

export interface TeamSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color of the section.
     * @defaultValue Background Color 3
     */
    backgroundColor?: BackgroundStyle;
  };

  /** @internal */
  slots: {
    SectionHeadingSlot: Slot;
    CardsWrapperSlot: Slot;
  };

  /** @internal */
  analytics: {
    scope?: string;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const teamSectionFields: Fields<TeamSectionProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          options: "BACKGROUND_COLOR",
        }
      ),
    },
  }),
  slots: {
    type: "object",
    objectFields: {
      SectionHeadingSlot: { type: "slot" },
      CardsWrapperSlot: { type: "slot" },
    },
    visible: false,
  },
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

const TeamSectionWrapper: PuckComponent<TeamSectionProps> = (props) => {
  const { styles, slots } = props;

  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col gap-8"
    >
      <slots.SectionHeadingSlot style={{ height: "auto" }} allow={[]} />
      <slots.CardsWrapperSlot style={{ height: "auto" }} allow={[]} />
    </PageSection>
  );
};

/**
 * The Team Section is designed to showcase a list of people, such as employees, executives, or other team members. It features a main section heading and renders each person's information—typically a photo, name, and title—as an individual card.
 * Available on Location templates.
 */
export const TeamSection: ComponentConfig<{ props: TeamSectionProps }> = {
  label: msg("components.teamSection", "Team Section"),
  fields: teamSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background3.value,
    },
    slots: {
      SectionHeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "Meet Our Team",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 2, align: "left" },
          } satisfies HeadingTextProps,
        },
      ],
      CardsWrapperSlot: [
        {
          type: "TeamCardsWrapper",
          props: {
            data: {
              field: "",
              constantValueEnabled: true,
              constantValue: [{}, {}, {}], // leave ids blank to auto-generate
            },
            slots: {
              CardSlot: [
                defaultTeamCardSlotData(undefined, 0),
                defaultTeamCardSlotData(undefined, 1),
                defaultTeamCardSlotData(undefined, 2),
              ],
            },
          } satisfies TeamCardsWrapperProps,
        },
      ],
    },
    analytics: {
      scope: "teamSection",
    },
    liveVisibility: true,
  },
  resolveData: (data) => {
    return forwardHeadingLevel(data, "TitleSlot");
  },
  render: (props) => (
    <AnalyticsScopeProvider
      name={`${props.analytics?.scope ?? "teamSection"}${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <TeamSectionWrapper {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
