import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
  HeadingLevel,
  msg,
  PageSection,
  pt,
  ThemeOptions,
  VisibilityWrapper,
  EntityField,
  YextEntityField,
  YextField,
  TranslatableString,
  useDocument,
  resolveComponentData,
  Heading,
} from "@yext/visual-editor";
import { useTranslation } from "react-i18next";

export interface VideoData {
  /**
   * The main heading for the video section.
   * @defaultValue "" (constant)
   */
  heading: YextEntityField<TranslatableString>;

  /** The embedded YouTube video */
  video: string;
}

export interface VideoStyles {
  /**
   * The background color for the entire section, selected from the theme.
   * @defaultValue Background Color 1
   */
  backgroundColor?: BackgroundStyle;

  /** Styling for the main section heading. */
  heading: {
    level: HeadingLevel;
    align: "left" | "center" | "right";
  };
}

export interface VideoSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: VideoData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: VideoStyles;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const videoSectionFields: Fields<VideoSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      heading: YextField<any, TranslatableString>(
        msg("fields.headingText", "Heading Text"),
        {
          type: "entityField",
          filter: { types: ["type.string"] },
        }
      ),
      video: YextField(msg("fields.video", "Video"), {
        type: "text",
      }),
    },
  }),
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
      heading: YextField(msg("fields.heading", "Heading"), {
        type: "object",
        objectFields: {
          level: YextField(msg("fields.level", "Level"), {
            type: "select",
            hasSearch: true,
            options: "HEADING_LEVEL",
          }),
          align: YextField(msg("fields.headingAlign", "Heading Align"), {
            type: "radio",
            options: ThemeOptions.ALIGNMENT,
          }),
        },
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

const VideoSectionComponent = (props: VideoSectionProps) => {
  const { data, styles } = props;
  const { t, i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();

  const resolvedHeading = resolveComponentData(
    data.heading,
    locale,
    streamDocument
  );

  const justifyClass = styles?.heading?.align
    ? {
        left: "justify-start",
        center: "justify-center",
        right: "justify-end",
      }[styles.heading.align]
    : "justify-start";

  return (
    <PageSection
      background={styles.backgroundColor}
      className="flex flex-col gap-8"
    >
      {resolvedHeading && (
        <EntityField
          displayName={pt("fields.headingText", "Heading Text")}
          fieldId={data.heading.field}
          constantValueEnabled={data.heading.constantValueEnabled}
        >
          <div className={`flex ${justifyClass}`}>
            <Heading level={styles?.heading?.level}>{resolvedHeading}</Heading>
          </div>
        </EntityField>
      )}
      <div className="relative aspect-video w-full lg:w-4/5 mx-auto">
        <iframe
          src={data.video}
          title={t("youtubeIframeTitle", "YouTube video player")}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          className="absolute top-0 left-0 w-full h-full"
        />
      </div>
    </PageSection>
  );
};

/**
 * The Video Section is used to display an embedded YouTube video.
 * Available on Location templates.
 */
export const VideoSection: ComponentConfig<VideoSectionProps> = {
  label: msg("components.videoSection", "Video Section"),
  fields: videoSectionFields,
  defaultProps: {
    styles: {
      backgroundColor: backgroundColors.background1.value,
      heading: {
        level: 2,
        align: "left",
      },
    },
    data: {
      video: "",
      heading: {
        field: "",
        constantValue: { en: "", hasLocalizedValue: "true" },
        constantValueEnabled: true,
      },
    },
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
    >
      <VideoSectionComponent {...props} />
    </VisibilityWrapper>
  ),
};
