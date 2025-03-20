import * as React from "react";
import {
  YextEntityField,
  resolveYextEntityField,
  YextEntityFieldSelector,
  useDocument,
  BasicSelector,
} from "../../index.js";
import { Body } from "./atoms/body.js";
import { ComponentConfig, Fields } from "@measured/puck";

export type BannerProps = {
  text: YextEntityField<string>;
  textAlignment: "left" | "right" | "center";
  backgroundColor: "bg-palette-primary" | "bg-palette-secondary";
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
    options: [
      { label: "Left", value: "left" },
      { label: "Center", value: "center" },
      { label: "Right", value: "right" },
    ],
  },
  backgroundColor: BasicSelector("Background Color", [
    { label: "Dark Primary", value: "bg-palette-primary" },
    { label: "Dark Secondary", value: "bg-palette-secondary" },
  ]),
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

  const textColor =
    backgroundColor === "bg-palette-primary" ? "secondary" : "primary";

  return (
    <div className={`Banner ${backgroundColor} components px-4 md:px-20 py-6`}>
      <div className={`flex ${justifyClass} items-center`}>
        <Body color={textColor}>{resolvedText}</Body>
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
    backgroundColor: "bg-palette-primary",
  },
  render: (props) => <BannerComponent {...props} />,
};
