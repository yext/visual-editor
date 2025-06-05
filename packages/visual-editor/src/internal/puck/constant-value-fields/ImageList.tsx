import { ArrayField } from "@measured/puck";
import { ImageType } from "@yext/pages-components";
import { usePlatformTranslation } from "../../../utils/i18nPlatform.ts";

export const IMAGE_LIST_CONSTANT_CONFIG = (): ArrayField<ImageType[]> => {
  const { t } = usePlatformTranslation();

  return {
    label: "",
    type: "array",
    arrayFields: {
      url: {
        type: "text",
        label: t("url", "URL"),
      },
      height: {
        type: "text",
        label: t("height", "height"),
      },
      width: {
        type: "text",
        label: t("width", "width"),
      },
    },
  };
};
