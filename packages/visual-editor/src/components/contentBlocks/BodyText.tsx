import { useTranslation } from "react-i18next";
import * as React from "react";
import { ComponentConfig, Fields } from "@measured/puck";
import {
  Body,
  BodyProps,
  useDocument,
  resolveComponentData,
  EntityField,
  YextEntityField,
  YextField,
  pt,
  msg,
  TranslatableRichText,
} from "@yext/visual-editor";

export type BodyTextProps = {
  data: {
    text: YextEntityField<TranslatableRichText>;
  };
  styles: {
    variant: BodyProps["variant"];
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

const BodyTextComponent = React.forwardRef<HTMLParagraphElement, BodyTextProps>(
  ({ data, styles }, ref) => {
    const { i18n } = useTranslation();
    const streamDocument = useDocument();

    return (
      <EntityField
        displayName={pt("body", "Body")}
        fieldId={data.text.field}
        constantValueEnabled={data.text.constantValueEnabled}
      >
        <Body ref={ref} {...styles}>
          {resolveComponentData(data.text, i18n.language, streamDocument)}
        </Body>
      </EntityField>
    );
  }
);

export const BodyText: ComponentConfig<BodyTextProps> = {
  label: msg("components.bodyText", "Body Text"),
  fields: bodyTextFields,
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
