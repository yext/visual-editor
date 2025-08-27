type Video = {
  /** The YouTube video URL */ url: string;
  /** The YouTube video ID */
  id: string;
  /** The YouTube video title */
  title: string;
  /** The YouTube video thumbnail URL */
  thumbnail: string;
  /** The YouTube video duration */
  duration: string;
  /** The embedded YouTube video URL (https://youtube.com/embed/<video_id>) */
  embeddedUrl: string;
};

export type AssetVideo = {
  video: Video;
  /** Asset video description field */
  videoDescription?: string;
  /** Asset name (unique) */
  name: string;
  /** Asset internal id */
  id: string;
};
