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
  Body,
} from "@yext/visual-editor";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import {
  backgroundColors,
  BackgroundStyle,
} from "../../utils/themeConfigOptions.js";
import { CircleSlash2 } from "lucide-react";
import { useTemplateMetadata } from "../../internal/hooks/useMessageReceivers";
import { resolveYextEntityField } from "../../utils/resolveYextEntityField";

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

  /**
   * Indicates which props should not be checked for missing translations.
   * @internal
   */
  ignoreLocaleWarning?: string[];
}

const bannerSectionFields: Fields<BannerSectionProps> = {
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

function isRichTextEmpty(value: any): boolean {
  if (!value) {
    return true;
  }
  if (typeof value === "string") {
    return value.trim() === "";
  }
  if (typeof value === "object") {
    if ("html" in value) {
      return !value.html || value.html.trim() === "";
    }
    if ("json" in value) {
      return (
        !value.json ||
        (typeof value.json === "string" && value.json.trim() === "")
      );
    }
  }
  return false;
}

const BannerComponent: PuckComponent<BannerSectionProps> = ({
  data,
  styles,
  puck,
}) => {
  const { i18n } = useTranslation();
  const locale = i18n.language;
  const streamDocument = useDocument();
  const templateMetadata = useTemplateMetadata();

  const isMappedField = !data.text.constantValueEnabled && !!data.text.field;
  const rawValue = isMappedField
    ? resolveYextEntityField(streamDocument, data.text, locale)
    : undefined;
  const isEmpty = isMappedField && isRichTextEmpty(rawValue);

  const resolvedText = resolveComponentData(data.text, locale, streamDocument);

  const justifyClass = {
    left: "justify-start",
    center: "justify-center",
    right: "justify-end",
  }[styles.textAlignment];

  // Show empty state in editor mode when mapped field is empty
  if (isMappedField && isEmpty) {
    if (puck.isEditing) {
      const entityTypeDisplayName = templateMetadata?.entityTypeDisplayName;

      return (
        <PageSection
          background={backgroundColors.background1.value}
          verticalPadding="sm"
          className="flex items-center justify-center"
        >
          <div className="relative h-20 w-full bg-gray-100 rounded-lg border border-gray-200 flex flex-row items-center justify-center gap-3 px-4">
            <CircleSlash2 className="w-10 h-10 text-gray-400 flex-shrink-0" />
            <div className="flex flex-col items-start gap-0">
              <Body variant="sm" className="text-gray-500 font-medium">
                {pt(
                  "emptyStateSectionHidden",
                  "Section hidden for this {{entityType}}",
                  {
                    entityType: entityTypeDisplayName
                      ? entityTypeDisplayName.toLowerCase()
                      : "page",
                  }
                )}
              </Body>
              <Body variant="sm" className="text-gray-500 font-normal">
                {pt(
                  "emptyStateFieldEmpty",
                  "{{entityType}}'s mapped field is empty",
                  {
                    entityType: entityTypeDisplayName
                      ? entityTypeDisplayName.charAt(0).toUpperCase() +
                        entityTypeDisplayName.slice(1)
                      : "Entity",
                  }
                )}
              </Body>
            </div>
          </div>
        </PageSection>
      );
    }
    return <></>;
  }

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

export const defaultBannerProps: BannerSectionProps = {
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
  ignoreLocaleWarning: ["data.text"],
};

/**
 * The Banner Section component displays a single, translatable line of rich text. It's designed to be used as a simple, full-width banner on a page.
 * Available on Location templates.
 */
export const BannerSection: ComponentConfig<{ props: BannerSectionProps }> = {
  label: msg("components.bannerSection", "Banner Section"),
  fields: bannerSectionFields,
  defaultProps: defaultBannerProps,
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
