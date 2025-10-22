import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  PageSection,
  YextField,
  VisibilityWrapper,
  msg,
  getAnalyticsScopeHash,
  HeadingTextProps,
} from "@yext/visual-editor";
import { AnalyticsScopeProvider } from "@yext/pages-components";
import { defaultFAQSlotData } from "./FAQSlot.tsx";
import { FAQsWrapperSlotProps } from "./FAQsWrapperSlot.tsx";

export interface FAQStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 3
   */
  backgroundColor?: BackgroundStyle;
}

export interface FAQSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: FAQStyles;

  slots: {
    HeadingSlot: Slot;
    FAQsWrapperSlot: Slot;
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

const FAQsSectionFields: Fields<FAQSectionProps> = {
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
      HeadingSlot: { type: "slot", allow: [] },
      FAQsWrapperSlot: { type: "slot", allow: [] },
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

const FAQsSectionComponent: PuckComponent<FAQSectionProps> = ({
  styles,
  slots,
}) => {
  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8 md:gap-12"
    >
      <slots.HeadingSlot style={{ height: "auto" }} />
      <slots.FAQsWrapperSlot />
    </PageSection>
  );
};

/**
 * The FAQ Section component displays a list of questions and answers in an organized format.
 * It includes a main heading for the section and typically renders the FAQs as an accordion,
 * where users can click on a question to reveal the answer.
 */
export const FAQSection: ComponentConfig<{ props: FAQSectionProps }> = {
  label: msg("components.faqsSection", "FAQs Section"),
  fields: FAQsSectionFields,
  defaultProps: {
    slots: {
      HeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "Frequently Asked Questions",
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
      FAQsWrapperSlot: [
        {
          type: "FAQsWrapperSlot",
          props: {
            data: {
              field: "",
              constantValueEnabled: true,
              constantValue: [{}, {}, {}], // leave ids blank to auto-generate
            },
            slots: {
              CardSlot: [
                defaultFAQSlotData(undefined, 0),
                defaultFAQSlotData(undefined, 1),
                defaultFAQSlotData(undefined, 2),
              ],
            },
          } satisfies FAQsWrapperSlotProps,
        },
      ],
    },
    styles: {
      backgroundColor: backgroundColors.background2.value,
    },
    liveVisibility: true,
    analytics: {
      scope: "faqsSection",
    },
  },
  render: (props) => (
    <AnalyticsScopeProvider
      name={`${props.analytics?.scope ?? "faqsSection"}${getAnalyticsScopeHash(props.id)}`}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <FAQsSectionComponent {...props} />
      </VisibilityWrapper>
    </AnalyticsScopeProvider>
  ),
};
