import { themeManagerCn } from "@yext/visual-editor";

export type VideoProps = {
  youTubeEmbedUrl: string;
  title: string;
  className?: string;
};

export const Video = (props: VideoProps) => {
  const { youTubeEmbedUrl, title, className } = props;

  return (
    <div className={themeManagerCn("relative aspect-video w-full", className)}>
      <iframe
        src={youTubeEmbedUrl}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        referrerPolicy="strict-origin-when-cross-origin"
        allowFullScreen
        className="absolute top-0 left-0 w-full h-full"
      />
    </div>
  );
};
