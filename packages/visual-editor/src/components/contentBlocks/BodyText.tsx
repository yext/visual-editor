import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields, PuckComponent } from "@measured/puck";
import {
  BodyProps,
  useDocument,
  resolveComponentData,
  EntityField,
  YextEntityField,
  YextField,
  pt,
  msg,
  TranslatableRichText,
  useBackground,
  resolveDataFromParent,
  Body,
  themeManagerCn,
} from "@yext/visual-editor";

export type BodyTextProps = {
  data: {
    /** The body text to display. */
    text: YextEntityField<TranslatableRichText>;
  };

  styles: {
    /** The size of the body text. */
    variant: BodyProps["variant"];
    /** The weight of the body text. */
    fontWeight?: "bold" | "normal";
  };

  /**
   * @internal Controlled data from the parent section.
   */
  parentData?: {
    field: string;
    richText: TranslatableRichText | undefined;
  };

  /** @internal Controlled style from the parent section */
  parentStyles?: {
    className: string;
  };
};

const bodyTextFields: Fields<BodyTextProps> = {
  data: YextField(msg("fields.data", "Data"), {
    type: "object",
    objectFields: {
      text: YextField(msg("fields.text", "Text"), {
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
      variant: YextField(msg("fields.variant", "Variant"), {
        type: "radio",
        options: "BODY_VARIANT",
      }),
      fontWeight: YextField(msg("fields.fontWeight", "Font Weight"), {
        type: "radio",
        options: [
          { label: msg("fields.options.normal", "Normal"), value: "normal" },
          { label: msg("fields.options.bold", "Bold"), value: "bold" },
        ],
      }),
    },
  }),
};

const BodyTextComponent: PuckComponent<BodyTextProps> = (props) => {
  const { data, styles, puck, parentData } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const background = useBackground();

  const sourceData = parentData ? parentData?.richText : data.text;
  const fontWeightClass = styles.fontWeight === "bold" ? "font-bold" : "";
  const className = themeManagerCn(
    props.parentStyles?.className,
    fontWeightClass
  );

  const resolvedData = sourceData
    ? resolveComponentData(sourceData, i18n.language, streamDocument, {
        variant: styles.variant,
        isDarkBackground: background?.isDarkBackground,
        className,
      })
    : undefined;

  return resolvedData ? (
    <EntityField
      displayName={pt("body", "Body")}
      fieldId={parentData ? parentData.field : data.text.field}
      constantValueEnabled={data.text.constantValueEnabled}
    >
      {React.isValidElement(resolvedData) ? (
        resolvedData
      ) : (
        <Body variant={styles.variant} className={fontWeightClass}>
          {resolvedData}
        </Body>
      )}
    </EntityField>
  ) : puck.isEditing ? (
    <div className="h-[60px] min-w-[100px]" />
  ) : (
    <></>
  );
};

export const BodyText: ComponentConfig<{ props: BodyTextProps }> = {
  label: msg("components.bodyText", "Body Text"),
  fields: bodyTextFields,
  resolveFields: (data) => resolveDataFromParent(bodyTextFields, data),
  defaultProps: {
    data: {
      text: {
        field: "",
        constantValue: {
          en: "Text",
          hasLocalizedValue: "true",
        },
        constantValueEnabled: true,
      },
    },
    styles: {
      variant: "base",
    },
  },
  render: (props) => <BodyTextComponent {...props} />,
};
