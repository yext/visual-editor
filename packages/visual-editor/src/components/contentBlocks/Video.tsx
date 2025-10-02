import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import { AssetVideo, msg, YextField, VideoAtom } from "@yext/visual-editor";

export type VideoProps = {
  data: {
    /** The embedded YouTube video */
    assetVideo: AssetVideo | undefined;
  };
};

const videoFields: Fields<VideoProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      assetVideo: YextField(msg("fields.video", "Video"), {
        type: "video",
      }),
    },
  }),
};

const VideoComponent: PuckComponent<VideoProps> = (props) => {
  const {
    data,
    puck: { isEditing },
  } = props;

  return data?.assetVideo?.video?.embeddedUrl ? (
    <VideoAtom
      youTubeEmbedUrl={data.assetVideo.video.embeddedUrl}
      title={data?.assetVideo?.video?.title ?? ""}
      className="lg:w-4/5 mx-auto mt-8"
    />
  ) : isEditing ? (
    <div className="h-20 mt-8"></div>
  ) : (
    <></>
  );
};

export const Video: ComponentConfig<{
  props: VideoProps;
}> = {
  fields: videoFields,
  label: msg("components.Video", "Video"),
  defaultProps: {
    data: {
      assetVideo: undefined,
    },
  },
  render: (props) => <VideoComponent {...props} />,
};
