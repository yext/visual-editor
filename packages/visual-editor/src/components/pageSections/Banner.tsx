import * as React from "react";
import {
  YextEntityField,
  resolveYextEntityField,
  useDocument,
  Body,
  PageSection,
  YextField,
  VisibilityWrapper,
  EntityField,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
} from "../../utils/themeConfigOptions.js";

export type BannerSectionProps = {
  text: YextEntityField<string>;
  textAlignment: "left" | "right" | "center";
  backgroundColor?: BackgroundStyle;
  liveVisibility: boolean;
};

const bannerSectionFields: Fields<BannerSectionProps> = {
  text: YextField<any, string>("Text", {
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
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
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
      <EntityField
        displayName="Banner Text"
        fieldId={text.field}
        constantValueEnabled={text.constantValueEnabled}
      >
        <Body>{resolvedText}</Body>
      </EntityField>
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
    liveVisibility: true,
  },
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
      iconSize="md"
    >
      <BannerComponent {...props} />
    </VisibilityWrapper>
  ),
};
