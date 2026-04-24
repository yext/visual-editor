import { Slot } from "@puckeditor/core";
import {
  ThemeColor,
  backgroundColors,
} from "../../../utils/themeConfigOptions.ts";
import { YextField } from "../../../editor/YextField.tsx";
import { VisibilityWrapper } from "../../atoms/visibilityWrapper.tsx";
import { msg } from "../../../utils/i18n/platform.ts";
import { getAnalyticsScopeHash } from "../../../utils/applyAnalytics.ts";
import { HeadingTextProps } from "../../contentBlocks/HeadingText.tsx";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultTestimonialCardSlotData } from "./TestimonialCard.tsx";
import { TestimonialCardsWrapperProps } from "./TestimonialCardsWrapper.tsx";
import { forwardHeadingLevel } from "../../../utils/cardSlots/forwardHeadingLevel.ts";
import { ComponentErrorBoundary } from "../../../internal/components/ComponentErrorBoundary.tsx";
import {
  getMappedCardsSectionConditionalRender,
  MappedCardsSectionConditionalRender,
  MappedCardsSectionContent,
  MappedCardsSectionShell,
} from "../mappedCardsSectionUtils.tsx";
import { YextComponentConfig, YextFields } from "../../../fields/fields.ts";

export interface TestimonialSectionProps {
  styles: {
    backgroundColor?: ThemeColor;
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
  conditionalRender?: MappedCardsSectionConditionalRender;

  liveVisibility: boolean;
}

const testimonialSectionFields: YextFields<TestimonialSectionProps> = {
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: {
        type: "basicSelector",
        label: msg("fields.backgroundColor", "Background Color"),
        options: "BACKGROUND_COLOR",
      },
      showSectionHeading: YextField(
        msg("fields.showSectionHeading", "Show Section Heading"),
        {
          type: "radio",
          options: "SHOW_HIDE",
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

export const TestimonialSection: YextComponentConfig<TestimonialSectionProps> =
  {
    label: msg("components.testimonialsSection", "Testimonials Section"),
    fields: testimonialSectionFields,
    defaultProps: {
      styles: {
        backgroundColor: backgroundColors.background2.value,
        showSectionHeading: true,
      },
      slots: {
        SectionHeadingSlot: [
          {
            type: "HeadingTextSlot",
            props: {
              data: {
                text: {
                  constantValue: { defaultValue: "Featured Testimonials" },
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
              styles: {
                showName: true,
                showDate: true,
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
      const updatedData = forwardHeadingLevel(data, "ContributorNameSlot");
      return {
        ...updatedData,
        props: {
          ...updatedData.props,
          conditionalRender: getMappedCardsSectionConditionalRender(
            updatedData.props.slots.CardsWrapperSlot?.[0]
          ),
        },
      };
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
            <MappedCardsSectionShell
              conditionalRender={props.conditionalRender}
              isEditing={props.puck.isEditing}
              CardsWrapperSlot={props.slots.CardsWrapperSlot}
            >
              {(setCardsWrapperRef) => (
                <MappedCardsSectionContent
                  backgroundColor={props.styles?.backgroundColor}
                  showSectionHeading={props.styles.showSectionHeading}
                  SectionHeadingSlot={props.slots.SectionHeadingSlot}
                  CardsWrapperSlot={props.slots.CardsWrapperSlot}
                  setCardsWrapperRef={setCardsWrapperRef}
                />
              )}
            </MappedCardsSectionShell>
          </VisibilityWrapper>
        </AnalyticsScopeProvider>
      </ComponentErrorBoundary>
    ),
  };
