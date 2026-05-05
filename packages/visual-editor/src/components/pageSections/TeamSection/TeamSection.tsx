import { PuckComponent, Slot, setDeep } from "@puckeditor/core";
import {
  ThemeColor,
  backgroundColors,
  ThemeOptions,
} from "../../../utils/themeConfigOptions.ts";
import { YextField } from "../../../editor/YextField.tsx";
import { PageSection } from "../../atoms/pageSection.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  TeamCardsWrapper,
  type TeamCardsWrapperProps,
} from "./TeamCardsWrapper.tsx";
import { forwardHeadingLevel } from "../../../utils/cardSlots/forwardHeadingLevel.ts";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";
import { hasResolvedMappedListSource } from "../../../utils/cardSlots/mappedSource.ts";

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
    backgroundColor?: ThemeColor;

    /**
     * Whether to show the section heading.
     * @defaultValue true
     */
    showSectionHeading: boolean;
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

  /** @internal */
  hasResolvedSource?: boolean;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const teamSectionFields: YextFields<TeamSectionProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
      },
      showSectionHeading: {
        label: msg("fields.showSectionHeading", "Show Section Heading"),
        type: "radio",
        options: ThemeOptions.SHOW_HIDE,
      },
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
      scope: {
        label: msg("fields.scope", "Scope"),
        type: "text",
      },
    },
  }),
  liveVisibility: {
    label: msg("fields.visibleOnLivePage", "Visible on Live Page"),
    type: "radio",
    options: [
      { label: msg("fields.options.show", "Show"), value: true },
      { label: msg("fields.options.hide", "Hide"), value: false },
    ],
  },
};

const TeamSectionWrapper: PuckComponent<TeamSectionProps> = (props) => {
  const { styles, slots, hasResolvedSource, puck } = props;

  if (!puck.isEditing && hasResolvedSource === false) {
    return <></>;
  }

  return (
    <PageSection
      background={styles?.backgroundColor}
      className="flex flex-col gap-8"
    >
      {styles.showSectionHeading && (
        <slots.SectionHeadingSlot style={{ height: "auto" }} allow={[]} />
      )}
      <slots.CardsWrapperSlot style={{ height: "auto" }} allow={[]} />
    </PageSection>
  );
};

/**
 * The Team Section is designed to showcase a list of people, such as employees, executives, or other team members. It features a main section heading and renders each person's information—typically a photo, name, and title—as an individual card.
 * Available on Location templates.
 */
export const TeamSection: YextComponentConfig<TeamSectionProps> = {
  label: msg("components.teamSection", "Team Section"),
  fields: teamSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background3.value,
      showSectionHeading: true,
    },
    slots: {
      SectionHeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: { defaultValue: "Meet Our Team" },
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
            ...(TeamCardsWrapper.defaultProps as TeamCardsWrapperProps),
          } satisfies TeamCardsWrapperProps,
        },
      ],
    },
    analytics: {
      scope: "teamSection",
    },
    liveVisibility: true,
  },
  resolveData: (data, params) => {
    const updatedData = forwardHeadingLevel(data, "TitleSlot");
    const wrapperProps = updatedData.props.slots.CardsWrapperSlot?.[0]
      ?.props as TeamCardsWrapperProps | undefined;

    return setDeep(
      updatedData,
      "props.hasResolvedSource",
      !wrapperProps ||
        hasResolvedMappedListSource({
          streamDocument: params.metadata.streamDocument ?? {},
          constantValueEnabled: wrapperProps.data.constantValueEnabled,
          fieldPath: wrapperProps.data.field,
        })
    );
  },
  render: (props) => (
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
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
    </ComponentErrorBoundary>
  ),
};
