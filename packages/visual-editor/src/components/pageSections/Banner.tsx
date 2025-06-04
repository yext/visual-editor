import { useTranslation } from "react-i18next";
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
import { TranslatableString } from "../../editor/YextEntityFieldSelector.tsx";
import { resolveTranslatableString } from "../../utils/resolveYextEntityField.ts";

export type BannerSectionProps = {
  styles: {
    backgroundColor?: BackgroundStyle;
    textAlignment: "left" | "right" | "center";
  };
  data: {
    text: YextEntityField<TranslatableString>;
  };
  liveVisibility: boolean;
};

const bannerSectionFields: Fields<BannerSectionProps> = {
  data: YextField("Data", {
    type: "object",
    objectFields: {
      text: YextField<any, TranslatableString>("Text", {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
        locales: ["en", "es", "fr"],
      }),
    },
  }),
  styles: YextField("Styles", {
    type: "object",
    objectFields: {
      backgroundColor: YextField("Background Color", {
        type: "select",
        hasSearch: true,
        options: "DARK_BACKGROUND_COLOR",
      }),
      textAlignment: YextField("Text Alignment", {
        type: "radio",
        options: "ALIGNMENT",
      }),
    },
  }),
  liveVisibility: YextField("Visible on Live Page", {
    type: "radio",
    options: [
      { label: "Show", value: true },
      { label: "Hide", value: false },
    ],
  }),
};

const BannerComponent = ({ data, styles }: BannerSectionProps) => {
  const { t } = useTranslation();
  const document = useDocument();
  const resolvedText = resolveYextEntityField<TranslatableString>(
    document,
    data.text
  );

  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[styles.textAlignment];

  return (
    <PageSection
      background={styles.backgroundColor}
      verticalPadding="sm"
      className={`flex ${justifyClass} items-center`}
    >
      <EntityField
        displayName={t("bannerText", "Banner Text")}
        fieldId={data.text.field}
        constantValueEnabled={data.text.constantValueEnabled}
      >
        <Body>{resolveTranslatableString(resolvedText)}</Body>
      </EntityField>
    </PageSection>
  );
};

export const BannerSection: ComponentConfig<BannerSectionProps> = {
  label: "Banner Section",
  fields: bannerSectionFields,
  defaultProps: {
    data: {
      text: {
        field: "",
        constantValue: "Banner Text",
        constantValueEnabled: true,
      },
    },
    styles: {
      backgroundColor: backgroundColors.background6.value,
      textAlignment: "center",
    },
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
