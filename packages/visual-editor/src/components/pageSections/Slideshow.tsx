import { useTranslation } from "react-i18next";
import * as React from "react";
import {
  YextEntityField,
  resolveComponentData,
  useDocument,
  PageSection,
  YextField,
  VisibilityWrapper,
  EntityField,
  TranslatableRichText,
  msg,
  pt,
} from "@yext/visual-editor";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
} from "../../utils/themeConfigOptions.js";

export interface SlideshowData {
  /**
   * The rich text to display. It can be linked to a Yext entity field or set as a constant value.
   * @defaultValue "Slideshow Text" (constant)
   */
  text: YextEntityField<TranslatableRichText>;
}

export interface SlideshowStyles {
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

export interface SlideshowSectionProps {
  /**
   * This object contains the content to be displayed by the component.
   * @propCategory Data Props
   */
  data: SlideshowData;

  /**
   * This object contains properties for customizing the component's appearance.
   * @propCategory Style Props
   */
  styles: SlideshowStyles;

  /**
   * If 'true', the component is visible on the live page; if 'false', it's hidden.
   * @defaultValue true
   */
  liveVisibility: boolean;

  /**
   * Indicates which props should not be checked for missing translations.
   * @internal
   */
  ignoreLocaleWarning?: string[];
}

const SlideshowSectionFields: Fields<SlideshowSectionProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      text: YextField<any, TranslatableRichText>(msg("fields.text", "Text"), {
        type: "entityField",
        filter: {
          types: ["type.rich_text_v2"],
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

const SlideshowComponent = ({ data, styles }: SlideshowSectionProps) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const resolvedText = resolveComponentData(data.text, locale, streamDocument);

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
        displayName={pt("fields.SlideshowText", "Slideshow Text")}
        fieldId={data.text.field}
        constantValueEnabled={data.text.constantValueEnabled}
      >
        {resolvedText}
      </EntityField>
    </PageSection>
  );
};

export const defaultSlideshowProps: SlideshowSectionProps = {
  data: {
    text: {
      field: "",
      constantValue: {
        en: "Slideshow Text",
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
  ignoreLocaleWarning: ["data.text"],
};

/**
 * The Slideshow Section component displays a single, translatable line of rich text. It's designed to be used as a simple, full-width Slideshow on a page.
 * Available on Location templates.
 */
export const SlideshowSection: ComponentConfig<{
  props: SlideshowSectionProps;
}> = {
  label: msg("components.SlideshowSection", "Slideshow Section"),
  fields: SlideshowSectionFields,
  defaultProps: defaultSlideshowProps,
  render: (props) => (
    <VisibilityWrapper
      liveVisibility={props.liveVisibility}
      isEditing={props.puck.isEditing}
      iconSize="md"
    >
      <SlideshowComponent {...props} />
    </VisibilityWrapper>
  ),
};
