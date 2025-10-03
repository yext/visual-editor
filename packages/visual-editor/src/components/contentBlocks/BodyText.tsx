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
} from "@yext/visual-editor";

export type BodyTextProps = {
  data: {
    text: YextEntityField<TranslatableRichText>;
  };
  styles: {
    variant: BodyProps["variant"];
  };
  parentData?: {
    field: string;
    richText: TranslatableRichText;
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
    },
  }),
};

const BodyTextComponent: PuckComponent<BodyTextProps> = (props) => {
  const { data, styles, puck, parentData } = props;
  const { i18n } = useTranslation();
  const streamDocument = useDocument();
  const background = useBackground();

  const resolvedData = resolveComponentData(
    parentData ? parentData.richText : data.text,
    i18n.language,
    streamDocument,
    {
      variant: styles.variant,
      isDarkBackground: background?.isDarkBackground,
    }
  );

  return resolvedData ? (
    <EntityField
      displayName={pt("body", "Body")}
      fieldId={parentData ? parentData.field : data.text.field}
      constantValueEnabled={data.text.constantValueEnabled}
    >
      {resolvedData}
    </EntityField>
  ) : puck.isEditing ? (
    <div className="h-[60px]" />
  ) : (
    <></>
  );
};

export const BodyText: ComponentConfig<{ props: BodyTextProps }> = {
  label: msg("components.bodyText", "Body Text"),
  fields: bodyTextFields,
  resolveFields: (data) => {
    if (data.props.parentData) {
      return {
        ...bodyTextFields,
        data: {
          label: msg("fields.data", "Data"),
          type: "object",
          objectFields: {
            info: {
              type: "custom",
              render: () => (
                <p style={{ fontSize: "var(--puck-font-size-xxs)" }}>
                  Data is inherited from the parent section.
                </p>
              ),
            },
          },
        },
      } as any;
    }
    return bodyTextFields;
  },
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
