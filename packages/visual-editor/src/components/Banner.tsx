import * as React from "react";
import {
  YextEntityField,
  resolveYextEntityField,
  useDocument,
  Body,
  PageSection,
  YextField,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
} from "../utils/themeConfigOptions.js";

export type BannerSectionProps = {
  text: YextEntityField<string>;
  textAlignment: "left" | "right" | "center";
  backgroundColor?: BackgroundStyle;
};

const bannerSectionFields: Fields<BannerSectionProps> = {
  text: YextField<string>("Text", {
    type: "entityField",
    filter: {
      types: ["type.string"],
    },
  }),
  textAlignment: YextField("Text Alignment", {
    type: "radio",
    options: "ALIGNMENT",
  }),
  backgroundColor: YextField("Background Color", {
    type: "select",
    hasSearch: true,
    options: "DARK_BACKGROUND_COLOR",
  }),
};

const BannerComponent = ({
  text,
  textAlignment,
  backgroundColor,
}: BannerSectionProps) => {
  const document = useDocument();
  const resolvedText = resolveYextEntityField<string>(document, text);

  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[textAlignment];

  return (
    <PageSection
      background={backgroundColor}
      verticalPadding="sm"
      className={`flex ${justifyClass} items-center`}
    >
      <Body>{resolvedText}</Body>
    </PageSection>
  );
};

export const BannerSection: ComponentConfig<BannerSectionProps> = {
  label: "Banner Section",
  fields: bannerSectionFields,
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
