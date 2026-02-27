import * as React from "react";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
  WithId,
} from "@puckeditor/core";
import {
  BackgroundStyle,
  backgroundColors,
} from "../../../utils/themeConfigOptions.ts";
import { PageSection } from "../../atoms/pageSection.tsx";
import { YextField } from "../../../editor/YextField.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultNearbyLocationsCardsProps } from "./NearbyLocationsCardsWrapper.tsx";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import { defaultText } from "../../../utils/i18n/defaultContent.ts";

export interface NearbyLocationsSectionProps {
  /**
   * This object contains extensive properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color for the entire section.
     * @defaultValue Background Color 1
     */
    backgroundColor?: BackgroundStyle;

    /**
     * Whether to show the section heading.
     * @defaultValue true
     */
    showSectionHeading: boolean;
  };

  /** @internal */
  analytics: {
    scope?: string;
  };

  /** @internal */
  slots: {
    SectionHeadingSlot: Slot;
    CardsWrapperSlot: Slot;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const nearbyLocationsSectionFields: Fields<NearbyLocationsSectionProps> = {
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
      showSectionHeading: YextField(
        msg("fields.showSectionHeading", "Show Section Heading"),
        {
          type: "radio",
          options: "SHOW_HIDE",
        }
      ),
    },
  }),
  analytics: YextField(msg("fields.analytics", "Analytics"), {
    type: "object",
    visible: false,
    objectFields: {
      scope: YextField(msg("fields.scope", "Scope"), {
        type: "text",
      }),
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

const NearbyLocationsComponent: PuckComponent<NearbyLocationsSectionProps> = (
  props
) => {
  const { styles, slots, puck } = props;
  const cardsWrapperRef = React.useRef<HTMLDivElement>(null);
  // Hide the header if there are no nearby locations and it is the editor
  const [showHeading, setShowHeading] = React.useState<boolean>(true);
  // Hide the entire section if there are no nearby locations and it is the live page
  const [hideEntireSection, setHideEntireSection] =
    React.useState<boolean>(false);

  React.useEffect(() => {
    // Watch the cards wrapper element to see if any cards are rendered
    const element = cardsWrapperRef.current;
    if (!element) {
      return;
    }

    const checkIfEmptyState = () => {
      const hasEmptyStateMarker =
        element.querySelector('[data-empty-state="true"]') !== null;
      const hasHeight = element.clientHeight > 0;
      const hasContent = element.querySelector('[id$="-wrapper"]') !== null; // Check for the cards wrapper div
      const isLoading = element.querySelector('[data-loading="true"]') !== null; // Check for loading state
      const shouldShow =
        hasContent || isLoading || (hasHeight && !hasEmptyStateMarker);
      setShowHeading(shouldShow);
      setHideEntireSection(hasEmptyStateMarker && !puck.isEditing);
    };

    const observer = new ResizeObserver(() => {
      checkIfEmptyState();
    });

    // Also use MutationObserver to detect when empty state is added/removed
    const mutationObserver = new MutationObserver(() => {
      checkIfEmptyState();
    });

    observer.observe(element);
    mutationObserver.observe(element, {
      childList: true,
      subtree: true,
    });

    // Initial check
    checkIfEmptyState();

    return () => {
      observer.unobserve(element);
      mutationObserver.disconnect();
    };
  }, [puck.isEditing]);

  // Show empty state if detected
  if (hideEntireSection) {
    return <></>;
  }

  return (
    <PageSection background={styles?.backgroundColor}>
      <div className="space-y-6">
        {showHeading && styles?.showSectionHeading && (
          <slots.SectionHeadingSlot style={{ height: "auto" }} allow={[]} />
        )}
        <div ref={cardsWrapperRef}>
          <slots.CardsWrapperSlot style={{ height: "auto" }} allow={[]} />
        </div>
      </div>
    </PageSection>
  );
};

/**
 * The Nearby Locations Section dynamically finds and displays a list of business locations within a specified radius of a central point. It's a powerful tool for helping users discover other relevant locations, rendering each result as a detailed card with contact information and business hours.
 * Available on Location templates.
 */
export const NearbyLocationsSection: ComponentConfig<{
  props: NearbyLocationsSectionProps;
}> = {
  label: msg("components.nearbyLocationsSection", "Nearby Locations Section"),
  fields: nearbyLocationsSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
      showSectionHeading: true,
    },
    analytics: {
      scope: "nearbyLocationsSection",
    },
    slots: {
      SectionHeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                field: "",
                constantValue: defaultText(
                  "componentDefaults.nearbyLocations",
                  "Nearby Locations"
                ),
                constantValueEnabled: true,
              },
            },
            styles: {
              level: 2,
              align: "left",
            },
          } satisfies HeadingTextProps,
        },
      ],
      CardsWrapperSlot: [
        {
          type: "NearbyLocationCardsWrapper",
          props: defaultNearbyLocationsCardsProps,
        },
      ],
    },
    liveVisibility: true,
  },
  resolveData: (data) => {
    const sectionHeadingProps = data.props.slots.SectionHeadingSlot?.[0]
      ?.props as WithId<HeadingTextProps> | undefined;

    return setDeep(
      data,
      "props.slots.CardsWrapperSlot[0].props.sectionHeadingLevel",
      sectionHeadingProps?.styles?.level
    );
  },
  render: (props) => (
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
      <AnalyticsScopeProvider
        name={props.analytics?.scope ?? "nearbyLocationsSection"}
      >
        <VisibilityWrapper
          liveVisibility={props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          <NearbyLocationsComponent {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    </ComponentErrorBoundary>
  ),
};
