import * as React from "react";
import { ComponentConfig, Fields, PuckComponent } from "@puckeditor/core";
import { Body, BodyProps } from "../atoms/body.tsx";
import { useDocument } from "../../hooks/useDocument.tsx";
import { resolveComponentData } from "../../utils/resolveComponentData.tsx";
import { EntityField } from "../../editor/EntityField.tsx";
import { YextEntityField } from "../../editor/YextEntityFieldSelector.tsx";
import { YextField } from "../../editor/YextField.tsx";
import { msg, pt } from "../../utils/i18n/platform.ts";
import { TranslatableRichText, TranslatableString } from "../../types/types.ts";
import { useTranslation } from "react-i18next";
import { resolveDataFromParent } from "../../editor/ParentData.tsx";
import { BackgroundStyle } from "../../utils/themeConfigOptions.ts";
import { normalizeThemeColor } from "../../utils/normalizeThemeColor.ts";
import { themeManagerCn } from "../../utils/cn.ts";
import { defaultText } from "../../utils/defaultContent.ts";

export type TextProps = {
  data: {
    /** The text to display. */
    text: YextEntityField<TranslatableString | TranslatableRichText>;
  };

  styles: {
    /** The size of the text. */
    variant: BodyProps["variant"];
    /** Optional text color override. */
    color?: BackgroundStyle;
    /** Optional font style override. */
    fontStyle: "regular" | "bold" | "italic";
  };

  /** @internal Controlled data from the parent section. */
  parentData?: {
    field: string;
    text: TranslatableString | TranslatableRichText | undefined;
  };

  /** @internal Controlled style from the parent section */
  parentStyles?: {
    className: string;
  };
};

const textFields: Fields<TextProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      text: YextField<any, TranslatableString | TranslatableRichText>(
        msg("fields.text", "Text"),
        {
          type: "entityField",
          filter: {
            types: ["type.string", "type.rich_text_v2"],
          },
        }
      ),
    },
  }),
  styles: YextField(msg("fields.styles", "Styles"), {
    type: "object",
    objectFields: {
      variant: YextField(msg("fields.textSize", "Text Size"), {
        type: "radio",
        options: "BODY_VARIANT",
      }),
      color: YextField(msg("fields.color", "Color"), {
        type: "select",
        options: "SITE_COLOR",
      }),
      fontStyle: YextField(msg("fields.fontStyle", "Font Style"), {
        type: "radio",
        options: [
          { label: msg("fields.options.regular", "Regular"), value: "regular" },
          { label: msg("fields.options.bold", "Bold"), value: "bold" },
          { label: msg("fields.options.italic", "Italic"), value: "italic" },
        ],
      }),
    },
  }),
};

const fontStyleToClassName: Record<
  NonNullable<TextProps["styles"]["fontStyle"]>,
  string
> = {
  regular: "",
  bold: "font-bold",
  italic: "italic",
};

const TextComponent: PuckComponent<TextProps> = (props) => {
  const { data, styles, puck, parentData, parentStyles } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();

  const sourceData = parentData ? parentData.text : data.text;
  const resolvedData = sourceData
    ? resolveComponentData(sourceData, i18n.language, streamDocument, {
        output: "plainText",
      })
    : "";

  const dynamicStyle = styles.color?.bgColor
    ? { color: `var(--colors-${normalizeThemeColor(styles.color.bgColor)})` }
    : undefined;

  return resolvedData ? (
    <EntityField
      displayName={pt("text", "Text")}
      fieldId={parentData ? parentData.field : data.text.field}
      constantValueEnabled={!parentData && data.text.constantValueEnabled}
    >
      <Body
        variant={styles.variant}
        className={themeManagerCn(
          fontStyleToClassName[styles.fontStyle],
          parentStyles?.className
        )}
        style={dynamicStyle}
      >
        {resolvedData}
      </Body>
    </EntityField>
  ) : puck.isEditing ? (
    <div className="h-[30px] min-w-[100px]" />
  ) : (
    <></>
  );
};

export const Text: ComponentConfig<{ props: TextProps }> = {
  label: msg("components.text", "Text"),
  fields: textFields,
  resolveFields: (data) => resolveDataFromParent(textFields, data),
  defaultProps: {
    data: {
      text: {
        field: "",
        constantValue: defaultText("componentDefaults.text", "Text"),
        constantValueEnabled: true,
      },
    },
    styles: {
      variant: "base",
      fontStyle: "regular",
    },
  },
  render: (props) => <TextComponent {...props} />,
};
