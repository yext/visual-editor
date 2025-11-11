import * as React from "react";
import {
  ComponentConfig,
  Fields,
  PuckComponent,
  setDeep,
  Slot,
  WithId,
} from "@measured/puck";
import {
  BackgroundStyle,
  backgroundColors,
  PageSection,
  YextField,
  VisibilityWrapper,
  msg,
  HeadingTextProps,
  Body,
  pt,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import {
  defaultNearbyLocationsCardsProps,
  NearbyLocationCardsWrapperProps,
} from "./NearbyLocationsCardsWrapper";
import { MapPinOff } from "lucide-react";
import { useTemplateMetadata } from "../../../internal/hooks/useMessageReceivers";

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

/** @internal */
const NearbyLocationsEmptyState: React.FC<{
  backgroundColor?: BackgroundStyle;
  radius?: number;
}> = ({ backgroundColor, radius }) => {
  const templateMetadata = useTemplateMetadata();
  const entityTypeDisplayName =
    templateMetadata?.entityTypeDisplayName?.toLowerCase();

  return (
    <PageSection background={backgroundColor}>
      <div className="relative h-[300px] w-full bg-gray-100 rounded-lg border border-gray-200 flex flex-col items-center justify-center py-8 gap-2.5">
        <MapPinOff className="w-12 h-12 text-gray-400" />
        <div className="flex flex-col items-center gap-0">
          <Body variant="base" className="text-gray-500 font-medium">
            {pt(
              "nearbyLocationsEmptyStateSectionHidden",
              "Section hidden for this {{entityType}}",
              {
                entityType: entityTypeDisplayName
                  ? entityTypeDisplayName
                  : "page",
              }
            )}
          </Body>
          <Body variant="base" className="text-gray-500 font-normal">
            {pt(
              "nearbyLocationsEmptyState",
              "No {{entityType}} within {{radius}} miles",
              {
                entityType: entityTypeDisplayName
                  ? entityTypeDisplayName
                  : "entity",
                radius: radius ?? 10,
              }
            )}
          </Body>
        </div>
      </div>
    </PageSection>
  );
};

const NearbyLocationsComponent: PuckComponent<NearbyLocationsSectionProps> = (
  props
) => {
  const { styles, slots, puck } = props;
  const cardsWrapperRef = React.useRef<HTMLDivElement>(null);
  const [showSection, setShowSection] = React.useState<boolean>(true);
  const [isEmptyState, setIsEmptyState] = React.useState<boolean>(false);

  // Get cards wrapper props to access radius for empty state
  const cardsWrapperSlot = slots.CardsWrapperSlot;
  const cardsWrapperProps =
    Array.isArray(cardsWrapperSlot) && cardsWrapperSlot[0]
      ? (cardsWrapperSlot[0].props as NearbyLocationCardsWrapperProps)
      : undefined;

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
      setShowSection(shouldShow);
      setIsEmptyState(hasEmptyStateMarker && puck.isEditing);
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
  if (isEmptyState) {
    return (
      <NearbyLocationsEmptyState
        backgroundColor={styles?.backgroundColor}
        radius={cardsWrapperProps?.data?.radius}
      />
    );
  }

  return (
    <PageSection
      background={styles?.backgroundColor}
      outerClassName={showSection ? undefined : "p-0 m-0"}
    >
      <div className="space-y-6">
        {showSection && (
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
                constantValue: {
                  en: "Nearby Locations",
                  hasLocalizedValue: "true",
                },
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
  ),
};
