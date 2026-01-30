import * as React from "react";
import { ComponentConfig, Fields, PuckComponent, Slot } from "@puckeditor/core";
import {
  BackgroundStyle,
  backgroundColors,
} from "../../../utils/themeConfigOptions";
import { YextField } from "../../../editor/YextField";
import { PageSection } from "../../atoms/pageSection";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper";
import { msg } from "../../../utils/i18n/platform";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics";
import { HeadingTextProps } from "../../contentBlocks/HeadingText";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultTestimonialCardSlotData } from "./TestimonialCard.tsx";
import { TestimonialCardsWrapperProps } from "./TestimonialCardsWrapper.tsx";
import { forwardHeadingLevel } from "../../../utils/cardSlots/forwardHeadingLevel.ts";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary";

export interface TestimonialSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color of the section.
     * @defaultValue Background Color 2
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

const testimonialSectionFields: Fields<TestimonialSectionProps> = {
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

const TestimonialSectionWrapper: PuckComponent<TestimonialSectionProps> = (
  props
) => {
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
 * The Testimonial Section is used to display a list of customer testimonials or reviews. It features a main section heading and renders each testimonial as an individual card, providing social proof and building trust with visitors.
 * Available on Location templates.
 */
export const TestimonialSection: ComponentConfig<{
  props: TestimonialSectionProps;
}> = {
  label: msg("components.testimonialsSection", "Testimonials Section"),
  fields: testimonialSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background2.value,
    },
    slots: {
      SectionHeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "Featured Testimonials",
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
          type: "TestimonialCardsWrapper",
          props: {
            data: {
              field: "",
              constantValueEnabled: true,
              constantValue: [{}, {}, {}],
            },
            slots: {
              CardSlot: [
                defaultTestimonialCardSlotData(undefined, 0),
                defaultTestimonialCardSlotData(undefined, 1),
                defaultTestimonialCardSlotData(undefined, 2),
              ],
            },
          } satisfies TestimonialCardsWrapperProps,
        },
      ],
    },
    analytics: {
      scope: "testimonialSection",
    },
    liveVisibility: true,
  },
  resolveData: (data) => {
    return forwardHeadingLevel(data, "ContributorNameSlot");
  },
  render: (props) => (
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
      <AnalyticsScopeProvider
        name={`${props.analytics?.scope ?? "testimonialSection"}${getAnalyticsScopeHash(props.id)}`}
      >
        <VisibilityWrapper
          liveVisibility={props.liveVisibility}
          isEditing={props.puck.isEditing}
        >
          <TestimonialSectionWrapper {...props} />
        </VisibilityWrapper>
      </AnalyticsScopeProvider>
    </ComponentErrorBoundary>
  ),
};
