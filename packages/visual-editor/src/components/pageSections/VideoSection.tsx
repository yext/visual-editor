import { ComponentConfig, Fields, PuckComponent, Slot } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  msg,
  PageSection,
  VisibilityWrapper,
  YextField,
} from "@yext/visual-editor";
import { ComponentErrorBoundary } from "../../internal/components/ComponentErrorBoundary";

export interface VideoSectionProps {
  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: {
    /**
     * The background color for the entire section, selected from the theme.
     * @defaultValue Background Color 1
     */
    backgroundColor?: BackgroundStyle;
  };

  slots: {
    SectionHeadingSlot: Slot;
    VideoSlot: Slot;
  };

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const videoSectionFields: Fields<VideoSectionProps> = {
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
      VideoSlot: { type: "slot" },
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

const VideoSectionComponent: PuckComponent<VideoSectionProps> = (props) => {
  const { slots, styles } = props;

  return (
    <PageSection background={styles.backgroundColor} className="flex flex-col">
      <slots.SectionHeadingSlot allow={[]} />
      <slots.VideoSlot allow={[]} />
    </PageSection>
  );
};

/**
 * The Video Section is used to display an embedded YouTube video.
 * Available on Location templates.
 */
export const VideoSection: ComponentConfig<{
  props: VideoSectionProps;
}> = {
  label: msg("components.videoSection", "Video Section"),
  fields: videoSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
    },
    slots: {
      SectionHeadingSlot: [
        {
          type: "HeadingTextSlot",
          props: {
            data: {
              text: {
                constantValue: {
                  en: "",
                  hasLocalizedValue: "true",
                },
                constantValueEnabled: true,
                field: "",
              },
            },
            styles: { level: 2, align: "left" },
          },
        },
      ],
      VideoSlot: [
        {
          type: "VideoSlot",
          props: {
            data: {
              assetVideo: {},
            },
          },
        },
      ],
    },
    liveVisibility: true,
  },
  render: (props) => (
    <ComponentErrorBoundary
      isEditing={props.puck.isEditing}
      resetKeys={[props]}
    >
      <VisibilityWrapper
        liveVisibility={props.liveVisibility}
        isEditing={props.puck.isEditing}
      >
        <VideoSectionComponent {...props} />
      </VisibilityWrapper>
    </ComponentErrorBoundary>
  ),
};
