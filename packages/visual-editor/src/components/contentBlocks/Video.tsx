import { ComponentConfig, Fields } from "@measured/puck";
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

const VideoComponent = (props: VideoProps) => {
  const { data } = props;

  return data?.assetVideo?.video?.embeddedUrl ? (
    <VideoAtom
      youTubeEmbedUrl={data.assetVideo.video.embeddedUrl}
      title={data?.assetVideo?.video?.title ?? ""}
      className="lg:w-4/5 mx-auto mt-8"
    />
  ) : null;
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
