import * as React from "react";
import {
  YextEntityField,
  resolveYextEntityField,
  YextEntityFieldSelector,
  useDocument,
  BasicSelector,
  ThemeOptions,
  Body,
} from "../../index.js";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
} from "../../utils/themeConfigOptions.js";

export type BannerProps = {
  text: YextEntityField<string>;
  textAlignment: "left" | "right" | "center";
  backgroundColor?: BackgroundStyle;
};

const bannerFields: Fields<BannerProps> = {
  text: YextEntityFieldSelector<any, string>({
    label: "Text",
    filter: {
      types: ["type.string"],
    },
  }),
  textAlignment: {
    label: "Text Alignment",
    type: "radio",
    options: ThemeOptions.ALIGNMENT,
  },
  backgroundColor: BasicSelector(
    "Background Color",
    // only allow the dark backgrounds
    Object.values({
      dark1: backgroundColors.background6,
      dark2: backgroundColors.background7,
    })
  ),
};

const BannerComponent = ({
  text,
  textAlignment,
  backgroundColor,
}: BannerProps) => {
  const document = useDocument();
  const resolvedText = resolveYextEntityField<string>(document, text);

  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[textAlignment];

  return (
    <div
      className={`Banner ${backgroundColor?.bgColor} components px-4 md:px-20 py-6`}
    >
      <div
        className={`flex ${justifyClass} items-center ${backgroundColor?.textColor}`}
      >
        <Body>{resolvedText}</Body>
      </div>
    </div>
  );
};

export const Banner: ComponentConfig<BannerProps> = {
  fields: bannerFields,
  defaultProps: {
    text: {
      field: "",
      constantValue: "Banner Text",
      constantValueEnabled: true,
    },
    textAlignment: "center",
    backgroundColor: backgroundColors.background6.value,
  },
  render: (props) => <BannerComponent {...props} />,
};
