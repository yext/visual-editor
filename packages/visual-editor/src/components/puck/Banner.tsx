import * as React from "react";
import {
  YextEntityField,
  resolveYextEntityField,
  YextEntityFieldSelector,
  useDocument,
  FontSizeSelector,
  BasicSelector,
  getFontWeightOverrideOptions,
} from "../../index.ts";
import { Body, BodyProps } from "./atoms/body.js";
import { BasicSelector } from "../editor/BasicSelector.tsx";
import { ComponentConfig, Fields } from "@measured/puck";

export type BannerProps = {
  text: YextEntityField<string>;
  textAlignment: "justify-end" | "justify-start" | "justify-center";
  fontSize: BodyProps["fontSize"];
  fontWeight?: BodyProps["fontWeight"];
  textColor: BodyProps["color"];
  backgroundColor:
    | "bg-palette-primary"
    | "bg-palette-secondary"
    | "bg-palette-accent"
    | "bg-palette-text"
    | "bg-palette-background";
};

const bannerFields: Fields<BannerProps> = {
  text: YextEntityFieldSelector<any, string>({
    label: "Entity Field",
    filter: {
      types: ["type.string"],
    },
  }),
  textAlignment: {
    label: "Text Alignment",
    type: "radio",
    options: [
      { label: "Left", value: "justify-start" },
      { label: "Center", value: "justify-center" },
      { label: "Right", value: "justify-end" },
    ],
  },
  fontSize: FontSizeSelector(),
  textColor: BasicSelector("Text Color", [
    { label: "Default", value: "default" },
    { label: "Primary", value: "primary" },
    { label: "Secondary", value: "secondary" },
    { label: "Accent", value: "accent" },
    { label: "Text", value: "text" },
    { label: "Background", value: "background" },
  ]),
  backgroundColor: BasicSelector("Background Color", [
    { label: "Background", value: "bg-palette-background" },
    { label: "Primary", value: "bg-palette-primary" },
    { label: "Secondary", value: "bg-palette-secondary" },
    { label: "Accent", value: "bg-palette-accent" },
    { label: "Text", value: "bg-palette-text" },
  ]),
};

const BannerComponent = ({
  text,
  textAlignment,
  fontSize,
  fontWeight,
  textColor,
  backgroundColor,
}: BannerProps) => {
  const document = useDocument();
  const resolvedText = resolveYextEntityField<string>(document, text);
  return (
    <div className={`Banner ${backgroundColor} components px-4 md:px-20 py-6`}>
      <div className={`flex ${textAlignment} items-center`}>
        <Body color={textColor} fontWeight={fontWeight} fontSize={fontSize}>
          {resolvedText}
        </Body>
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
    textAlignment: "justify-center",
    fontSize: "default",
    fontWeight: "default",
    textColor: "default",
    backgroundColor: "bg-palette-background",
  },
  resolveFields: async () => {
    const fontWeightOptions = await getFontWeightOverrideOptions({
      fontCssVariable: "--fontFamily-body-fontFamily",
    });
    return {
      ...bannerFields,
      fontWeight: BasicSelector("Font Weight", fontWeightOptions),
    };
  },
  render: (props) => <BannerComponent {...props} />,
};
