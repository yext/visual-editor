import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  YextEntityField,
  resolveYextEntityField,
  useDocument,
  PageSection,
  YextField,
  VisibilityWrapper,
  EntityField,
  TranslatableRichText,
  resolveTranslatableRichText,
  msg,
  pt,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
} from "../../utils/themeConfigOptions.js";

export interface BannerData {
  /**
   * The rich text to display. It can be linked to a Yext entity field or set as a constant value.
   * @defaultValue "Banner Text" (constant)
   */
  text: YextEntityField<TranslatableRichText>;
}

export interface BannerStyles {
  /**
   * The background color of the section.
   * @defaultValue Background Color 6
   */
  backgroundColor?: BackgroundStyle;
  /**
   * The horizontal alignment of the text.
   * @defaultValue center
   */
  textAlignment: "left" | "right" | "center";
}

export interface BannerSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: BannerData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: BannerStyles;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;
}

const bannerSectionFields: Fields<BannerSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      text: YextField<any, TranslatableRichText>(msg("fields.text", "Text"), {
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
          options: "BACKGROUND_COLOR",
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
  const resolvedText = resolveTranslatableRichText(
    resolveYextEntityField<TranslatableRichText>(document, data.text),
    i18n.language
  );

  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[styles.textAlignment];

  if (!resolvedText) {
    return <></>;
  }

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
        {resolvedText}
      </EntityField>
    </PageSection>
  );
};

/**
 * The Banner Section component displays a single, translatable line of rich text. It's designed to be used as a simple, full-width banner on a page.
 * Avaliable on Location templates.
 */
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
