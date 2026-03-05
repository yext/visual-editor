// @ts-nocheck
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import {
  TranslatableString,
  YextEntityField,
  YextField,
  resolveComponentData,
  useDocument,
} from "../ve.ts";
import { useTranslation } from "react-i18next";
import { toTranslatableString } from "../atoms/defaults.ts";

type ImageValue = {
  url?: string;
  width?: number;
  height?: number;
  image?: {
    url?: string;
    width?: number;
    height?: number;
  };
};

const resolveImageUrl = (value: ImageValue | undefined): string => {
  if (!value) {
    return "";
  }
  if (value.url) {
    return value.url;
  }
  if (value.image?.url) {
    return value.image.url;
  }
  return "";
};

export interface YetiHeroImageSlotProps {
  data: {
    image: YextEntityField<ImageValue>;
    altText: TranslatableString;
  };
  styles: {
    minHeight: number;
  };
}

const fields: Fields<YetiHeroImageSlotProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      image: YextField("Image", {
        type: "entityField",
        filter: { types: ["type.image"] },
      }),
      altText: YextField("Alt Text", {
        type: "translatableString",
        filter: { types: ["type.string"] },
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      minHeight: YextField("Min Height", {
        type: "number",
        min: 200,
      }),
    },
  }),
};

const YetiHeroImageSlotComponent: PuckComponent<YetiHeroImageSlotProps> = ({
  data,
  styles,
}) => {
  const streamDocument = useDocument();
  const { i18n } = useTranslation();

  const image = resolveComponentData(
    data.image,
    i18n.language,
    streamDocument
  ) as ImageValue | undefined;
  const altText = resolveComponentData(
    data.altText,
    i18n.language,
    streamDocument
  );
  const imageUrl = resolveImageUrl(image);

  if (!imageUrl) {
    return (
      <div
        style={{ minHeight: styles.minHeight }}
        className="w-full bg-neutral-200"
      />
    );
  }

  return (
    <img
      src={imageUrl}
      alt={typeof altText === "string" ? altText : "Location image"}
      className="block h-full w-full object-cover"
      style={{ minHeight: styles.minHeight }}
      loading="lazy"
    />
  );
};

export const defaultYetiHeroImageSlotProps: YetiHeroImageSlotProps = {
  data: {
    image: {
      field: "",
      constantValue: {
        url: "https://yeti-webmedia.imgix.net/m/7f27a5902316a8a9/original/230107_PLP_BMD_3-0_Paragraph_Lifestyle_Denver_Desktop-2x.jpg?auto=format,compress",
        width: 1920,
        height: 1080,
      },
      constantValueEnabled: true,
    },
    altText: toTranslatableString("YETI store hero"),
  },
  styles: {
    minHeight: 500,
  },
};

export const YetiHeroImageSlot: ComponentConfig<{
  props: YetiHeroImageSlotProps;
}> = {
  label: "Yeti Hero Image Slot",
  fields,
  defaultProps: defaultYetiHeroImageSlotProps,
  render: (props) => <YetiHeroImageSlotComponent {...props} />,
};
