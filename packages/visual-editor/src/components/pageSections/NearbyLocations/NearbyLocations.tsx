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
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultNearbyLocationsCardsProps } from "./NearbyLocationsCardsWrapper";

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

const NearbyLocationsComponent: PuckComponent<NearbyLocationsSectionProps> = (
  props
) => {
  const { styles, slots } = props;
  const cardsWrapperRef = React.useRef<HTMLDivElement>(null);
  const [showSection, setShowSection] = React.useState<boolean>(true);

  React.useEffect(() => {
    // Watch the cards wrapper element to see if any cards are rendered
    const element = cardsWrapperRef.current;
    if (!element) {
      return;
    }

    const observer = new ResizeObserver((entries) => {
      const isHidden = entries?.[0].target.clientHeight === 0;
      setShowSection(!isHidden);
    });

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, []);

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
