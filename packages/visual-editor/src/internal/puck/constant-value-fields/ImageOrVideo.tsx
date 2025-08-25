import { AutoField, CustomField, FieldLabel } from "@measured/puck";
import { AssetImageType } from "../../../types/images";
import { AssetVideo } from "../../../types/videos";
import { pt } from "../../../utils/i18n/platform";
import { IMAGE_CONSTANT_CONFIG } from "./Image";
import { VIDEO_CONSTANT_CONFIG } from "./Video";

const PLACEHOLDER_IMAGE = {
  url: "https://placehold.co/640x360",
  width: 640,
  height: 360,
  assetImage: {},
};
const PLACEHOLDER_VIDEO = {
  id: "",
  name: "",
  video: {
    url: "",
    id: "",
    title: "",
    duration: "",
    thumbnail: "",
    embeddedUrl: "",
  },
};

export const IMAGE_OR_VIDEO_CONSTANT_CONFIG: CustomField<
  AssetImageType | AssetVideo | undefined
> = {
  type: "custom",
  render: ({ onChange, value }) => {
    const valueType = value && "video" in value ? "video" : "image";

    return (
      <>
        <FieldLabel
          label={pt("mediaType", "Media Type")}
          el="div"
          className="ve-mt-3"
        >
          <AutoField
            field={{
              type: "radio",
              options: [
                { label: pt("image", "Image"), value: "image" },
                { label: pt("video", "Video"), value: "video" },
              ],
            }}
            value={valueType}
            onChange={(v) =>
              onChange(v === "image" ? PLACEHOLDER_IMAGE : PLACEHOLDER_VIDEO)
            }
          />
        </FieldLabel>
        <AutoField
          value={value}
          onChange={onChange}
          field={
            valueType === "image"
              ? IMAGE_CONSTANT_CONFIG
              : VIDEO_CONSTANT_CONFIG
          }
        />
      </>
    );
  },
};
