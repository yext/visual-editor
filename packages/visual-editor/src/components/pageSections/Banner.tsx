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
  TranslatableString,
  resolveTranslatableString,
  msg,
  pt,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
} from "../../utils/themeConfigOptions.js";

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
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      text: YextField<any, TranslatableString>(msg("fields.text", "Text"), {
        type: "entityField",
        filter: {
          types: ["type.string"],
        },
      }),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      backgroundColor: YextField(
        msg("fields.backgroundColor", "Background Color"),
        {
          type: "select",
          hasSearch: true,
          options: "DARK_BACKGROUND_COLOR",
        }
      ),
      textAlignment: YextField(msg("fields.textAlignment", "Text Alignment"), {
        type: "radio",
        options: "ALIGNMENT",
      }),
    },
  }),
  liveVisibility: YextField(
    msg("fields.visibleOnLivePage", "Visible on Live Page"),
    {
      type: "radio",
      options: [
        { label: msg("fields.options.show", "Show"), value: true },
        { label: msg("fields.options.hide", "Hide"), value: false },
      ],
    }
  ),
};

const BannerComponent = ({ data, styles }: BannerSectionProps) => {
  const { i18n } = useTranslation();
  const document = useDocument();
  const resolvedText = resolveTranslatableString(
    resolveYextEntityField<TranslatableString>(document, data.text),
    i18n.language
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
        displayName={pt("fields.bannerText", "Banner Text")}
        fieldId={data.text.field}
        constantValueEnabled={data.text.constantValueEnabled}
      >
        <Body>{resolvedText}</Body>
      </EntityField>
    </PageSection>
  );
};

export const BannerSection: ComponentConfig<BannerSectionProps> = {
  label: msg("components.bannerSection", "Banner Section"),
  fields: bannerSectionFields,
  defaultProps: {
    data: {
      text: {
        field: "",
        constantValue: {
          en: "Banner Text",
          hasLocalizedValue: "true",
        },
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
